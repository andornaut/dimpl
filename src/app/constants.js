'use strict';

const keyMirror = require('keymirror');

module.exports = {
  actions: keyMirror({
    CHANGE_BASE_ENTRY: null,
    CHANGE_BASE_URL: null,
    CHANGE_CURRENT_URL: null,
    CHANGE_IS_LOCAL: null,
    CHANGE_PASSWORD: null,
    CHANGE_USERNAME: null,
    RESET_REGEXES: null,

    ADD_URL: null,
    APPEND_PLAYLIST: null,
    CLEAR_PLAYLIST: null,
    PLAY_INDEX: null,
    REMOVE_INDEX: null,
    SEEK: null,
    SEEK_BOTTOM: null,
    SEEK_TOP: null,
    TOGGLE_SHUFFLE: null
  }),

  events: keyMirror({
    CHANGE: null
  })
};
