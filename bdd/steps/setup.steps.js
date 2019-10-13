const SankeyTree = require('../pageObjects/sankeyTreePageObject')

module.exports = function () {
  this.Before(function () {
    this.context.sankeyTree = new SankeyTree()
  })
}
