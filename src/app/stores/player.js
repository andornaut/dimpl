'use strict';

const backend = require('./backend');
const constants = require('../constants');
const dispatcher = require('../dispatcher');
const EventEmitter = require('events').EventEmitter;
const immutable = require('../immutable');

const STORAGE_KEY = 'player';

const store = {
  isShuffle: false,
  // mediaUrl is maintained separately from playlist+playlistIndex because
  // clearing the playlist shouldn't clear the mediaUrl.
  mediaUrl: '',
  playlist: [],
  playlistIndex: -1
};

function removeIndex(idx) {
  store.playlist = immutable.removeIndex(store.playlist, idx);

  if (!store.playlist.length) {
    store.playlistIndex = -1;
  } else if (store.playlistIndex === idx) {
    selectIndex(idx); // Handle rollover.
  }
}

function selectIndex(idx) {
  const len = store.playlist.length;

  if (idx > len - 1) {
    idx = 0
  } else if (idx < 0) {
    idx = len - 1;
  }
  store.mediaUrl = store.playlist[idx];
  store.playlistIndex = idx;
}

function seek(delta) {
  let idx = -1;
  const len = store.playlist.length;

  if (len) {
    if (store.isShuffle) {
      // Randomize, but don't replay the same song.
      delta = Math.floor(Math.random() * len - 1) + 1;
      idx = (store.playlistIndex + delta) % len;
    } else {
      idx = store.playlistIndex + delta;
    }
    selectIndex(idx);
  }
}

function seekBottom() {
  const len = store.playlist.length;

  if (len) {
    selectIndex(len - 1);
  }
}

function seekTop() {
  if (store.playlist.length) {
    selectIndex(0);
  }
}


const PlayerStore = Object.assign({}, EventEmitter.prototype, {
  init() {
    return backend.get(store, STORAGE_KEY).then((data) => {
      Object.assign(store, data);
    });
  },

  emitChange() {
    backend.set(store, STORAGE_KEY);
    this.emit(constants.events.CHANGE);
  },

  getMediaUrl() {
    return store.mediaUrl;
  },

  getPlaylist() {
    return store.playlist;
  },

  getPlaylistIndex() {
    return store.playlistIndex;
  },

  isShuffle() {
    return store.isShuffle;
  },

  addChangeListener(callback) {
    this.on(constants.events.CHANGE, callback);
  },

  removeChangeListener(callback) {
    this.removeListener(constants.events.CHANGE, callback);
  }
});

PlayerStore.dispatchToken = dispatcher.register(function (action) {
  switch (action.type) {
    case constants.actions.ADD_URL:
      store.playlist = immutable.add(store.playlist, action.text);
      PlayerStore.emitChange();
      break;

    case constants.actions.APPEND_PLAYLIST:
      store.playlist = immutable.append(store.playlist, action.list);
      PlayerStore.emitChange();
      break;

    case constants.actions.CLEAR_PLAYLIST:
      store.playlist = [];
      store.playlistIndex = -1;
      PlayerStore.emitChange();
      break;

    case constants.actions.SEEK:
      seek(action.number);
      PlayerStore.emitChange();
      break;

    case constants.actions.SEEK_BOTTOM:
      seekBottom();
      PlayerStore.emitChange();
      break;

    case constants.actions.SEEK_TOP:
      seekTop();
      PlayerStore.emitChange();
      break;

    case constants.actions.PLAY_INDEX:
      selectIndex(action.number);
      PlayerStore.emitChange();
      break;

    case constants.actions.REMOVE_INDEX:
      removeIndex(action.number);
      PlayerStore.emitChange();
      break;

    case constants.actions.TOGGLE_SHUFFLE:
      store.isShuffle = !store.isShuffle;
      PlayerStore.emitChange();
      break;
  }
});

module.exports = PlayerStore;
