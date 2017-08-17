'use strict';

const NavigationStore = require('./stores/navigation');
const Web = require('./web');

// Electron provides `window.require`, whereas Browserify overwrite `require`.
const { remote } = window.require('electron');
const session = remote.session;

const initAuthenticationListener = () => {
  // Hooking into the 'login' event does not work for <video> elements, but `onBeforeSendHeaders` works.
  // https://github.com/electron/electron/blob/master/docs/api/web-request.md#webrequestonbeforesendheadersfilter-listener
  // https://github.com/electron/electron/blob/master/docs/api/app.md#event-login
  session.defaultSession.webRequest.onBeforeSendHeaders({ urls: ['*'] }, (details, callback) => {
    const authorizationHeader = Web.createAuthorizationHeader(
        NavigationStore.getUsername(), NavigationStore.getPassword());

    let headers = details.requestHeaders;
    if (authorizationHeader && details.url.startsWith(NavigationStore.getBaseUrl())) {
      headers = { 'Authorization': authorizationHeader};
    }
    callback({ cancel: false, requestHeaders: headers });
  });
};

module.exports = { initAuthenticationListener };
