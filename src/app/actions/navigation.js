'use strict';

const actions = require('../constants').actions;
const dispatcher = require('../dispatcher');

module.exports = {
  changeBaseEntry(text) {
    dispatcher.dispatch({
      type: actions.CHANGE_BASE_ENTRY,
      text: text
    });
  },

  changeBaseUrl(text) {
    dispatcher.dispatch({
      type: actions.CHANGE_BASE_URL,
      text: text
    });
  },

  changeCurrentUrl(text) {
    dispatcher.dispatch({
      type: actions.CHANGE_CURRENT_URL,
      text: text
    });
  },

  changeIsLocal(text) {
    dispatcher.dispatch({
      type: actions.CHANGE_IS_LOCAL,
      text: text
    });
  },

  changeUsername(text) {
    dispatcher.dispatch({
      type: actions.CHANGE_USERNAME,
      text: text
    });
  },

  changePassword(text) {
    dispatcher.dispatch({
      type: actions.CHANGE_PASSWORD,
      text: text
    });
  },

  resetRegexes(list) {
    dispatcher.dispatch({
      type: actions.RESET_REGEXES,
      list: list
    });
  }
};
