const PlotState = require('./plotState.js')

describe('VIS-522', function () {
  test('Node toggling does not call listener', function () {
    const state = new PlotState()
    state.initialiseState({ collapsed: [ false ], zoom: { scale: 1, translate: [0, 0] } })
    state.addListener(function (s) {
      // Listener only called after setting zoom
      expect(s).toEqual({ collapsed: [ true ], zoom: { scale: 10, translate: [20, 30] } })
    })
    state.toggleNodeDisplay(0)
    state.setZoom({ scale: 10, translate: [20, 30] })
  })
})
