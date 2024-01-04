import React from 'react';
import classes from './Alerts.module.css';

/**
 * Component that displays a banner 
 * with alert text and styling based on the variant prop.
*/
const AlertBanner = ({ variant, message }) => {
    return (
        <div className={`alert alert-${variant} ${classes.alertBanner}`} role="alert">
            <span className={classes.alertText}>{message}</span>
        </div>
    );
};

export default AlertBanner;