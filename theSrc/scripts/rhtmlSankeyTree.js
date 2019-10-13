/* global HTMLWidgets */

import 'babel-polyfill'
import widgetFactory from './rhtmlSankeyTree.factory'

HTMLWidgets.widget({
  name: 'rhtmlSankeyTree',
  type: 'output',
  factory: widgetFactory
})
