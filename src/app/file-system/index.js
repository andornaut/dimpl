'use strict';

// One of these implementations will be replaced with an empty object by Browserify.
const chromeImpl = require('./chrome');
const electronImpl = require('./electron');
module.exports = Object.keys(chromeImpl).length ? chromeImpl : electronImpl;
