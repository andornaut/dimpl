'use strict';

const React = require('react');

function playerControls(props) {
  const className = 'player-controls__control player-controls__control';
  const playModifier = props.isPlaying ? '--pause' : '--play';

  return (
      <p className="player-controls">
        <button
            className={className + '--rw'}
            onClick={props.handlePrevious}
            title="Shortcut: h or left-arrow"></button>
        <button
            className={className + playModifier}
            onClick={props.handlePlay}
            title="Shortcut: p or space"/>
        <button
            className={className + '--ff'}
            onClick={props.handleNext}
            title="Shortcut: l or right-arrow"></button>
      </p>
  );
}

playerControls.propTypes = {
  handleNext: React.PropTypes.func.isRequired,
  handlePlay: React.PropTypes.func.isRequired,
  handlePrevious: React.PropTypes.func.isRequired,
  isPlaying: React.PropTypes.bool.isRequired
};

module.exports = playerControls;
