const { snapshotTesting: { interactions: { dragThing } } } = require('rhtmlBuildUtils')

class SankeyTreePage {
  constructor (page) {
    this.page = page
  }

  nodeRectSelector (id) { return `#nodeRect${id}` }
  nodeTextSelector (id) { return `#nodeTextMouseInteractionRect${id}` }
  terminalTextSelector (id) { return `#terminalTextMouseInteractionRect${id}` }
  canvasSelector () { return '.treeGroup' }

  async clickNodeRect (labelId) { return this.page.click(this.nodeRectSelector(labelId)) }

  async dragView (xMovement, yMovement) {
    const selector = this.canvasSelector()
    return dragThing(this.page, selector, xMovement, yMovement)
  }
}

module.exports = SankeyTreePage
