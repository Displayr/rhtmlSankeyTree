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

configureImageSnapshotMatcher({ collectionIdentifier: 'widget_state_resetting' })
jest.setTimeout(jestTimeout)

/*
  Test Summary:
  * Some changes to plot size or source data will cause the state to reset
*/

describe('widget_state_resetting', () => {
  let browser

  beforeEach(async () => {
    browser = await puppeteer.launch(puppeteerSettings)
  })

  afterEach(async () => {
    await browser.close()
  })

  test('If the state "plot size" does not match the current plot size, the widget will reset state to base', async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal_example',
      stateName: 'data.functional_tests.state_minimal_example.600x600_base',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal_example_500x500_base' })
    await testState({ page, stateName: 'data.functional_tests.state_minimal_example.500x500_base', tolerance: 1.5 })

    await page.close()
  })

  test('If the state "source data" does not match the current source data, the widget will reset state to base', async function () {
    const { page } = await loadWidget({
      browser,
      configName: 'data.functional_tests.minimal_example',
      stateName: 'data.functional_tests.state_minimal_example.500x500_modified_data_50_50_split',
      width: 500,
      height: 500,
    })

    await testSnapshots({ page, testName: 'minimal_example_500x500_base' })
    await testState({ page, stateName: 'data.functional_tests.state_minimal_example.500x500_base', tolerance: 1.5 })

    await page.close()
  })
})
