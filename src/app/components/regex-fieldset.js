'use strict';

const React = require('react');
const immutable = require('../immutable');
const utils = require('../utils');

const GROUPS = <a
    href="https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references"
    target="_blank">capturing groups</a>;
const REGEX = <a
    href="https://en.wikipedia.org/wiki/Regular_expression"
    target="_blank">regular expressions</a>;

function regexFieldset(props) {
  const regexes = props.regexes;
  const removeButton = regexes.length > 1 ? <button onClick={handleRemove} type="button">-</button> : null;
  const inputs = regexes.map(function (regex, i) {
    return (
        <input
            key={i}
            onChange={handleChange.bind(this, i)}
            required={i === 0}
            type="text"
            value={regex}/>
    );
  });

  function handleAdd() {
    props.handleChangeRegexes(immutable.add(regexes, ''));
  }

  function handleRemove() {
    props.handleChangeRegexes(immutable.removeIndex(regexes, regexes.length - 1));
  }

  function handleChange(i, event) {
    props.handleChangeRegexes(immutable.updateIndex(regexes, i, event.target.value));
  }

  return (
      <p className="regex">
        <label>Regular expressions</label>
        {inputs}
        <span className="regex__controls">
                <button onClick={handleAdd} type="button">+</button>
          {removeButton}
            </span>
        <small>
          Each file URL will be matched against these {REGEX}. The match with the most {GROUPS} will be used to
          compute each file's title.
        </small>
      </p>
  );
}

regexFieldset.propTypes = {
  handleChangeRegexes: React.PropTypes.func.isRequired,
  regexes: React.PropTypes.array.isRequired
};

module.exports = regexFieldset;
