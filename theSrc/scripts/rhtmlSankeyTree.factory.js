import OuterPlot from './lib/outerPlot'
import _ from 'lodash'

// ATTRIBUTION:  much of this JavaScript code
//  came from http://bl.ocks.org/robschmuecker/0f29a2c867dcb1b44d18

const STATE_CALLBACK_DEBOUNCE_INTERVAL = 250

// Sankey determines height by inspecting element, so the passed wxh values are ignored
module.exports = function (element, ignoredWidth, ignoredHeight, stateChangedFn = _.noop) {
  // keep reference to config for resize, as we just recreate widget on resize to simplify code
  let configCopy = null
  let stateCopy = null

  let outerPlot = new OuterPlot(element)

  function doRenderValue (config, state) {
    outerPlot.reset()
    outerPlot.setDataAndOpts(config.data, config.opts)

    // NB when sankey is zoomed it calls the state fn 100 of times per second,
    // debouncing reduces the number of calls while guaranteeing the last state update is always passed back to callee
    const debouncedStateChanged = _.debounce(newState => {
      console.log('calling state callback newState', newState)
      stateChangedFn(_.assign(newState, { timestamp: Date.now() }))
    }, STATE_CALLBACK_DEBOUNCE_INTERVAL)

    outerPlot.addStateListener(debouncedStateChanged)
    outerPlot.addStateListener(newState => { stateCopy = newState })
    outerPlot.setState(state)
    outerPlot.draw()
  }

  return {
    resize () {
      console.log('resize was called')
      doRenderValue(configCopy, stateCopy)
    },

    renderValue (config, state) {
      console.log('renderValue was called')
      configCopy = _.cloneDeep(config)
      stateCopy = _.cloneDeep(state)
      doRenderValue(config, state)
    }
  }
}
