
class SankeyTreePageObject {
  nodeRect (id) {
    return element(by.css(`#nodeRect${id}`))
  }

  nodeText (id) {
    return element(by.css(`#nodeTextMouseInteractionRect${id}`))
  }

  terminalText (id) {
    return element(by.css(`#terminalTextMouseInteractionRect${id}`))
  }

  canvas () {
    return element(by.css('.treeGroup'))
  }
}

module.exports = SankeyTreePageObject
