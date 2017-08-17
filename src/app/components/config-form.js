'use strict';

const fileSystem = require('../file-system/index');
const navigationActions = require('../actions/navigation');
const PureRenderMixin = require('react-addons-pure-render-mixin');
const React = require('react');
const RegexFieldset = require('./regex-fieldset');
const utils = require('../utils');

const DIRECTORY_INDEX = <a
    href="https://en.wikipedia.org/wiki/Webserver_directory_index"
    target="_blank">web server directory index</a>;
const HOMEPAGE = <a
    href="https://github.com/andornaut/dimpl"
    target="_blank">Project Homepage</a>;
const HTTP_BASIC_AUTH = <a
    href="https://en.wikipedia.org/wiki/Basic_access_authentication"
    target="_blank">HTTP Basic Authentication</a>;

module.exports = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    basePath: React.PropTypes.string.isRequired,
    baseUrl: React.PropTypes.string.isRequired,
    handleSubmit: React.PropTypes.func.isRequired,
    isLocal: React.PropTypes.bool.isRequired,
    password: React.PropTypes.string.isRequired,
    regexes: React.PropTypes.array.isRequired,
    username: React.PropTypes.string.isRequired
  },

  getInitialState() {
    const props = this.props;

    return {
      baseUrl: props.baseUrl,
      isLocal: props.isLocal,
      password: props.password,
      regexes: props.regexes,
      username: props.username
    };
  },

  handleBrowse(event) {
    event.preventDefault();

    fileSystem.browse().then(function (entry) {
      if (entry) {
        // Chrome cannot play media that is associated with a previous baseEntry. Electron can, though, so
        // let's not preemptively clear the playlist.
        navigationActions.changeBaseEntry(entry);
      }
    });
  },

  handleChangeBaseUrl(event) {
    this.setState({ baseUrl: event.target.value });
  },

  handleChangeIsLocal(event) {
    const isLocal = event.target.value === 'true';

    this.setState({ isLocal: isLocal });
    navigationActions.changeIsLocal(isLocal);
  },

  handleChangeRegexes(regexes) {
    this.setState({ regexes: regexes });
  },

  handleChangeUsername(event) {
    this.setState({ username: event.target.value });
  },

  handleChangePassword(event) {
    this.setState({ password: event.target.value });
  },

  handleSubmit(event) {
    const baseUrl = this.state.baseUrl.trim();
    const initialRegexes = this.props.regexes;

    event.preventDefault();

    const regexes = utils.compact(this.state.regexes.map(function (regex, i) {
      regex = regex.trim();
      try {
        new RegExp(regex); // Validate and discard the result.
      } catch (e) {
        // Reset if the regex is invalid.
        regex = initialRegexes[i];
      }
      return regex || null;
    }));

    this.setState({ baseUrl: baseUrl, regexes: regexes });
    navigationActions.changeBaseUrl(baseUrl);
    navigationActions.changeUsername(this.state.username);
    navigationActions.changePassword(this.state.password);
    navigationActions.resetRegexes(regexes);
    this.props.handleSubmit();
  },

  render() {
    let localClass = 'source-tab';
    let localLabelClass = 'source-radio__label';
    let webClass = 'source-tab';
    let webLabelClass = 'source-radio__label';

    if (this.state.isLocal) {
      localClass += ' is-selected';
      localLabelClass += ' is-selected';
    } else {
      webClass += ' is-selected';
      webLabelClass += ' is-selected';
    }
    return (
        <form className="config-form" onSubmit={this.handleSubmit}>
          <p className="source-radio">
            <label className={localLabelClass}>
              <input
                  checked={this.state.isLocal}
                  onChange={this.handleChangeIsLocal}
                  name="is-local"
                  type="radio"
                  value="true"/>
              <span className="source-radio__text">Local</span>
            </label>
            <label className={webLabelClass}>
              <input
                  checked={!this.state.isLocal}
                  onChange={this.handleChangeIsLocal}
                  name="is-local"
                  type="radio"
                  value="false"/>
              <span className="source-radio__text">Web</span>
            </label>
          </p>
          <p className={localClass}>
            <label>Directory</label>
            <span className="source-tab__container">
                        <output className="source-tab__output">
                            {this.props.basePath}</output>
                        <button
                            onClick={this.handleBrowse}
                            type="button">Browse
                        </button>
                    </span>
            <small>Browse to the root directory of your local media library.</small>
          </p>
          <p className={webClass}>
            <label>Web-address</label>
            <input
                className="source-tab__input"
                onChange={this.handleChangeBaseUrl}
                placeholder="https://example.com/media"
                type="text"
                value={this.state.baseUrl}/>
            <small>
              Enter the URL of your media directory's {DIRECTORY_INDEX}.
            </small>

            <label>Username (optional)</label>
            <input
                className="source-tab__input"
                onChange={this.handleChangeUsername}
                type="text"
                value={this.state.username}/>

            <label>Password (optional)</label>
            <input
                className="source-tab__input"
                onChange={this.handleChangePassword}
                type="password"
                value={this.state.password}/>
            <small>
              {HTTP_BASIC_AUTH}
            </small>
          </p>

          <RegexFieldset
              handleChangeRegexes={this.handleChangeRegexes}
              regexes={this.state.regexes}/>
          <p className="config-form__controls">
            <button type="submit">Save</button>
            {HOMEPAGE}
          </p>
        </form>
    );
  }
});
