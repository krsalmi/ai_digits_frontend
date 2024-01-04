import React from 'react';
import classes from './Progress.module.css';

/**
 * ProgressBar React component that renders a progress bar.
 * Takes in a percentage prop to determine the width of the progress bar.
 */
const ProgressBar = ({ percentage }) => {

  return (
    <div className={classes.progressBarContainer}>
      <div className={classes.progressBar} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

export default ProgressBar;
