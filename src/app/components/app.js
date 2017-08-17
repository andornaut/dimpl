'use strict';

const Config = require('./config');
const ElectronAuth = require('../electron-auth');
const KeybindingMixin = require('react-keybinding-mixin');
const Navigation = require('./navigation');
const NavigationStore = require('../stores/navigation');
const Player = require('./player');
const PlayerStore = require('../stores/player');
const Playlist = require('./playlist');
const PureRenderMixin = require('react-addons-pure-render-mixin');
const React = require('react');
const Web = require('../web');

function getState() {
  return {
    baseEntry: NavigationStore.getBaseEntry(),
    basePath: NavigationStore.getBasePath(),
    baseUrl: NavigationStore.getBaseUrl(),
    currentUrl: NavigationStore.getCurrentUrl(),
    isLocal: NavigationStore.isLocal(),
    password: NavigationStore.getPassword(),
    regexes: NavigationStore.getRegexes(),
    username: NavigationStore.getUsername(),

    isShuffle: PlayerStore.isShuffle(),
    mediaUrl: PlayerStore.getMediaUrl(),
    playlist: PlayerStore.getPlaylist(),
    playlistIndex: PlayerStore.getPlaylistIndex()
  };
}

module.exports = React.createClass({
  mixins: [PureRenderMixin, KeybindingMixin],

  componentDidMount() {
    NavigationStore.addChangeListener(this.handleChange);
    PlayerStore.addChangeListener(this.handleChange);

    // The `ElectronAuth` module does not exist when packaged as a Chrome App.
    if (Object.keys(ElectronAuth).length) {
      ElectronAuth.initAuthenticationListener();
    }

    this.onKey('g', this._scrollTop);
    this.onKey('g', this._scrollBottom, { shift: true });
  },

  componentWillUnmount() {
    NavigationStore.removeChangeListener(this.handleChange);
    PlayerStore.removeChangeListener(this.handleChange);
  },

  getInitialState: getState,

  handleChange() {
    this.setState(getState());
  },

  render() {
    const state = this.state;

    return (
        <div>
          <div>
            <Config
                baseUrl={state.baseUrl}
                basePath={state.basePath}
                isLocal={state.isLocal}
                password={state.password}
                regexes={state.regexes}
                username={state.username}/>
            <Navigation
                baseEntry={state.baseEntry}
                baseUrl={state.baseUrl}
                currentUrl={state.currentUrl}
                isLocal={state.isLocal}
                password={state.password}
                username={state.username}/>
          </div>
          <div>
            <Player
                baseEntry={state.baseEntry}
                mediaUrl={state.mediaUrl}
                regexes={state.regexes}/>
            <Playlist
                isShuffle={state.isShuffle}
                playlist={state.playlist}
                playlistIndex={state.playlistIndex}
                regexes={state.regexes}/>
          </div>
        </div>
    );
  },

  _scrollBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  },

  _scrollTop() {
    window.scrollTo(0, 0);
  }
});
