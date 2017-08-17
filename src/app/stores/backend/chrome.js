'use strict';

/**
 * Use `chrome.storage.local` instead of `chrome.storage.sync` in order to avoid issues lower quotas for "sync".
 *
 * local:
 *  QUOTA_BYTES = 5,242,880
 * sync:
 *  QUOTA_BYTES = 102,400
 *  QUOTA_BYTES_PER_ITEM = 8,192
 *
 * See: https://developer.chrome.com/apps/storage#property-local
 */

const utils = require('../../utils');

module.exports = {
  get(store) {
    // This function will receive a second argument (a "storage_key"), which is unused, but callers must supply it
    // to maintain compatibility with the electron backend.
    return new Promise(function (resolve) {
      // https://developer.chrome.com/extensions/storage#method-StorageArea-get
      chrome.storage.local.get(Object.keys(store), function (data) {
        resolve(data);
      }.bind(this));
    });
  },

  set: utils.debounce((store) => {
    // https://developer.chrome.com/extensions/storage#method-StorageArea-set
    chrome.storage.local.set(store);
  }, 1000)
};
