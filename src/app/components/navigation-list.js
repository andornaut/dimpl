'use strict';

const KeybindingMixin = require('react-keybinding-mixin');
const PureRenderMixin = require('react-addons-pure-render-mixin');
const React = require('react');
const ScrollIntoViewMixin = require('react-scroll-into-view-mixin');
const utils = require('../utils');

function makeItem(selectedIndex, i, clickHandler, anchor) {
  let className = 'navigation-list__item';
  const isSelected = selectedIndex === i;

  if (isSelected) {
    className += ' is-selected';
  }
  return <li key={i} ref={isSelected ? "selected" : null} onClick={clickHandler} className={className}>{anchor}</li>;
}

function getSelected() {
  return this.refs.selected;
}

function shouldScrollUp(el, prevProps, prevState) {
  return this.props.selectedIndex < prevProps.selectedIndex;
}

function shouldScrollDown(el, prevProps, prevState) {
  return this.props.selectedIndex > prevProps.selectedIndex;
}

module.exports = React.createClass({
  mixins: [
    PureRenderMixin,
    KeybindingMixin,
    ScrollIntoViewMixin(getSelected, shouldScrollUp, shouldScrollDown)
  ],

  propTypes: {
    directories: React.PropTypes.arrayOf(React.PropTypes.shape({
      'name': React.PropTypes.string.isRequired,
      'url': React.PropTypes.string.isRequired
    })).isRequired,
    files: React.PropTypes.arrayOf(React.PropTypes.shape({
      'name': React.PropTypes.string.isRequired,
      'url': React.PropTypes.string.isRequired
    })).isRequired,
    handleAdd: React.PropTypes.func.isRequired,
    handleNavigate: React.PropTypes.func.isRequired,
    handleSelectIndex: React.PropTypes.func.isRequired,
    isLoading: React.PropTypes.bool.isRequired,
    selectedIndex: React.PropTypes.number.isRequired
  },

  componentDidMount() {
    const KEYS = this.KEYS;

    this.onKey(KEYS.DOWN, this._seek.bind(this, 1));
    this.onKey(KEYS.DOWN, this._seek.bind(this, 10), { ctrl: true });
    this.onKey(KEYS.DOWN, this._seekBottom, { alt: true });
    this.onKey('j', this._seek.bind(this, 1));
    this.onKey('j', this._seek.bind(this, 10), { ctrl: true });
    this.onKey('j', this._seekBottom, { alt: true });
    this.onKey(KEYS.UP, this._seek.bind(this, -1));
    this.onKey(KEYS.UP, this._seek.bind(this, -10), { ctrl: true });
    this.onKey(KEYS.UP, this._seekTop, { alt: true });
    this.onKey('k', this._seek.bind(this, -1));
    this.onKey('k', this._seek.bind(this, -10), { ctrl: true });
    this.onKey('k', this._seekTop, { alt: true });
  },

  render() {
    const props = this.props;

    if (props.isLoading) {
      return <p className="navigation-loading"></p>;
    } else {
      let directories = props.directories;
      let files = props.files;
      const idx = props.selectedIndex;

      directories = directories.map(function (link, i) {
        return makeItem(idx, i, props.handleNavigate,
            <a
                href={link.url}
                title="Navigate">{link.name}</a>);
      });
      files = files.map(function (link, i) {
        return makeItem(idx, i + directories.length, props.handleAdd,
            <a
                href={link.url}
                title="Add to playlist">{link.name}</a>);
      });
      return <ul className="navigation-list">{directories}{files}</ul>;
    }
  },

  _seek(delta, event) {
    const props = this.props;
    const len = props.directories.length + props.files.length;

    event.preventDefault();
    if (len) {
      let idx = props.selectedIndex;

      idx = (idx + delta) % len;
      if (idx < 0) {
        idx = len - 1;
      }
      this.props.handleSelectIndex(idx);
    }
  },

  _seekBottom(event) {
    const props = this.props;
    const len = props.directories.length + props.files.length;

    event.preventDefault();
    if (len) {
      props.handleSelectIndex(len - 1);
    }
  },

  _seekTop(event) {
    this.props.handleSelectIndex(0);
  }
});
