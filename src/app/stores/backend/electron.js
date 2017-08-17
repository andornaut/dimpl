'use strict';

const utils = require('../../utils');

module.exports = {
  get(_, storage_key) {
    // The first argument (a "store") is unused, but is necessary to maintain compatibility with the chrome backend.
    const data = JSON.parse(localStorage.getItem(storage_key));
    return Promise.resolve(data)
  },

  set: utils.debounce((store, storage_key) => {
    localStorage.setItem(storage_key, JSON.stringify(store));
  })
};
