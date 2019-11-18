import _ from 'lodash'
import * as d3 from 'd3'

import PlotState from './SankeyTree/plotState'
import buildConfig from './SankeyTree/buildConfig'
import { Layout, CellNames } from './layout'

import SankeyTree from './components/sankeyTree'
import Title from './components/title'

const ID = 'id'
const NAME = 'name'
const VALUE = 'value'
const CHILDREN = 'sankeyChildren' // 'children' is a reserved field that d3.tree will manipulate, so dont use it !
const STATE_VERSION = 1

class OuterPlot {
  static initClass () {
    this.widgetIndex = 0
    this.widgetName = 'sankey'
  }

  constructor (element) {
    this.rootElement = element

    _.assign(this, {
      id: `${OuterPlot.widgetName}-${OuterPlot.widgetIndex++}`,
      registeredStateListeners: [],
      constants: {
        stateResizeTolerance: 2
      }
    })

    const { width, height } = this.containerDimensions()
    this.svg = d3.select(this.rootElement).append('svg')
      .attr('id', this.id)
      .attr('class', 'svgContent')
      .attr('width', width)
      .attr('height', height)

    this.init()
  }

  containerDimensions () {
    const rootElement = _.has(this.rootElement, 'length') ? this.rootElement[0] : this.rootElement
    try {
      return rootElement.getBoundingClientRect()
    } catch (err) {
      err.message = `fail in this.containerDimensions: ${err.message}`
      throw err
    }
  }

  init () {
    this.plotState = new PlotState()
    this.config = null
    this.inputData = null
  }

  // TODO does this get called ?
  reset () {
    this.registeredStateListeners.forEach(dergisterFn => dergisterFn())
    d3.select(document).selectAll('.d3-tip').remove() // TODO this is leaky, should not be outerplot concern ...
    d3.select(document).selectAll('#littleTriangle').remove() // TODO this is leaky, should not be outerplot concern ...
    this.init()
  }

  clearPlot () {
    this.svg.selectAll('*').remove()
  }

  setDataAndOpts (data, opts) {
    this.config = buildConfig(opts)
    this.data = this.normaliseData(data, this.config)
  }

  // maybe can move this to child
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
          ...(node.n && { n: node.n })
        },
        [ID]: `${(node[opts.id || ID] || idIterator++)}`.replace(/ /g, ''),
        [NAME]: node[opts.name || NAME],
        [VALUE]: node[opts.value || VALUE],
        [CHILDREN]: _(node[opts.childrenName] || node[CHILDREN] || node._children).map(extractAndRecurse).value(),
        terminalDescription: node.terminalDescription,
        color: node.color,
        n: node.n
      }
    }

    return extractAndRecurse(data)
  }

  // TODO doubled up on version 1
  static defaultState () {
    return _.cloneDeep({
      widget: OuterPlot.widgetName,
      version: 1,
      normalisedData: {},
      plotSize: { width: null, height: null },
      zoom: null, // null indicates unset
      collapsed: {}
    })
  }

  addStateListener (listener) {
    this.registeredStateListeners.push(this.plotState.addListener(listener))
  }

  setState (previousState) {
    if (this.checkState(previousState)) {
      this.plotState.initialiseState(previousState)
    } else {
      this.resetState()
    }
  }

  resetState () {
    const { width, height, data: normalisedData } = this
    this.plotState.setState(_.merge({}, OuterPlot.defaultState(), { normalisedData, plotSize: { width, height } }))
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
    const isSankeyState = (_.get(previousState, 'widget') === OuterPlot.widgetName)
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

  draw () {
    this.clearPlot()
    this.initialiseComponents()
    const { width, height } = this.containerDimensions()

    this.svg
      .attr('width', width)
      .attr('height', height)

    if (this.layout.enabled(CellNames.TITLE)) { this.components[CellNames.TITLE].draw(this.layout.getCellBounds(CellNames.TITLE)) }
    if (this.layout.enabled(CellNames.SUBTITLE)) { this.components[CellNames.SUBTITLE].draw(this.layout.getCellBounds(CellNames.SUBTITLE)) }
    if (this.layout.enabled(CellNames.FOOTER)) { this.components[CellNames.FOOTER].draw(this.layout.getCellBounds(CellNames.FOOTER)) }
    this.components[CellNames.PLOT].draw(this.layout.getCellBounds(CellNames.PLOT))
  }

  initialiseComponents () {
    this.components = {}
    // TODO wire in inner and outer padding
    const innerPadding = 5
    const outerPadding = 0

    const { width, height } = this.containerDimensions()
    this.layout = new Layout(width, height, innerPadding, outerPadding)

    this.components[CellNames.PLOT] = new SankeyTree({
      parentContainer: this.svg,
      data: this.data,
      config: this.config, // this is lazy but a large percentage of config is shared ...
      plotState: this.plotState
    })
    this.layout.enable(CellNames.PLOT)
    this.layout.setFillCell(CellNames.PLOT)

    if (!_.isEmpty(this.config.title)) {
      this.components[CellNames.TITLE] = new Title({
        parentContainer: this.svg,
        text: this.config.title,
        fontColor: this.config.titleFontColor,
        fontSize: this.config.titleFontSize,
        fontFamily: this.config.titleFontFamily,
        maxWidth: width,
        maxHeight: height / 4, // TODO make this configurable
        bold: false,
        innerPadding: 2 // TODO make configurable
      })

      const dimensions = this.components[CellNames.TITLE].computePreferredDimensions()
      this.layout.enable(CellNames.TITLE)
      this.layout.setPreferredDimensions(CellNames.TITLE, dimensions)
    }

    if (!_.isEmpty(this.config.subtitle)) {
      this.components[CellNames.SUBTITLE] = new Title({
        parentContainer: this.svg,
        text: this.config.subtitle,
        fontColor: this.config.subtitleFontColor,
        fontSize: this.config.subtitleFontSize,
        fontFamily: this.config.subtitleFontFamily,
        maxWidth: width,
        maxHeight: height / 4, // TODO make this configurable
        bold: false,
        innerPadding: 2 // TODO make configurable
      })

      const dimensions = this.components[CellNames.SUBTITLE].computePreferredDimensions()
      this.layout.enable(CellNames.SUBTITLE)
      this.layout.setPreferredDimensions(CellNames.SUBTITLE, dimensions)
    }

    if (!_.isEmpty(this.config.footer)) {
      this.components[CellNames.FOOTER] = new Title({
        parentContainer: this.svg,
        text: this.config.footer,
        fontColor: this.config.footerFontColor,
        fontSize: this.config.footerFontSize,
        fontFamily: this.config.footerFontFamily,
        maxWidth: width,
        maxHeight: height / 4, // TODO make this configurable
        bold: false,
        innerPadding: 2 // TODO make configurable
      })

      const dimensions = this.components[CellNames.FOOTER].computePreferredDimensions()
      this.layout.enable(CellNames.FOOTER)
      this.layout.setPreferredDimensions(CellNames.FOOTER, dimensions)
    }

    this.layout.allComponentsRegistered()
  }
}

OuterPlot.initClass()
module.exports = OuterPlot
