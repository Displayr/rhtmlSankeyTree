class SankeyTreePage {
  constructor (page) {
    this.page = page
  }

  nodeRectSelector (id) { return `#nodeRect${id}` }
  nodeTextSelector (id) { return `#nodeTextMouseInteractionRect${id}` }
  terminalTextSelector (id) { return `#terminalTextMouseInteractionRect${id}` }
  canvasSelector () { return '.treeGroup' }

  async clickNodeRect (labelId) { return this.page.click(this.nodeRectSelector(labelId)) }

  // duplicated in rhtmlMoonplot
  async dragThing (selector, xMovement, yMovement) {
    const coords = await this.getCoords(selector)
    const steps = Math.floor(Math.max(Math.abs(xMovement), Math.abs(yMovement)) / 2)
    await this.page.hover(selector)
    await this.page.mouse.down()
    await this.page.mouse.move(parseFloat(coords.left + xMovement), parseFloat(coords.top + yMovement), { steps })
    return this.page.mouse.up()
  }

  // duplicated in rhtmlMoonplot
  async getCoords (selector) {
    const element = await this.page.$(selector)
    const rect = await this.page.evaluate(element => {
      const { top, left, bottom, right } = element.getBoundingClientRect()
      return { top, left, bottom, right }
    }, element)
    return rect
  }

  async dragView (xMovement, yMovement) {
    const selector = this.canvasSelector()
    return this.dragThing(selector, xMovement, yMovement)
  }
}

module.exports = SankeyTreePage
