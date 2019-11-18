const _ = require('lodash')

module.exports = {
  widgetEntryPoint: 'theSrc/scripts/rhtmlSankeyTree.js',
  widgetFactory: 'theSrc/scripts/rhtmlSankeyTree.factory.js',
  widgetName: 'rhtmlSankeyTree',
  visualRegressionSuite: {
    statePreprocessor: (state) => _.omit(state, ['timestamp'])
  },
  internalWebSettings: {
    includeDimensionsOnWidgetDiv: true,
    default_border: false,
    isReadySelector: 'svg.svgContent',
    css: [
      '/style/rhtmlSankeyTree.css'
    ],
    singleWidgetSnapshotSelector: '#widget-container'
  }
}
