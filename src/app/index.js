'use strict';

const App = require('./components/app');
const navigationStore = require('./stores/navigation');
const playerStore = require('./stores/player');
const React = require('react');
const ReactDOM = require('react-dom');

Promise.all([navigationStore.init(), playerStore.init()]).then(function () {
  ReactDOM.render(<App/>, document.getElementById('app'));
});