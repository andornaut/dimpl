'use strict';

const path = require('path');
const utils = require('../utils');

// Electron provides `window.require`, whereas Browserify overwrite `require`.
const {remote} = window.require('electron');
const dialog = remote.dialog;
const fs = remote.require('fs');

module.exports = {
  browse() {
    return new Promise(function (resolve) {
      dialog.showOpenDialog(
          null,
          { properties: ['openDirectory'] },
          function (filenames) {
            resolve(typeof filenames !== 'undefined' ? filenames[0] : null);
          }
      );
    });
  },

  getBaseEntryAndPath(baseId) {
    return Promise.resolve([baseId, baseId]);
  },

  getBaseUrl(entry) {
    return entry + path.sep;
  },

  getEntryId(entry) {
    return entry;
  },

  getEntryPath(entry) {
    return Promise.resolve(entry);
  },

  getIndex(currentUrl, baseEntry) {
    const cwd = currentUrl || baseEntry;

    const parseFile = function (url) {
      url = path.join(cwd, url);
      if (fs.statSync(url).isDirectory()) {
        url += path.sep;
      }
      return { name: utils.toName(path.basename(url)), url: url };
    };

    return new Promise(function (resolve) {
      fs.readdir(cwd, function (err, files) {
        if (files) {
          resolve(utils.sortBy(files.map(parseFile), 'name'));
        }
      });
    });
  },

  makeUrl(url) {
    return Promise.resolve('file://' + url);
  },

  revokeUrl() {
    // No-op.
  }
};
