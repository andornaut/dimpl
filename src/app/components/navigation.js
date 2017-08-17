'use strict';

const Breadcrumbs = require('./breadcrumbs');
const fileSystem = require('../file-system/index');
const KeybindingMixin = require('react-keybinding-mixin');
const navigationActions = require('../actions/navigation');
const NavigationList = require('./navigation-list');
const playerActions = require('../actions/player');
const PureRenderMixin = require('react-addons-pure-render-mixin');
const React = require('react');
const utils = require('../utils');
const web = require('../web');

function applyFilter(links, filter) {
  return links.filter(function (link) {
    return !filter || link.name.toLowerCase().indexOf(filter) !== -1;
  });
}

function makeLinksState(links) {
  const directories = [];
  const files = [];

  for (let link of links) {
    const url = link.url;

    if (utils.isDirectory(url)) {
      directories.push(link);
    } else if (utils.isAudio(url) || utils.isVideo(url)) {
      files.push(link);
    }
  }
  return { directories: directories, files: files };
}

function makeBreadcrumbsState(basePath, path) {
  const len = basePath.length;
  const breadcrumbs = [];

  while (path.length > len && ['/', '\\'].indexOf(path.substr(len)) === -1) {
    breadcrumbs.push(path);
    path = utils.upPath(path);
  }
  breadcrumbs.push(basePath);
  breadcrumbs.reverse();
  return { 'breadcrumbs': breadcrumbs };
}

module.exports = React.createClass({
  mixins: [PureRenderMixin, KeybindingMixin],

  propTypes: {
    baseEntry: React.PropTypes.any,
    baseUrl: React.PropTypes.string.isRequired,
    currentUrl: React.PropTypes.string.isRequired,
    isLocal: React.PropTypes.bool.isRequired,
    password: React.PropTypes.string.isRequired,
    username: React.PropTypes.string.isRequired
  },

  componentDidMount() {
    const KEYS = this.KEYS;

    this.onKey(KEYS.BACKSPACE, this._back);
    this.onKey(KEYS.BACKSPACE, this._backToRoot, { ctrl: true });
    this.onKey('b', this._back);
    this.onKey('b', this._backToRoot, { ctrl: true });
    this.onKey(KEYS.ENTER, this._forward, { input: true });
    this.onKey('f', this._forward);
    this.onKey(KEYS.FORWARD_SLASH, this._focusFilter);
    this.onKey('a', this.handleAddAll);
    this.onKey(KEYS.ESC, this._clearFilter);
    this.onKey(KEYS.ESC, this._blurFilter, { input: true });
    this._fetchState(this.props);
  },

  componentWillReceiveProps(nextProps) {
    const props = this.props;

    if (props.baseEntry !== nextProps.baseEntry
        || props.baseUrl !== nextProps.baseUrl
        || props.currentUrl !== nextProps.currentUrl
        || props.isLocal !== nextProps.isLocal
        || props.password !== nextProps.password
        || props.username !== nextProps.username) {
      this._fetchState(nextProps);
    }
  },

  getInitialState() {
    return {
      breadcrumbs: [],
      directories: [],
      files: [],
      filter: '',
      isLoading: false,
      selectedIndex: 0
    };
  },

  handleAdd(event) {
    event.preventDefault();
    const li = event.currentTarget;
    const ul = li.parentNode.childNodes;
    const selectedIndex = Array.prototype.slice.call(ul).indexOf(li);
    playerActions.addUrl(li.firstElementChild.getAttribute('href'));
    this.setState({ selectedIndex: selectedIndex });
  },

  handleAddAll() {
    const urls = this.state.files.map(function (o) {
      return o.url;
    });

    event.preventDefault();
    playerActions.appendPlaylist(urls);
  },

  handleSelectIndex(selectedIndex) {
    this.setState({ selectedIndex: selectedIndex });
  },

  handleFilter(event) {
    this.setState({ filter: event.target.value.toLowerCase(), selectedIndex: 0 });
  },

  handleNavigate(event) {
    event.preventDefault();
    navigationActions.changeCurrentUrl(event.currentTarget.firstElementChild.getAttribute('href'));
  },

  render() {
    const state = this.state;
    const directories = applyFilter(state.directories, state.filter);
    const files = applyFilter(state.files, state.filter);
    const addButton = !files ? null : (
        <button
            className="navigation-controls__add-all"
            onClick={this.handleAddAll}
            title="Shortcut: a">Add all files</button>);

    return (
        <section className="navigation">
          <Breadcrumbs
              breadcrumbs={state.breadcrumbs}
              handleNavigate={this.handleNavigate}/>
          <div className="navigation-controls">
            <input
                className="navigation-controls__filter"
                onChange={this.handleFilter}
                placeholder="Filter"
                ref="filter"
                value={state.filter}/>
            {addButton}
          </div>
          <NavigationList
              directories={directories}
              files={files}
              handleAdd={this.handleAdd}
              handleSelectIndex={this.handleSelectIndex}
              handleNavigate={this.handleNavigate}
              isLoading={state.isLoading}
              selectedIndex={state.selectedIndex}/>
        </section>
    );
  },

  _back() {
    const breadcrumbs = this.state.breadcrumbs;
    const len = breadcrumbs.length;

    if (len > 1) {
      navigationActions.changeCurrentUrl(breadcrumbs[len - 2]);
    }
  },

  _backToRoot() {
    const breadcrumbs = this.state.breadcrumbs;

    if (breadcrumbs.length) {
      navigationActions.changeCurrentUrl(breadcrumbs[0]);
    }
  },

  _blurFilter() {
    this.refs.filter.blur();
  },

  _clearFilter() {
    this._blurFilter();
    this.setState({ filter: '', selectedIndex: 0 });
  },

  _focusFilter(event) {
    event && event.preventDefault();
    this.refs.filter.focus();
  },

  _forward() {
    const state = this.state;
    const idx = state.selectedIndex;
    let link;

    function getLink(links) {
      return applyFilter(links, state.filter)[idx];
    }

    link = getLink(state.directories);
    if (link) {
      navigationActions.changeCurrentUrl(link.url);
      this._blurFilter();
    }
    link = getLink(state.files);
    if (link) {
      playerActions.addUrl(link.url);
      this._blurFilter();
    }
  },

  _fetchState(props) {
    const currentUrl = props.currentUrl;
    let baseUrl;
    let promise;

    if (props.isLocal) {
      baseUrl = fileSystem.getBaseUrl(props.baseEntry);
      if (props.baseEntry) {
        promise = fileSystem.getIndex(props.currentUrl, props.baseEntry);
      }
    } else {
      baseUrl = props.baseUrl;
      if (props.currentUrl) {
        promise = web.getIndex(props.currentUrl, props.username, props.password);
      }
    }
    if (promise) {
      const breadcrumbState = makeBreadcrumbsState(baseUrl, currentUrl);

      this.setState(Object.assign(this.getInitialState(), { isLoading: true }, breadcrumbState));

      promise.then(function (links) {
        // If the breadcrumbState does not match then a subsequent _fetchState() request must have
        // completed before this one, so these links have been superseded.
        if (this.state.breadcrumbs === breadcrumbState.breadcrumbs) {
          this.setState(Object.assign({ isLoading: false }, makeLinksState(links)));
        }
      }.bind(this));
    }
  }
});
