import React from "react";
import classes from './DescriptionSide.module.css';
import titleImage from '../../img/Digit Recognition with Machine Learning.png';
import { CNN_DESCRIPTION } from "../../utils/constants";
import arrowImage from '../../img/Draw a digit and test it out.png';

/**
 * DescriptionSide component.
 * Renders the description side content (visible on the right side of the page).
 */
const DescriptionSide = () => {

    return (
        <div className={classes.container}>
            <div className={classes.imagesDiv}>
                <img src={titleImage} alt="page title" className={classes.titleImg}/>
                <img src={arrowImage} alt="Arrow" className={classes.arrowImg}/>
            </div>
            <div className={classes.cnnDescDiv}>
                <div className={classes.cnnTitleDiv}>
                    <h3><span className={classes.cnnTitle}>{CNN_DESCRIPTION.TITLE}</span></h3>
                </div>
                <div className={classes.cnnDescription}>
                    <p>{CNN_DESCRIPTION.TEXT_1}</p>
                    <p>{CNN_DESCRIPTION.TEXT_2}</p>
                </div>
            </div>
        </div>
    );
};

export default DescriptionSide