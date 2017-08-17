'use strict';

// See: https://github.com/sindresorhus/electron-boilerplate/blob/master/boilerplate/index.js

const {app, BrowserWindow, globalShortcut} = require('electron');

// Prevent window being garbage collected
let mainWindow;

function createMainWindow() {
  const win = new BrowserWindow({ width: 1024, height: 768 });
  win.loadURL(`file://${__dirname}/index.html`);
  win.on('closed', () => {
    mainWindow = null;
  });

  globalShortcut.register('F12', () => win.toggleDevTools());
  return win;
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

app.on('ready', () => {
  mainWindow = createMainWindow();
});
