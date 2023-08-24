import React from 'react';
import classes from './Alerts.module.css';

const AlertBanner = ({variant, message}) => {
    return (
        <div className={`alert alert-${variant} ${classes.alertBanner}`} role="alert">
            <span className={classes.alertText}>{message}</span>
        </div>
    );
};

export default AlertBanner;