'use strict';

const actions = require('../constants').actions;
const dispatcher = require('../dispatcher');

module.exports = {
  addUrl(text) {
    dispatcher.dispatch({
      type: actions.ADD_URL,
      text: text
    });
  },

  appendPlaylist(list) {
    dispatcher.dispatch({
      type: actions.APPEND_PLAYLIST,
      list: list
    });
  },

  clearPlaylist() {
    dispatcher.dispatch({
      type: actions.CLEAR_PLAYLIST
    });
  },

  seek(number) {
    dispatcher.dispatch({
      type: actions.SEEK,
      number: number
    });
  },

  seekBottom(number) {
    dispatcher.dispatch({
      type: actions.SEEK_BOTTOM
    });
  },

  seekTop(number) {
    dispatcher.dispatch({
      type: actions.SEEK_TOP
    });
  },

  playIndex(number) {
    dispatcher.dispatch({
      type: actions.PLAY_INDEX,
      number: number
    });
  },

  removeIndex(number) {
    dispatcher.dispatch({
      type: actions.REMOVE_INDEX,
      number: number
    });
  },

  toggleShuffle() {
    dispatcher.dispatch({
      type: actions.TOGGLE_SHUFFLE
    });
  }
};
