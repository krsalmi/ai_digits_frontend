import React, { useState } from 'react';
import classes from './ButtonsComponent.module.css';
import { HOVER_TEXTS } from '../../utils/constants';
import { Triangle } from 'react-loader-spinner';

const HoverButton = ({label, onClickFunction, hoverText, setHoverMessage, isDisabled=false}) => {

    const buttonClasses = `${classes.buttonClass} btn`

    return (
        <div onMouseEnter={() => setHoverMessage(hoverText)} onMouseLeave={() => setHoverMessage(null)} onClick={() => setHoverMessage(null)}>
            <button className={buttonClasses} onClick={onClickFunction} disabled={isDisabled}>{label}</button>
        </div>
    );
};

const ButtonsComponent = ({onClickButton1, onClickButton2, onClickButton3, isTrainDisabled}) => {
    console.log("train si disabled ", isTrainDisabled)
    const [hoverMessage, setHoverMessage] = useState(null);

    return (
        <div>
            <div className={classes.buttonsDiv}>
                <HoverButton 
                    label={"ANALYZE DRAWING"}
                    onClickFunction={onClickButton1}
                    hoverText={HOVER_TEXTS.ANALYZE_DRAWING}
                    setHoverMessage={setHoverMessage}
                />
                <HoverButton
                    label={"CLEAR CANVAS"}
                    onClickFunction={onClickButton2}
                    hoverText={HOVER_TEXTS.CLEAR_CANVAS}
                    setHoverMessage={setHoverMessage}
                />
                <HoverButton
                    label={"TRAIN MODEL"}
                    onClickFunction={onClickButton3}
                    hoverText={HOVER_TEXTS.TRAIN_MODEL}
                    setHoverMessage={setHoverMessage}
                    isDisabled={isTrainDisabled}
                />
            </div>
            {(hoverMessage && !isTrainDisabled) &&
                <div className={classes.hoverText}>
                    {hoverMessage}
                </div>
            }
        </div>
    );
};

export default ButtonsComponent;