'use strict';

const ConfigForm = require('./config-form');
const KeybindingMixin = require('react-keybinding-mixin');
const PureRenderMixin = require('react-addons-pure-render-mixin');
const React = require('react');

module.exports = React.createClass({
  mixins: [PureRenderMixin, KeybindingMixin],

  propTypes: {
    basePath: React.PropTypes.string.isRequired,
    baseUrl: React.PropTypes.string.isRequired,
    isLocal: React.PropTypes.bool.isRequired,
    password: React.PropTypes.string.isRequired,
    regexes: React.PropTypes.array.isRequired,
    username: React.PropTypes.string.isRequired
  },

  componentDidMount() {
    this.onKey('m', this.handleClick);
    this.onKey('o', this.handleClick);
  },

  getInitialState() {
    return {
      isOpen: !this.props.baseUrl
    };
  },

  handleClick(event) {
    event.preventDefault();
    this.setState({ isOpen: !this.state.isOpen });
  },

  handleSubmit() {
    this.setState({ isOpen: false });
  },

  render() {
    const props = this.props;
    const form = !this.state.isOpen ? null : (
        <ConfigForm
            baseUrl={props.baseUrl}
            handleSubmit={this.handleSubmit}
            basePath={props.basePath}
            isLocal={props.isLocal}
            password={props.password}
            regexes={props.regexes}
            username={props.username}/>
    );
    return (
        <section className="config">
          <div>
            <a
                href=""
                className="config__menu"
                onClick={this.handleClick}
                title="Menu">☰</a>
            {form}
          </div>
        </section>
    );
  }
});
