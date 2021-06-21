const puppeteer = require('puppeteer')
const { snapshotTesting: { renderExamplePageTestHelper } } = require('rhtmlBuildUtils')
const loadWidget = require('../lib/loadWidget.helper')

const {
  configureImageSnapshotMatcher,
  puppeteerSettings,
  testSnapshots,
  testState,
  jestTimeout,
} = renderExamplePageTestHelper

configureImageSnapshotMatcher({ collectionIdentifier: 'widget_interactions' })
jest.setTimeout(jestTimeout)

/*
  Test Summary:
  * The user can click nodes, move the tree, and zoom in on the tree.
  * Each interaction should cause a state callback, and when I rerender with that new state value, I should see the same interactions applied to the widget.
  * # TODO test zoom. I dont know how to simulate zoom yet <-- this comment from applitools, may be easy with puppeteer
  * # TODO test tooltips. I dont know how to simulate zoom yet <-- this comment from applitools, may be easy with puppeteer
*/

describe('widget_interactions', () => {
  let browser

  beforeEach(async () => {
    browser = await puppeteer.launch(puppeteerSettings)
  })

  afterEach(async () => {
    await browser.close()
  })

  test('a new widget correctly generates and saves state', async function () {
    console.log('process.env.CI', process.env.CI)
    console.log('process.env.TRAVIS', process.env.TRAVIS)

    const { page } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal_example',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal_example_500x500_base' })
    await testState({ page, stateName: 'data.functional_tests.state_minimal_example.500x500_base', tolerance: 0.5 })

    await page.close()
  })

  test('a node can be collapsed by clicking', async function () {
    const { page, sankeyTreePage } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal_example',
      width: 500,
      height: 500,
    })

    await sankeyTreePage.clickNodeRect('2')
    await testSnapshots({ page, testName: 'minimal_example_500x500_collapsed_2' })

    // does not work in CI, have not investigated why yet
    if (!process.env.TRAVIS) {
      await testState({ page, stateName: 'data.functional_tests.state_minimal_example.500x500_collapse_2_test', tolerance: 0.5 })
    }

    await page.close()
  })

  test('collapsed node state is saved and can be restored', async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal_example',
      stateName: 'data.functional_tests.state_minimal_example.500x500_collapse_2_test',
      width: 500,
      height: 500,
    })

    // does not work in CI, have not investigated why yet
    if (!process.env.TRAVIS) {
      await testSnapshots({ page, testName: 'minimal_example_500x500_collapsed_2' })
    }

    await page.close()
  })

  test('the view can be moved', async function () {
    const { page, sankeyTreePage } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal_example',
      width: 500,
      height: 500,
    })

    await sankeyTreePage.dragView(50, 50)
    await testSnapshots({ page, testName: 'minimal_example_500x500_moved_50x50' })
    await testState({ page, stateName: 'data.functional_tests.state_minimal_example.500x500_moved_50x50_test', tolerance: 0.5 })

    await page.close()
  })

  test('moved view state is saved and can be restored', async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal_example',
      stateName: 'data.functional_tests.state_minimal_example.500x500_moved_50x50_test',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal_example_500x500_moved_50x50' })

    await page.close()
  })
})
