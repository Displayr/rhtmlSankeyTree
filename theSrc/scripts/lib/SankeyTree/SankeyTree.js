import d3 from 'd3'
import _ from 'lodash'
import PlotState from './plotState'
import { createClTips, createRgTips } from './tooltipContent'
import { splitIntoLinesByWord } from './../labelUtils'
const d3Tip = require('d3-tip')
d3Tip(d3)

// TODO shortHand MakeId(prefix) for all the d3 statements
// TODO use shorthand ID in target and source

const ID = 'id'
const NAME = 'name'
const VALUE = 'value'
const CHILDREN = 'sankeyChildren' // 'children' is a reserved field that d3.tree will manipulate, so dont use it !
const STATE_VERSION = 1

class Sankey {
  static initClass () {
    this.widgetIndex = 0
    this.widgetName = 'sankey'
  }

  constructor (unsanitisedRootElement) {
    this.id = `${Sankey.widgetName}-${Sankey.widgetIndex++}`
    this.rootElement = _.has(unsanitisedRootElement, 'length') ? unsanitisedRootElement[0] : unsanitisedRootElement
    this.registeredStateListeners = []

    // bind listeners to self so they can be invoked without losing access to class instance
    this.showNodeTooltip = this.showNodeTooltip.bind(this)
    this.showTruncatedTextTooltip = this.showTruncatedTextTooltip.bind(this)
    this.showTruncatedTerminalTextTooltip = this.showTruncatedTerminalTextTooltip.bind(this)
    this.hideTooltip = this.hideTooltip.bind(this)
  }

  init () {
    this.registeredStateListeners.forEach(dergisterFn => dergisterFn())
    this.rootElement.innerHTML = ''
    d3.select(document).selectAll('.d3-tip').remove()
    d3.select(document).selectAll('#littleTriangle').remove()
    this.updateContainerDimensions()

    _.assign(this, {
      plotState: new PlotState(),
      data: null,
      opts: null,
      registeredStateListeners: [],
      computed: {},
      constants: {
        innerLabelPadding: 1,
        nameFontSize: 10,
        nameFontFamily: 'sans-serif',
        minZoom: 0.1,
        maxZoom: 50,
        stateResizeTolerance: 2,
        pxPerChar: 7, // TODO this is a hack, but might not be worth fixing
        nodeTextDx: 10,
        nodeRectWidth: 5,
        maxLines: 5, // must be odd <-- (NB have not verified this comment ...)
        maxCollisionResolutionAttempts: 7,
        transitionDuration: 400,
        treeMargins: { top: 5, left: 10, bottom: 5, right: 10 },
      },
      parts: {},
    })
  }

  updateContainerDimensions () {
    try {
      const { width, height } = adjustedClientRect(this.rootElement)
      _.assign(this, { width, height })
    } catch (err) {
      err.message = `fail in this.containerDimensions: ${err.message}`
      throw err
    }
  }

  normaliseData (data, opts) {
    let idIterator = 1

    const extractAndRecurse = (node) => {
      return {
        ...(node.treeType && { treeType: node.treeType }), // for tooltips
        ...(node.nodeDistribution && { nodeDistribution: node.nodeDistribution }), // for tooltips
        ...(node.nodeVariables && { nodeVariables: node.nodeVariables }), // for tooltips
        ...(node.overallDistribution && { overallDistribution: node.overallDistribution }), // for tooltips
        regressionData: { // for regression tooltips
          ...(node.y && { y: node.y }),
          ...(node.y0 && { y0: node.y0 }),
          ...(node.n && { n: node.n }),
        },
        [ID]: `${(node[opts.id || ID] || idIterator++)}`.replace(/ /g, ''),
        [NAME]: node[opts.name || NAME],
        [VALUE]: node[opts.value || VALUE],
        [CHILDREN]: _(node[opts.childrenName] || node[CHILDREN] || node._children).map(extractAndRecurse).value(),
        terminalDescription: node.terminalDescription,
        color: node.color,
        n: node.n,
      }
    }

    return extractAndRecurse(data)
  }

  computeThings () {
    const { data, opts } = this

    const unscaledNodeHeightRatio = this.computeNodeHeightRatio(data, opts)
    const nhScale = d3.scale.pow()
      .exponent(2)
      .domain([0.5, 1])
      .range([1, 2])
    const nodeHeightRatio = nhScale(unscaledNodeHeightRatio)

    const { maxLabelLength, meanLabelLength } = this.computeLabelLengthStats(data, opts)

    _.assign(this.computed, {
      nodeHeightRatio,
      maxLabelLength,
      meanLabelLength,
    })
  }

  draw () {
    this.computeThings()
    const { plotState, data, opts, computed, parts, height, width, constants: { minZoom, maxZoom } } = this

    this.rootElement.setAttribute('rhtmlwidget-status', 'loading')

    parts.baseSvg = d3.select(this.rootElement)
      .append('svg')
      .attr('id', this.id)
      .attr('class', 'svg-content-responsive')
      .attr('width', width)
      .attr('height', height)
      // .style('border', '1px solid black') // DEBUG only

    this.baseSvgRectInfo = adjustedClientRect(parts.baseSvg.node())

    parts.tree = d3.layout.tree()
      .size([height, width])
      .children(d => (plotState.isNodeCollapsed(d[ID])) ? null : d[CHILDREN])
      .sort((a, b) => (b[NAME].toLowerCase() < a[NAME].toLowerCase()) ? 1 : -1)

    parts.diagonal = d3.svg.diagonal()
      .projection(d => [d.y, d.x])
      .source(d => (d.ystacky) ? d : d.source)

    parts.zoomListener = d3.behavior.zoom()
      .scaleExtent([minZoom, maxZoom])
      .on('zoom', () => {
        this.hideTooltip()
        this.setZoom(d3.event)
      })

    parts.svgGroup = parts.baseSvg
      .call(parts.zoomListener)
      .append('g')
      .attr('class', 'treeGroup')

    // Define the placement of the root node
    data.x0 = this.height / 2
    data.y0 = 0

    // Size link width based on total n
    parts.wscale = d3.scale.linear()
      .range([0, opts.nodeHeight / computed.nodeHeightRatio])
      .domain([0, data[VALUE]])

    this.update({ initialization: true })

    if (opts.tooltip) {
      parts.tip = d3Tip()
        .attr('class', `d3-tip d3-tip-sankey-${this.id}`)

      parts.tipTriangle = d3.select('body')
        .append('div')
        .attr('id', 'littleTriangle')
        .style('visibility', 'hidden')

      parts.svgGroup.call(parts.tip)
    }

    const zoom = this.plotState.getZoom() || this.calculateNewZoom()
    this.setZoom(zoom)

    this.rootElement.setAttribute('rhtmlwidget-status', 'ready')
  }

  // TODO make the transition param not suck
  setZoom ({ scale, translate }, showTransition = false) {
    const {
      parts: { svgGroup },
      constants: { transitionDuration },
    } = this

    const conditionallyAddTransition = (selection) => (showTransition)
      ? selection.transition().duration(transitionDuration / 2)
      : selection

    // NB this is not necessary when setZoom is called by the zoom listener.
    // but when setZoom is called programatically on toggleNode and on init,
    // we must communicate the new scale and translate to the zoom listener via the two calls below
    this.parts.zoomListener.scale(scale)
    this.parts.zoomListener.translate(translate)

    conditionallyAddTransition(svgGroup).attr('transform', `translate(${translate})scale(${scale})`)
    this.plotState.setZoom({ scale, translate })
  }

  update ({ transitionOrigin = null, initialization = false, showTransition = false } = {}) {
    const {
      data,
      opts,
      parts: { baseSvg, tree, svgGroup, wscale },
      computed: { maxLabelLength },
      constants: {
        innerLabelPadding,
        nameFontSize,
        nameFontFamily,
        pxPerChar,
        nodeTextDx,
        nodeRectWidth,
        maxLines,
        maxCollisionResolutionAttempts,
      },
    } = this

    // Compute the new height, function counts total children of root node and sets tree height accordingly.
    // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
    // This makes the layout more consistent.
    const { width: newWidth, height: newHeight } = this.computeNewDimensions(data)

    tree.size([newHeight, newWidth])
    const nodes = tree.nodes(data)
    const links = tree.links(nodes)

    const initNodeX = nodes[0].x
    nodes.forEach(function (d) {
      d.y = (d.depth * (maxLabelLength * pxPerChar) + nodeTextDx)
      d.x = initNodeX + initNodeX - d.x // flip the tree up and down about the root to conform with R plot
    })

    const node = svgGroup.selectAll('g.node')
      .data(nodes, d => d[ID])

    // Enter any new nodes at the parent's previous position.
    // NB note here the x and y are switched in the transform. This produces a horizontal tree instead of vertical
    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .style('opacity', 0)
      .attr('id', d => `node${d[ID]}`)
      .attr('transform', d => _.has(d, 'parent') ? `translate(${d.parent.y},${d.parent.x})` : `translate(${data.y0},${data.x0})`)

    function toggleNodeDisplay (d) {
      const {
        constants: { transitionDuration },
      } = this

      if (d3.event.defaultPrevented) return // click suppressed

      this.plotState.toggleNodeDisplay(d[ID])
      this.hideTooltip()
      this.update({ transitionOrigin: d, showTransition: true })

      setTimeout(() => {
        let newZoom = this.calculateNewZoom()
        this.setZoom(newZoom, true)
      }, transitionDuration + 10)
    }

    this.parts.nodeRects = nodeEnter.append('rect')
      .attr('class', 'nodeRect')
      .attr('id', d => `nodeRect${d[ID]}`)
      .attr('terminal', 0)
      .attr('x', -nodeRectWidth / 2)
      .attr('y', d => -1 * wscale(d[VALUE]) / 2)
      .attr('height', d => wscale(d[VALUE]))
      .attr('width', nodeRectWidth)
      .on('click', toggleNodeDisplay.bind(this))
      .on('mouseover', this.showNodeTooltip)
      .on('mouseout', this.hideTooltip)

    const shortenedText = nodeEnter.append('g')
      .attr('class', 'shortenedText')
      .attr('id', d => `shortenedText${d[ID]}`)

    const nrect1 = shortenedText.append('rect')
      .attr('class', 'nodeTextBackgroundRect')
      .attr('id', d => `nodeTextBg${d[ID]}`)

    shortenedText.append('text')
      .attr('id', d => `nodeText${d[ID]}`)
      .attr('y', 0) // this is set again after all the tspan are added to -0.5 * computedHeight
      .attr('class', 'nodeText1')
      .attr('text-anchor', 'end')
      .each(function (d) {
        const lines = splitIntoLinesByWord({
          parentContainer: baseSvg,
          text: d.name,
          fontSize: nameFontSize,
          fontFamily: nameFontFamily,
          maxWidth: maxLabelLength * pxPerChar - nodeTextDx - nodeRectWidth,
          maxLines,
        })

        const self = d3.select(this)
        _(lines).each((line, i) => {
          self.append('tspan')
            .text(line)
            .attr('y', 0) // NB y is set again after all the tspan are added to -0.5 * computedHeight
            .attr('x', -1 * nodeTextDx)
            .attr('dy', `${nameFontSize + i * (nameFontSize + innerLabelPadding)}px`)
        })

        const computedHeight = lines.length * nameFontSize + (lines.length - 1) * innerLabelPadding
        d.shortNodeTextDim = { width: this.getBBox().width, height: computedHeight }
        self.attr('y', -0.5 * computedHeight)
        self.selectAll('tspan').attr('y', -0.5 * computedHeight)
      })

    nodeEnter.append('rect')
      .attr('id', d => `nodeTextMouseInteractionRect${d[ID]}`)
      .attr('class', 'nodeTextMouseInteractionRect')
      .attr('x', d => -d.shortNodeTextDim.width - nodeTextDx)
      .attr('y', d => -d.shortNodeTextDim.height / 2)
      .attr('width', d => d.shortNodeTextDim.width)
      .attr('height', d => d.shortNodeTextDim.height)
      .style('fill', 'transparent')
      .style('stroke', 'none')
      .on('mouseover', this.showTruncatedTextTooltip)
      .on('mouseout', this.hideTooltip)

    nrect1.attr('x', d => -d.shortNodeTextDim.width - nodeTextDx)
      .attr('y', d => -d.shortNodeTextDim.height / 2)
      .attr('width', d => d.shortNodeTextDim.width)
      .attr('height', d => d.shortNodeTextDim.height)

    shortenedText.style('opacity', d => d.hidden ? 0 : 1)

    if (opts.terminalDescription) {
      nodeEnter.append('text')
        .attr('id', d => `terminal${d[ID]}`)
        .attr('y', 0) // NB y is set again after all the tspan are added to -0.5 * computedHeight
        .attr('class', 'terminalNodeText')
        .attr('text-anchor', 'start')
        .attr('font-weight', d => (d[CHILDREN].length > 0) ? 'normal' : 'bold')
        .each(function (d) {
          const lines = splitIntoLinesByWord({
            parentContainer: baseSvg,
            text: d.terminalDescription,
            fontSize: nameFontSize,
            fontFamily: nameFontFamily,
            maxWidth: maxLabelLength * pxPerChar - nodeTextDx - nodeRectWidth,
            maxLines,
          })

          const self = d3.select(this)
          _(lines).each((line, i) => {
            self.append('tspan')
              .text(line)
              .attr('y', 0) // this is set again after all the tspan are added to -0.5 * computedHeight
              .attr('x', nodeTextDx)
              .attr('dy', `${nameFontSize + i * (nameFontSize + innerLabelPadding)}px`)
          })

          const computedHeight = lines.length * nameFontSize + (lines.length - 1) * innerLabelPadding
          d.longTermTextDim = { width: this.getBBox().width, height: computedHeight }

          self.attr('y', -0.5 * computedHeight)
          self.selectAll('tspan').attr('y', -0.5 * computedHeight)
        })

      nodeEnter.append('rect')
        .attr('class', 'terminalTextMouseInteractionRect')
        .attr('x', nodeTextDx)
        .attr('y', d => -d.longTermTextDim.height / 2)
        .attr('width', d => d.longTermTextDim.width)
        .attr('height', d => d.longTermTextDim.height)
        .style('fill', 'transparent')
        .style('stroke', 'none')
        .on('mouseover', this.showTruncatedTerminalTextTooltip)
        .on('mouseout', this.hideTooltip)

      // before performing collision resolution, store the size of the node and terminal text into the data object
      // TODO the x and y's below look wrong ?
      svgGroup.selectAll('.nodeText1')
        .each(function (d) {
          d.nodeTextPos = {
            left: d.y - nodeRectWidth / 2 - nodeTextDx - this.getBBox().width,
            top: d.x - this.getBBox().height / 2,
            bottom: d.x + this.getBBox().height / 2,
            rectLeft: d.y - nodeRectWidth / 2,
            rectTop: d.x - this.parentNode.getBBox().height / 2,
            rectBottom: d.x + this.parentNode.getBBox().height / 2,
          }
        })

      svgGroup.selectAll('.terminalNodeText')
        .each(function (d) {
          if (d[CHILDREN].length === 0) {
            const { width, height } = this.getBBox()
            d.termTextPos = {
              right: d.y + nodeRectWidth / 2 + nodeTextDx + width,
              top: d.x - height / 2,
              bottom: d.x + height / 2,
            }
          }
        })

      const collided = { value: 0 }
      let itr = 0
      do {
        collided.value = 0
        itr++
        this.resolveCollision(data, nodes, collided)
        console.log(`collision resolution round ${itr} found ${collided.value} collisions`)
      } while (collided.value > 0 && itr < maxCollisionResolutionAttempts)

      if (itr >= 7) {
        console.log('Node text collision failed to resolve. Try increasing maxLabelLength when calling SankeyTree')
      }
    }

    const link = svgGroup.selectAll('path.link')
      .data(links, d => d.target[ID])

    this.updateNodesAndLinks(node, link, links, transitionOrigin || data, wscale, showTransition)
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].x0 = nodes[i].x
      nodes[i].y0 = nodes[i].y
    }
  }

  updateNodesAndLinks (node, link, links, source, wscale, showTransition) {
    const {
      parts: { diagonal },
      constants: { transitionDuration },
    } = this

    const conditionallyAddTransition = (selection) => (showTransition)
      ? selection.transition('2').duration(transitionDuration)
      : selection

    // Transition nodes to their new position.
    conditionallyAddTransition(node)
      .style('opacity', 1)
      .attr('transform', d => `translate(${d.y},${d.x})`)

    // Transition exiting nodes to the parent's new position.
    const nodeExit = conditionallyAddTransition(node.exit())
      .style('opacity', 0)
      .attr('transform', `translate(${source.y},${source.x})`)
      .remove()

    nodeExit.select('text')
      .style('fill-opacity', 0)

    // 1. start by nesting our link paths by source
    const linkNested = d3.nest()
      .key(d => d.source[ID])
      .entries(links)

    // 2. manual method for stacking since d3.layout.stack did not work
    linkNested.forEach(function (d) {
      var ystacky = 0
      d.values.forEach(function (dd) {
        var ywidth = wscale(dd.target[VALUE])
        var srcwidth = wscale(dd.source[VALUE])
        srcwidth = isNaN(srcwidth) ? wscale.range()[1] / 2 : srcwidth
        ystacky = ystacky + ywidth
        dd.x = dd.source.x + srcwidth / 2 - ystacky + ywidth / 2
        dd.y = dd.source.y
        dd.ystacky = ystacky
      })
    })

    // Enter any new links at the parent's previous position.
    const originZero = { x: source.x0, y: source.y0 }
    link.enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr('d', diagonal({ source: originZero, target: originZero }))

    link.style('stroke-width', d => wscale(d.target[VALUE]))

    // Transition links to their new position.
    conditionallyAddTransition(link)
      .attr('d', diagonal)
      .style('stroke', function (d) {
        if (d.target.color) {
          if (typeof d.target.color === 'string') {
            return d3.lab(d.target.color)
          } else {
            return d3.hcl(
              d.target.color.h,
              d.target.color.c,
              d.target.color.l
            )
          }
        } else {
          return '#ccc'
        }
      })

    // Transition exiting nodes to the parent's new position.
    const origin = { x: source.x, y: source.y }
    conditionallyAddTransition(link.exit())
      .attr('d', diagonal({ source: origin, target: origin }))
      .remove()
  }

  _getContentSizeAtSpecificZoom (zoom) {
    const {
      parts: { svgGroup },
    } = this

    let currentTransformSettings = d3.transform(svgGroup.attr('transform'))
    svgGroup.attr('transform', `translate(${zoom.translate})scale(${zoom.scale})`)
    const boundingRect = adjustedClientRect(svgGroup.node())
    svgGroup.attr('transform', `translate(${currentTransformSettings.translate})scale(${currentTransformSettings.scale})`)

    return boundingRect
  }

  calculateNewZoom () {
    const {
      width,
      height,
      parts: { svgGroup },
      constants: { treeMargins },
      rootElement,
    } = this

    // reset the scale to 1 and maintain the translation, then sample the dimensions
    let svgTrans = d3.transform(svgGroup.attr('transform'))
    const unscaledTreeDimensions = this._getContentSizeAtSpecificZoom({ scale: 1, translate: svgTrans.translate })

    var availWidth = width - treeMargins.left - treeMargins.right
    var availHeight = height - treeMargins.top - treeMargins.bottom
    const xScale = availWidth / unscaledTreeDimensions.width
    const yScale = availHeight / unscaledTreeDimensions.height
    const newScale = Math.min(xScale, yScale)

    // apply the new scale and maintain the translation, then calculate the new translation
    const scaledTreeDimensions = this._getContentSizeAtSpecificZoom({ scale: newScale, translate: svgTrans.translate })

    const rootOffset = adjustedClientRect(rootElement)

    return {
      scale: newScale,
      translate: [
        (width / 2 - scaledTreeDimensions.width / 2) - scaledTreeDimensions.left + svgTrans.translate[0] + rootOffset.x,
        (height / 2 - scaledTreeDimensions.height / 2) - scaledTreeDimensions.top + svgTrans.translate[1] + rootOffset.y,
      ],
    }
  }

  computeNewDimensions (root) {
    const { opts, computed, constants } = this
    var levelWidth = [1]
    var childCount = function (level, n) {
      if (n[CHILDREN] && n[CHILDREN].length > 0) {
        if (levelWidth.length <= level + 1) levelWidth.push(0)

        levelWidth[level + 1] += n[CHILDREN].length
        n[CHILDREN].forEach(function (d) {
          childCount(level + 1, d)
        })
      }
    }
    childCount(0, root)
    let height = d3.max(levelWidth) * (opts.nodeHeight || 25) // 25 pixels per line

    let width = levelWidth.length * computed.maxLabelLength * constants.pxPerChar +
      levelWidth.length * 10 // node link size + node rect size

    if (height / width < 0.5) {
      height = 0.5 * width
    }

    return { width, height }
  }

  computeLabelLengthStats (treeData, opts) {
    let labelLengthSum = 0
    let maxLabelLength = 0
    let totalNodes = 0

    const traverseFn = (d) => d[CHILDREN]
    const inspectFn = (d) => {
      totalNodes++
      maxLabelLength = opts.maxLabelLength || Math.max(d[NAME].length, 0)
      labelLengthSum = labelLengthSum + d[NAME].length
    }

    visit(treeData, inspectFn, traverseFn)

    // NB do not understand why we add 1
    const meanLabelLength = Math.max(12, (labelLengthSum / totalNodes) + 1)

    // NB do not understand this logic
    if (meanLabelLength < maxLabelLength) {
      maxLabelLength = meanLabelLength
    }

    return { maxLabelLength, meanLabelLength }
  }

  computeNodeHeightRatio (treeData) {
    if (treeData[CHILDREN].length === 0) { return 0 }
    return _(treeData[CHILDREN])
      .map(child => child[VALUE] / treeData[VALUE])
      .max()
  }

  setDataAndOpts (opts, data) {
    this.opts = opts
    this.data = this.normaliseData(data, this.opts)
  }

  static defaultState () {
    return _.cloneDeep({
      widget: Sankey.widgetName,
      version: 1,
      normalisedData: {},
      plotSize: { width: null, height: null },
      zoom: null, // null indicates unset
      collapsed: {},
    })
  }

  setState (previousState) {
    if (this.checkState(previousState)) {
      this.plotState.initialiseState(previousState)
    } else {
      this.resetState()
    }
  }

  checkState (previousState) {
    const previousRootname = _.get(previousState, 'normalisedData.name')
    const currentRootname = this.data.name
    console.log(`comparing state. Previous state root name '${previousRootname}'. Current data root name '${currentRootname}'`)

    const previousSnapshotTimestamp = _.get(previousState, 'timestamp')
    if (previousSnapshotTimestamp) {
      console.log(`previous state is ${(Date.now() - previousSnapshotTimestamp) / 1000} seconds old`)
    } else {
      console.log(`previous state has no timestamp`)
    }

    const { constants: { stateResizeTolerance } } = this
    const isSankeyState = (_.get(previousState, 'widget') === Sankey.widgetName)
    const isCorrectVersion = (_.get(previousState, 'version') === STATE_VERSION)
    const dataIsSame = _.isEqual(this.data, _.get(previousState, 'normalisedData'))

    const { width, height } = this
    const { width: stateWidth, height: stateHeight } = _.get(previousState, 'plotSize', {})

    // TODO only do partial reset of state on resize
    const isSameSize = (Math.abs(stateWidth - width) <= stateResizeTolerance) && (Math.abs(stateHeight - height) <= stateResizeTolerance)

    console.log(`checkState. isSankeyState: ${isSankeyState}, isCorrectVersion: ${isCorrectVersion}, dataIsSame: ${dataIsSame}, isSameSize: ${isSameSize}, `)
    if (!dataIsSame) {
      console.log('state saved data', _.get(previousState, 'normalisedData'))
      console.log('current normalised data', this.data)
    }

    if (!isSameSize) {
      console.log(`stateWidth: ${stateWidth}, width: ${width}, stateHeight: ${stateHeight}, height: ${height}`)
    }

    return isSankeyState && isCorrectVersion && dataIsSame && isSameSize
  }

  resetState () {
    const { width, height, data: normalisedData } = this
    this.plotState.setState(_.merge({}, Sankey.defaultState(), { normalisedData, plotSize: { width, height } }))
  }

  addStateListener (listener) {
    this.registeredStateListeners.push(this.plotState.addListener(listener))
  }

  _showTooltip ({ html, d, addTipToThisElement }) {
    const { parts, width } = this
    const { tip, tipTriangle } = parts

    tip.html(html)
    tip.show({}, addTipToThisElement)

    const tipHeight = parseFloat(tip.style('height'))
    const tipWidth = parseFloat(tip.style('width'))

    const clientRect = adjustedClientRect(addTipToThisElement.node())
    const triangleHeight = 7.5
    const padding = 5

    let tipVariables = null
    if (clientRect.top - padding - tipHeight > this.baseSvgRectInfo.top) {
      tipVariables = {
        tipDirection: 'n',
        tipTop: clientRect.top - (triangleHeight + padding) - tipHeight,
        triangleTopOffset: tipHeight,
        tipLeft: (clientRect.left + clientRect.width / 2) - (tipWidth / 2),
        triangleLeftOffset: tipWidth / 2 - padding,
      }
    } else {
      tipVariables = {
        tipDirection: 's',
        tipTop: clientRect.bottom + (triangleHeight + padding),
        triangleTopOffset: -triangleHeight,
        tipLeft: (clientRect.left + clientRect.width / 2) - (tipWidth / 2),
        triangleLeftOffset: tipWidth / 2 - padding,
      }
    }

    tip
      .style('top', `${tipVariables.tipTop}px`)
      .style('left', `${tipVariables.tipLeft}px`)

    tipTriangle
      .style('visibility', 'visible')
      .attr('class', `tipTriangle tipTriangle${tipVariables.tipDirection.toUpperCase()}`)
      .style('top', `${tipVariables.tipTop + tipVariables.triangleTopOffset}px`)
      .style('left', `${tipVariables.tipLeft + tipVariables.triangleLeftOffset}px`)

    if (tipVariables.tipLeft < this.baseSvgRectInfo.left) {
      tip.style('left', `${this.baseSvgRectInfo.left + 5}px`)
    } else if (tipVariables.tipLeft + tipWidth > this.baseSvgRectInfo.left + width) {
      tip.style('left', `${this.baseSvgRectInfo.left + width - 5 - tipWidth}px`)
    }
    if (tipVariables.tipLeft + tipVariables.triangleLeftOffset < this.baseSvgRectInfo.left + 10) {
      tipTriangle.style('left', `${this.baseSvgRectInfo.left + 15}px`)
    } else if (tipVariables.tipLeft + tipVariables.triangleLeftOffset > this.baseSvgRectInfo.left + width - 10) {
      tipTriangle.style('left', `${this.baseSvgRectInfo.left + width - 15}px`)
    }

    // NB I dont think this code is needed
    // if (tipVariables.tipTop < this.baseSvgRectInfo.top) {
    //   tip.style('top', `${this.baseSvgRectInfo.top}px`)
    //   tipTriangle.style('top', `${this.baseSvgRectInfo.top + tipVariables.triangleTopOffset}px`)
    // } else if (tipVariables.tipTop + tipHeight > this.baseSvgRectInfo.top + height) {
    //   tip.style('top', `${this.baseSvgRectInfo.top + height - tipHeight - 5}px`)
    //   tipTriangle.style('top', `${this.baseSvgRectInfo.top + height - tipHeight - 5 + tipVariables.triangleTopOffset}px`)
    // }
  }

  showNodeTooltip (d) {
    const { parts, data, opts } = this

    const addTipToThisElement = parts.baseSvg.select(`#nodeRect${d[ID]}`)
    let html = null
    if (opts.numericDistribution) {
      if (data.treeType === 'Classification') {
        const maxBarLength = 40
        const tipBarScale = d3.scale.linear().domain([0, 1]).range([0, maxBarLength])
        html = createClTips(d, tipBarScale, maxBarLength)
      } else if (data.treeType === 'Regression') {
        const maxBarLength = 50
        const tipBarScale = d3.scale.linear().domain([0, 1]).range([0, maxBarLength])
        html = createRgTips(d, tipBarScale, maxBarLength)
      }
    }
    this._showTooltip({ html, d, addTipToThisElement })
  }

  showTruncatedTextTooltip (d) {
    const { parts } = this

    const addTipToThisElement = parts.baseSvg.select(`#nodeTextBg${d[ID]}`)
    let html = `<div class="tipTruncatedTextContainer">${d[NAME]}</div>`
    this._showTooltip({ html, d, addTipToThisElement })
  }

  showTruncatedTerminalTextTooltip (d) {
    const { parts } = this

    const addTipToThisElement = parts.baseSvg.select(`#terminal${d[ID]}`)
    let html = `<div class="tipTruncatedTextContainer">${d.terminalDescription}</div>`
    this._showTooltip({ html, d, addTipToThisElement })
  }

  hideTooltip () {
    const { parts: { tipTriangle, tip } } = this
    tipTriangle.style('visibility', 'hidden')
    tip.hide()
  }

  updateNodePos (source, value) {
    source.x = source.x + value
    source.y = source.y + value
    source.nodeTextPos.bottom = source.nodeTextPos.bottom + value
    source.nodeTextPos.rectBottom = source.nodeTextPos.rectBottom + value
    source.nodeTextPos.top = source.nodeTextPos.top + value
    source.nodeTextPos.rectTop = source.nodeTextPos.rectTop + value
    source.nodeTextPos.left = source.nodeTextPos.left + value
    source.nodeTextPos.rectLeft = source.nodeTextPos.rectLeft + value

    if (_.has(source, 'termTextPos')) {
      source.termTextPos.right = source.termTextPos.right + value
      source.termTextPos.bottom = source.termTextPos.bottom + value
      source.termTextPos.top = source.termTextPos.top + value
    }
  }

  moveParents (source, value) {
    // TODO move the parent nodes of the colliding nodes
    // so far only child nodes are moved, which can potentially be a problem
  }

  moveChildren (source, value) {
    this.updateNodePos(source, value)

    if (source[CHILDREN].length > 0) {
      this.moveChildren(source[CHILDREN][0], value)
      this.moveChildren(source[CHILDREN][1], value)
    }
  }

  moveNodes (source, target) {
    var dx = (target.termTextPos.bottom - target.termTextPos.top) * 0.7
    if (source.parent.x < target.parent.x) {
      // source is on the top branch, move source up
      this.updateNodePos(source, -dx)
      this.updateNodePos(target, dx)
      if (source[CHILDREN].length > 0) {
        this.moveChildren(source[CHILDREN][0], -dx)
        this.moveChildren(source[CHILDREN][1], -dx)
      }
      this.moveParents(source, -dx)
      this.moveParents(target, dx)
    } else {
      // source is on the bottom branch, move it down
      this.updateNodePos(source, dx)
      this.updateNodePos(target, -dx)
      if (source[CHILDREN].length > 0) {
        this.moveChildren(source[CHILDREN][0], dx)
        this.moveChildren(source[CHILDREN][1], dx)
      }
      this.moveParents(source, dx)
      this.moveParents(target, -dx)
    }
  }

  // since the tree is drawn from left to right, the target is always on the left
  // of the source
  nodeCollide (source, target) {
    if ((source.nodeTextPos.left - 5 < target.termTextPos.right &&
      ((source.nodeTextPos.bottom >= target.termTextPos.top && source.nodeTextPos.top <= target.termTextPos.top) ||
        (source.nodeTextPos.top <= target.termTextPos.bottom && source.nodeTextPos.bottom >= target.termTextPos.bottom))) ||
      (source.nodeTextPos.rectLeft < target.termTextPos.right &&
        ((source.nodeTextPos.rectBottom >= target.termTextPos.top && source.nodeTextPos.rectTop <= target.termTextPos.top) ||
          (source.nodeTextPos.rectTop <= target.termTextPos.bottom && source.nodeTextPos.rectBottom >= target.termTextPos.bottom)))) {
      return true
    } else {
      return false
    }
  }

  resolveCollision (thisNode, nodesArray, collided) {
    // resolve collision from root node to leaf node
    // larger branches are moved first
    // only check collision with lower level nodes
    // empirically if root has depth 1, only nodes with depth 4 or above
    // will collide with previous nodes
    if (thisNode.depth >= 2) {
      // collision is only possible with nodes having depth - 1 of current
      // and that node must be a terminal node
      for (var i = 0; i < nodesArray.length; i++) {
        var targetNode = nodesArray[i]
        if (targetNode.id !== thisNode.id && targetNode.depth < thisNode.depth && targetNode[CHILDREN].length === 0) {
          if (this.nodeCollide(thisNode, targetNode)) {
            // move nodes to the side
            collided.value += 1
            this.moveNodes(thisNode, targetNode)
          }
        }
      }
    }

    // only run the recursion when there is children
    if (thisNode[CHILDREN].length > 0) {
      this.resolveCollision(thisNode[CHILDREN][0], nodesArray, collided)
      this.resolveCollision(thisNode[CHILDREN][1], nodesArray, collided)
    }
  }
}

Sankey.initClass()
module.exports = Sankey

// A recursive helper function for performing some setup by walking through all nodes
function visit (parent, visitFn, childrenFn) {
  if (!parent) return
  visitFn(parent)
  var children = childrenFn(parent)
  _(children)
    .each(child => visit(child, visitFn, childrenFn))
}

function adjustedClientRect (node) {
  const unadjustedValues = _.pick(node.getBoundingClientRect(), ['x', 'y', 'width', 'height', 'top', 'right', 'bottom', 'left'])
  unadjustedValues.top += window.scrollY
  unadjustedValues.bottom += window.scrollY
  unadjustedValues.y += window.scrollY
  unadjustedValues.left += window.scrollX
  unadjustedValues.right += window.scrollX
  unadjustedValues.x += window.scrollX
  return unadjustedValues
}
