'use strict';

const utils = require('./utils');

const FETCH_OPTIONS = { credentials: 'include', mode: 'cors' };
const IGNORED_LINK_NAMES = ['parent directory', 'name', 'last modified', 'size', 'description'];

const normalizeCredentials = (username, password) => {
  if (username === null || username === '') {
    return '';
  }
  if (password === null || password === '') {
    return username;
  }
  return username + ':' + password;
};

const handleStatus = (response) => (200 <= response.status < 300)
    ? Promise.resolve(response)
    : Promise.reject(new Error(response.statusText));

const toHtml = (response) => response.text();

const toAnchors = (text) => Array.from((new DOMParser()).parseFromString(text, 'text/html').getElementsByTagName('a'));

const toLink = (baseUrl) => (anchor) => {
  let path = anchor.getAttribute('href');
  if (path.startsWith('.')) {
    return;
  }
  // The directory index may contain shortened path names, which end in "..>".
  const name = utils.toName(anchor.textContent.replace('..>', '…'));
  if (IGNORED_LINK_NAMES.indexOf(name.toLowerCase()) !== -1) {
    return;
  }
  if (path.startsWith('/')) {
    path = path.substr(1);
  }
  return { name: name, url: baseUrl + path };

};

const toLinks = (baseUrl) => (text) => utils.compact(toAnchors(text).map(toLink(baseUrl)));

const createAuthorizationHeader = (username, password) => {
  const credentials = normalizeCredentials(username, password);
  if (credentials !== '') {
    return 'Basic ' + btoa(credentials);
  }
  return '';
};

const getIndex = (currentUrl, username, password) => {
  const headers = new Headers();
  const authorizationHeader = createAuthorizationHeader(username, password);
  if (authorizationHeader) {
    headers.append('Authorization', authorizationHeader);
  }
  const options = Object.assign({ headers: headers }, FETCH_OPTIONS);
  // We make the request to `currentUrl`, but we normalize the `baseUrl` used for creating the index result URLs.
  const baseUrl = currentUrl.endsWith('/') ? currentUrl : currentUrl + '/';
  return fetch(currentUrl, options).then(handleStatus).then(toHtml).then(toLinks(baseUrl));
};

module.exports = {
  createAuthorizationHeader,
  getIndex
};
