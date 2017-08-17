'use strict';

const backend = require('./backend');
const constants = require('../constants');
const dispatcher = require('../dispatcher');
const EventEmitter = require('events').EventEmitter;
const fileSystem = require('../file-system');

const STORAGE_KEY = 'navigation';

const store = {
  baseId: '',
  baseUrl: '',
  currentUrl: '',
  isLocal: false,
  regexes: ['^.*/(.*)\\.[^/]+$'],
  username: '',
  password: ''
};

const ephemeralStore = {
  baseEntry: null,
  basePath: ''
};

const NavigationStore = Object.assign({}, EventEmitter.prototype, {
  init() {
    return backend.get(store, STORAGE_KEY).then((data) => {
      Object.assign(store, data);

      fileSystem.getBaseEntryAndPath(store.baseId).then((result) => {
        ephemeralStore.baseEntry = result[0];
        ephemeralStore.basePath = result[1];
      });
    });
  },

  emitChange() {
    backend.set(store, STORAGE_KEY);
    this.emit(constants.events.CHANGE);
  },

  getBaseEntry() {
    return ephemeralStore.baseEntry;
  },

  getBasePath() {
    return ephemeralStore.basePath;
  },

  getBaseUrl() {
    return store.baseUrl;
  },

  getCurrentUrl() {
    return store.currentUrl;
  },

  getPassword: function () {
    return store.password;
  },

  getRegexes() {
    return store.regexes;
  },

  getUsername: function () {
    return store.username;
  },

  isLocal() {
    return store.isLocal;
  },

  addChangeListener(callback) {
    this.on(constants.events.CHANGE, callback);
  },

  removeChangeListener(callback) {
    this.removeListener(constants.events.CHANGE, callback);
  }
});

NavigationStore.dispatchToken = dispatcher.register(function (action) {
  switch (action.type) {
    case constants.actions.CHANGE_BASE_ENTRY:
      fileSystem.getEntryPath(action.text).then(function (path) {
        store.currentUrl = '';
        store.baseId = fileSystem.getEntryId(action.text);
        ephemeralStore.baseEntry = action.text;
        ephemeralStore.basePath = path;
        NavigationStore.emitChange();
      });
      break;

    case constants.actions.CHANGE_BASE_URL:
      if (store.baseUrl !== action.text) {
        store.currentUrl = action.text;
      }
      store.baseUrl = action.text;
      NavigationStore.emitChange();
      break;

    case constants.actions.CHANGE_IS_LOCAL:
      store.isLocal = action.text;
      store.currentUrl = store.isLocal ? '' : store.baseUrl;
      NavigationStore.emitChange();
      break;

    case constants.actions.CHANGE_CURRENT_URL:
      store.currentUrl = action.text;
      NavigationStore.emitChange();
      break;

    case constants.actions.CHANGE_PASSWORD:
      store.password = action.text;
      NavigationStore.emitChange();
      break;

    case constants.actions.RESET_REGEXES:
      store.regexes = action.list;
      NavigationStore.emitChange();
      break;

    case constants.actions.CHANGE_USERNAME:
      store.username = action.text;
      NavigationStore.emitChange();
      break;
  }
});

module.exports = NavigationStore;
