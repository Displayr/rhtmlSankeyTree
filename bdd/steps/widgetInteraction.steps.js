// TODO make this an exported module in rhtmlBuild
// without this cucumber is not logging errors when steps fail which makes debugging painful
// think this has to do with Applitools but dont really understand ...
const wrapInPromiseAndLogErrors = function (fn) {
  return new Promise((resolve, reject) => {
    fn().then(resolve)
      .catch((err) => {
        console.log(err)
        reject(err)
      })
  }).catch((err) => {
    console.log(err)
    throw err
  })
}

module.exports = function () {
  this.When(/^I wait for animations and state callbacks to complete$/, function () {
    return browser.sleep(700)
  })

  this.When(/^I click node rectangle (.+)$/, function (labelId) {
    return wrapInPromiseAndLogErrors(() => {
      return this.context.sankeyTree.nodeRect(labelId).click()
    })
  })

  this.When(/^I drag the view by (-?[0-9]+) x (-?[0-9]+)$/, function (xMovement, yMovement) {
    return wrapInPromiseAndLogErrors(() => {
      return browser.actions()
        .mouseMove(this.context.sankeyTree.canvas(), { x: 10, y: 10 })
        // .mouseMove({ x: 10, y: 10 })
        .mouseDown()
        .mouseMove({ x: parseInt(xMovement), y: parseInt(yMovement) })
        .mouseUp()
        .perform()
    })
  })
}

// how to zoom ?
// https://appiumpro.com/editions/67
