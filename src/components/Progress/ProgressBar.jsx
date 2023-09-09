import React from 'react';
import classes from './Progress.module.css';

const ProgressBar = ({percentage}) => {

  return (
    <div className={classes.progressBarContainer}>
      <div className={classes.progressBar} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

export default ProgressBar;
