'use strict';

const KeybindingMixin = require('react-keybinding-mixin');
const playerActions = require('../actions/player');
const PureRenderMixin = require('react-addons-pure-render-mixin');
const React = require('react');
const ScrollIntoViewMixin = require('react-scroll-into-view-mixin');
const utils = require('../utils');

function getSelected() {
  return this.refs.selected;
}

function shouldScrollUp(el, prevProps, prevState) {
  return this.props.playlistIndex < prevProps.playlistIndex;
}

function shouldScrollDown(el, prevProps, prevState) {
  return this.props.playlistIndex > prevProps.playlistIndex;
}

module.exports = React.createClass({
  mixins: [
    PureRenderMixin,
    KeybindingMixin,
    ScrollIntoViewMixin(getSelected, shouldScrollUp, shouldScrollDown)
  ],

  propTypes: {
    isShuffle: React.PropTypes.bool.isRequired,
    playlist: React.PropTypes.array.isRequired,
    playlistIndex: React.PropTypes.number.isRequired,
    regexes: React.PropTypes.array.isRequired
  },

  componentDidMount() {
    const KEYS = this.KEYS;

    this.onKey('c', this.handleClearPlaylist);
    this.onKey('s', this.handleShuffle);
    this.onKey('t', this.handleShuffle);
    this.onKey('x', this._removeCurrentIndex);
    this.onKey('x', this.handleClearPlaylist, { ctrl: true });
    this.onKey(KEYS.LEFT, this._seek.bind(this, -1));
    this.onKey(KEYS.LEFT, this._seek.bind(this, -10), { ctrl: true });
    this.onKey(KEYS.LEFT, this._seekTop, { alt: true });
    this.onKey('h', this._seek.bind(this, -1));
    this.onKey('h', this._seek.bind(this, -10), { ctrl: true });
    this.onKey('h', this._seekTop, { alt: true });
    this.onKey(KEYS.RIGHT, this._seek.bind(this, 1));
    this.onKey(KEYS.RIGHT, this._seek.bind(this, 10), { ctrl: true });
    this.onKey(KEYS.RIGHT, this._seekBottom, { alt: true });
    this.onKey('l', this._seek.bind(this, 1));
    this.onKey('l', this._seek.bind(this, 10), { ctrl: true });
    this.onKey('l', this._seekBottom, { alt: true });
  },

  handleClearPlaylist() {
    playerActions.clearPlaylist();
  },

  handlePlay(idx, event) {
    event.preventDefault();
    playerActions.playIndex(idx);
  },

  handleRemove(idx, event) {
    event.preventDefault();
    event.stopPropagation();
    playerActions.removeIndex(idx);
  },

  handleShuffle(event) {
    event && event.preventDefault();
    playerActions.toggleShuffle();
  },

  render() {
    const props = this.props;
    let controls = null;
    let playlist = props.playlist.map(function (url, i) {
      let className = 'playlist__item';

      if (i === props.playlistIndex) {
        className += ' is-selected';
      }
      return (
          <li
              className={className}
              key={i}
              onClick={this.handlePlay.bind(this, i)}>
            <span title={utils.toName(url)}>{utils.toTitle(props.regexes, url)}</span>
            <a
                href=""
                className="playlist__remove"
                onClick={this.handleRemove.bind(this, i)}
                title="Remove"></a>
          </li>
      );
    }.bind(this));

    if (playlist.length) {
      let playlistClass = 'playlist__shuffle';

      if (props.isShuffle) {
        playlistClass += ' is-shuffled'
      }
      controls = (
          <div className="playlist__controls">
            <button
                onClick={this.handleClearPlaylist}
                title="Shortcut: c">Clear playlist
            </button>
            <a
                href=""
                className={playlistClass}
                onClick={this.handleShuffle}
                title="Shortcut: s or t">Shuffle</a>
          </div>
      );
    } else {
      playlist = <li>Add some media files …</li>;
    }
    return (
        <section className="playlist">
          {controls}
          <ul>{playlist}</ul>
        </section>
    );
  },

  _removeCurrentIndex(event) {
    const idx = this.props.playlistIndex;

    if (idx >= 0) {
      this.handleRemove(idx, event);
    }
  },

  _seek(delta) {
    playerActions.seek(delta);
  },

  _seekBottom() {
    playerActions.seekBottom();
  },

  _seekTop() {
    playerActions.seekTop();
  }
});
