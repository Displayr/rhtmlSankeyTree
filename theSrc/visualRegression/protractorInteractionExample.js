
const _ = require('lodash');
const widgetName = require('../../build/config/widget.config.json').widgetName;
const contentManifest = require('../../browser/contentManifest.json');

// NB global.visualDiffConfig is set globally in protractor.conf.js
const eyes = require('../../build/scripts/initializeApplitools').getEyes(global.visualDiffConfig)
let contentFiles = _.flattenDeep(_.values(contentManifest));

describe('Check mouseover behavior', function () {

  beforeEach(function () {
    browser.ignoreSynchronization = true;
  });

  let snapshotsCount = 0;

  _.forEach(contentFiles, (contentPath) => {

  	it('Sankeytree: when the mouse is over a node, tooltips will show', function(done) {

  		let openedEyes = false;

      loadPage()
      .then(conditionallyOpenEyesAndWaitForSnapshotsToLoad)
      .then(mouseOverNodeTest)
      .catch(catchAll)
      .finally(conditionallyCloseEyesAndEndTest);

			function loadPage() {
			  return browser.get(contentPath).then(() => {
			    console.log(`Page ${contentPath} is loaded`);
			  });
			}

		  function conditionallyOpenEyesAndWaitForSnapshotsToLoad() {
		    return element.all(by.css('[snapshot-name]')).count().then((count) => {
		      if (count > 0) {
		        const eyesParams = {
		          width: global.visualDiffConfig.browserWidth,
		          height: global.visualDiffConfig.browserHeight,
		        };
		        eyes.open(browser, 
		        	`${widgetName} ${global.visualDiffConfig.testLabel}`, 
		        	`${contentPath} Sankeytree: when the mouse is over a node, tooltips will show`, 
		        	eyesParams);
		        openedEyes = true;

		        console.log(`Waiting ${global.visualDiffConfig.pageLoadWaitSeconds * 1000} seconds for widgetsPage`);
		        return new Promise((resolve) => {
		          setTimeout(() => {
		            return resolve();
		          }, global.visualDiffConfig.pageLoadWaitSeconds * 0);
		        });
		      } else {
		        console.log(`No elements containing attribute [snapshot-name] found on page ${contentPath}. Skipping`);
		        return Promise.resolve();
		      }
		    });
		  }

			function takeSnapshots() {
			  const donePromises = element.all(by.css('[snapshot-name]')).each(function (element) {
			    return element.getAttribute('snapshot-name').then((snapshotName) => {
			      if (snapshotName) {
			        console.log(`take snapshot ${contentPath} ${snapshotName}`);
			        snapshotsCount++;
			        eyes.checkRegionBy(by.css(`[snapshot-name="${snapshotName}"]`), snapshotName);
			      } else {
			        console.error(`snapshot on page ${contentPath} missing snapshot name`);
			      }
			    });
			  });
			  return donePromises.then(() => {
			    console.log(`done taking snapshots on ${contentPath}. Running snapshot count: ${snapshotsCount}`);
			  });
			}

			function catchAll(error) {
			  console.log('test error:');
			  console.log(error);
			}

			function conditionallyCloseEyesAndEndTest() {
			  if (openedEyes) { eyes.close(false); }
			  done();
			}

      function mouseOverNodeTest() {
      	let nodeCountYes = 0, nodeCountNo = 0;
      	element.all(by.css('.nodeRect')).each((element) => {
      		// warning: attributes must be lower cases, otherwise it will not be recognised
      		element.getAttribute('terminal').then((id) => {
      			if (id == '1' && nodeCountYes == 0) {
      				// move mouse over node rect
      				nodeCountYes++;
      				browser.actions().mouseMove(element).perform().then(takeSnapshots);

      			} else if (id == '2' && nodeCountNo == 0) {
      				nodeCountNo++;
      				browser.actions().mouseMove(element).perform().then(takeSnapshots);
      			}
      		})
      	})
      }

  	});

		it('Sankeytree: when a node is clicked, its child nodes will be collapsed', function(done) {

  		let openedEyes = false;

      loadPage()
      .then(conditionallyOpenEyesAndWaitForSnapshotsToLoad)
      .then(clickTest)
      .catch(catchAll)
      .finally(conditionallyCloseEyesAndEndTest);

			function loadPage() {
			  return browser.get(contentPath).then(() => {
			    console.log(`Page ${contentPath} is loaded`);
			  });
			}

		  function conditionallyOpenEyesAndWaitForSnapshotsToLoad() {
		    return element.all(by.css('[snapshot-name]')).count().then((count) => {
		      if (count > 0) {
		        const eyesParams = {
		          width: global.visualDiffConfig.browserWidth,
		          height: global.visualDiffConfig.browserHeight,
		        };
		        eyes.open(browser, 
		        	`${widgetName} ${global.visualDiffConfig.testLabel}`, 
		        	`${contentPath} Sankeytree: when a node is clicked, its child nodes will be collapsed`, 
		        	eyesParams);
		        openedEyes = true;

		        console.log(`Waiting ${global.visualDiffConfig.pageLoadWaitSeconds * 1000} seconds for widgetsPage`);
		        return new Promise((resolve) => {
		          setTimeout(() => {
		            return resolve();
		          }, global.visualDiffConfig.pageLoadWaitSeconds * 0);
		        });
		      } else {
		        console.log(`No elements containing attribute [snapshot-name] found on page ${contentPath}. Skipping`);
		        return Promise.resolve();
		      }
		    });
		  }

			function takeSnapshots() {
			  const donePromises = element.all(by.css('[snapshot-name]')).each(function (element) {
			    return element.getAttribute('snapshot-name').then((snapshotName) => {
			      if (snapshotName) {
			        console.log(`take snapshot ${contentPath} ${snapshotName}`);
			        snapshotsCount++;
			        eyes.checkRegionBy(by.css(`[snapshot-name="${snapshotName}"]`), snapshotName);
			      } else {
			        console.error(`snapshot on page ${contentPath} missing snapshot name`);
			      }
			    });
			  });
			  return donePromises.then(() => {
			    console.log(`done taking snapshots on ${contentPath}. Running snapshot count: ${snapshotsCount}`);
			  });
			}

			function catchAll(error) {
			  console.log('test error:');
			  console.log(error);
			}

			function conditionallyCloseEyesAndEndTest() {
			  if (openedEyes) { eyes.close(false); }
			  done();
			}

      function clickTest() {
      	return browser.actions().click(element(by.css('.nodeRect'))).perform().then(takeSnapshots);
      	//browser.actions().click(element(by.css('.nodeRect'))).perform();
      }

		});

  });
});

