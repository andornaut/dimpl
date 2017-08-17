'use strict';

chrome.app.runtime.onLaunched.addListener(function () {
  chrome.app.window.create('index.html', {
    id: 'dimpl',
    outerBounds: {
      minWidth: 400,
      minHeight: 600,
      width: 768,
      height: 1024
    }
  });
});