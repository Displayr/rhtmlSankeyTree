import _ from 'lodash'

// State {
//   widget: 'sankey',
//   version: 1,
//   normalisedData: {},
//   zoom: { scale: 1, translate: [0,0] },
//   collapsed: {}
// })

// TODO this is passive, should I make it the initiator of things as well (similar to moonplot) ?

class PlotState {
  constructor () {
    this.init()
  }

  init () {
    this.state = {}
    this.listeners = {}
    this.listenerId = 0
  }

  // does not call listeners
  initialiseState (newState) {
    this.state = newState
  }

  setState (newState) {
    this.state = newState
    this.callListeners()
  }

  callListeners () {
    _.each(this.listeners, (listenerFn) => { listenerFn(_.cloneDeep(this.state)) })
  }

  addListener (listenerFn) {
    const newId = this.listenerId++
    this.listeners[newId] = listenerFn

    const deregisterListener = () => {
      delete this.listeners[newId]
    }
    return deregisterListener
  }

  getPlotSize () {
    return this.state.plotSize
  }

  isNodeCollapsed (id) {
    return this.state.collapsed[id] || false
  }

  toggleNodeDisplay (id) {
    return (this.isNodeCollapsed(id)) ? this.expandNode(id) : this.collapseNode(id)
  }

  // We do not call listeners after collapsing and expanding nodes as a setTimeout is called
  // which calls setZoom (after the transition animation) which calls listeners.
  // If listeners were called here, the node and zoom state could become inconsistent if
  // the user navigated away from the page (VIS-522).
  collapseNode (id) {
    this.state.collapsed[id] = true
  }

  expandNode (id) {
    delete this.state.collapsed[id]
  }

  getZoom () {
    return this.state.zoom
  }

  setZoom ({ scale, translate }) {
    this.state.zoom = { scale, translate }
    this.callListeners()
    console.log({ scale, translate })
  }
}

module.exports = PlotState
