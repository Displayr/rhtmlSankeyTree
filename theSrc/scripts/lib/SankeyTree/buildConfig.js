import _ from 'lodash'

const defaultConfig = {
  footerFontColor: '#000000',
  footerFontFamily: 'sans-serif',
  footerFontSize: 11,
  subtitleFontColor: '#000000',
  subtitleFontFamily: 'sans-serif',
  subtitleFontSize: 18,
  titleFontColor: '#000000',
  titleFontFamily: 'sans-serif',
  titleFontSize: 24
}

function buildConfig (userConfig) {
  return _.merge({}, defaultConfig, userConfig)
}

module.exports = buildConfig
