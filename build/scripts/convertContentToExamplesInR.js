
const _ = require('lodash');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');
const rFunction = require('../config/widget.config.json').rFunction;
const contentManifest = require('../../browser/content/contentManifest.json');

const contentFiles = _.flattenDeep(_.values(contentManifest));

const internalWebDirectory = path.normalize(`${__dirname}/../../theSrc/internal_www`);
const destinationDirectory = path.normalize(`${__dirname}/../../examples`);

const buildRFiles = function () {
  return Promise.all(contentFiles.map((contentPath) => {
    return loadDemoFile(contentPath)
      .then(processAndSaveDemo);
  }));
};

function loadDemoFile(relativePathToContentFile) {
  return new Promise((resolve, reject) => {
    return fs.readFile(path.normalize(internalWebDirectory + relativePathToContentFile), 'utf8', function (err, content) {
      if (err) { return reject(err); }
      return resolve({ contentName: relativePathToContentFile, content });
    });
  });
}

function processAndSaveDemo({ contentName, content }) {
  const rFileContents = [
    `#This file is auto generated from ${contentName}`,
    '#The html examples and tutorial are the source of truth and are far more readable and beneficial. Start there (see readme for how).',
    '#Use these r files for reference, but know that some instructional content is not transferred from the html to the r examples files',
    '#TL;DR View the tutorial/example the way it was meant to be: in HTML format!',
    '',
  ];

  const $ = cheerio.load(content);
  const sections = $('section');
  sections.each(function () {
    const titles = $(this).find('h2, h3');
    titles.each(function () {
      const title = $(this).text();
      return rFileContents.push(`#${title}`);
    });

    const notes = $(this).find('p');
    notes.each(function () {
      const note = $(this).text();
      return rFileContents.push(`##${note}`);
    });

    const listItems = $(this).find('li');
    listItems.each(function () {
      const listItem = $(this).text();
      return rFileContents.push(`## * ${listItem}`);
    });

    const examples = $(this).find('.example');
    examples.each(function () {
      const exampleConfig = $(this).text().replace(/\n/g, '').replace(new RegExp(' +', 'g'), ' ');
      return rFileContents.push(`${rFunction}('${exampleConfig}')`);
    });
    return rFileContents.push('');
  });
  const destination = path.normalize(`${destinationDirectory}/${contentName.replace(/^\/content/, '').replace(/.html$/, '.r')}`);
  return saveContents({ destination, content: rFileContents.join('\n') });
}

function saveContents({ destination, content }) {
  const directory = path.dirname(destination);
  return ensureDirectoryExists(directory).then(function () {
    return new Promise((resolve, reject) => {
      return fs.writeFile(destination, content, 'utf8', function (err) {
        if (err) { return reject(err); }
        return resolve(destination);
      });
    });
  });
}

function ensureDirectoryExists(directory) {
  return new Promise((resolve, reject) => {
    return fs.mkdirp(directory, function (err) {
      if (err) { return reject(err); }
      return resolve();
    });
  });
}

buildRFiles().then(function (results) {
  console.log('Done generating R Examples from HTML. Files generated:');
  console.log(results.join('\n'));
  return process.exit(0);
}).catch(function (error) {
  console.log('Error generating R Examples from HTML: ');
  console.log(error);
  return process.exit(1);
});
