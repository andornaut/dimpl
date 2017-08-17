'use strict';

const utils = require('../utils');

module.exports = {
  browse() {
    return new Promise(function (resolve) {
      chrome.fileSystem.chooseEntry({ type: 'openDirectory' }, function (entry) {
        if (chrome.runtime.lastError) {
          resolve(null);
        } else {
          resolve(entry);
        }
      }.bind(this));
    });
  },

  getBaseEntryAndPath(baseId) {
    return new Promise(function (resolve) {
      if (baseId) {
        chrome.fileSystem.restoreEntry(baseId, function (entry) {
          if (chrome.runtime.lastError) {
            resolve([null, '']);
          } else {
            chrome.fileSystem.getDisplayPath(entry, function (displayPath) {
              resolve([entry, displayPath]);
            });
          }
        });
      } else {
        resolve([null, '']);
      }
    });
  },

  getBaseUrl() {
    return '';
  },

  getEntryId(entry) {
    return chrome.fileSystem.retainEntry(entry);
  },

  getEntryPath(entry) {
    return new Promise(function (resolve) {
      chrome.fileSystem.getDisplayPath(entry, function (path) {
        resolve(path);
      });
    });
  },

  getIndex(currentUrl, baseEntry) {
    const parseEntry = function (entry) {
      let url = entry.fullPath.substr(baseEntry.fullPath.length + 1);

      if (entry.isDirectory) {
        url += '/';
      }
      return { name: utils.toName(utils.basename(url)), url: url };
    };

    return new Promise(function (resolve) {
      baseEntry.getDirectory(currentUrl, {}, function (dirEntry) {
        const reader = dirEntry.createReader();
        let result = [];

        // https://developer.mozilla.org/en-US/docs/Web/API/DirectoryReader#readEntries
        // "Call this method until an empty array is returned."
        const readSomeEntries = function () {
          reader.readEntries(function (entries) {
            if (entries.length) {
              result = result.concat(entries);
              readSomeEntries();
            } else {
              result = result.map(parseEntry);
              resolve(utils.sortBy(result, 'name'));
            }
          });
        };
        readSomeEntries();
      });
    });
  },

  makeUrl(url, baseEntry) {
    if (baseEntry) {
      return new Promise(function (resolve) {
        baseEntry.getFile(url, {}, function (fileEntry) {
          if (fileEntry) {
            fileEntry.file(function (file) {
              resolve(URL.createObjectURL(file));
            }, function () {
              resolve('');
            });
          } else {
            resolve('');
          }
        });
      });
    }
    return Promise.resolve('');
  },

  revokeUrl(url) {
    URL.revokeObjectURL(url);
  }
};
