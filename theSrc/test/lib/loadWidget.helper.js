const { snapshotTesting: { renderExamplePageTestHelper } } = require('rhtmlBuildUtils')

const {
  getExampleUrl,
  waitForWidgetToLoad,
} = renderExamplePageTestHelper

const SankeyTreePage = require('./sankeyTreePage')

const loadWidget = async ({
  browser,
  configName = '',
  stateName,
  width = 1000,
  rerenderControls,
  height = 600,
}) => {
  const page = await browser.newPage()
  const url = getExampleUrl({ configName, stateName, rerenderControls, width, height })
  const sankeyTreePage = new SankeyTreePage(page)

  await page.goto(url)
  await waitForWidgetToLoad({ page })

  return { page, sankeyTreePage }
}

module.exports = loadWidget
