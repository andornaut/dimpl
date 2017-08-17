'use strict';

const React = require('react');
const utils = require('../utils');

function breadcrumbs(props) {
  const breadcrumbs = props.breadcrumbs.map(function (url, i) {
    let className = 'breadcrumbs__item';
    let name;
    let title;

    if (i === 0) {
      className += ' breadcrumbs__item--root';
      name = '⌂';
      title = 'Shortcut: ctrl + b'
    } else {
      className += ' breadcrumbs__item--subdir';
      name = utils.toName(utils.basename(url));
      title = 'Shortcut: b or backspace'
    }
    return (
        <li key={i} className={className} onClick={props.handleNavigate}>
          <a href={url} title={title}>{name}</a>
        </li>
    );
  });

  return <ul className="breadcrumbs">{breadcrumbs}</ul>;
}

breadcrumbs.propTypes = {
  breadcrumbs: React.PropTypes.array.isRequired,
  handleNavigate: React.PropTypes.func.isRequired
};

module.exports = breadcrumbs;
