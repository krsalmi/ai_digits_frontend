import React, { useState } from 'react';
import classes from './ButtonsComponent.module.css';
import { HOVER_TEXTS } from '../../utils/constants';

/**
 * HoverButton is a React component that renders a button with a hover effect.
 * 
 * It takes the following props:
 * - label: The text to display on the button
 * - onClickFunction: The callback when the button is clicked
 * - hoverText: The text to display when hovering over the button 
 * - setHoverMessage: Callback to set the hover message in the parent component
 * - isDisabled: Whether the button should be disabled
 */
const HoverButton = ({ label, onClickFunction, hoverText, setHoverMessage, isDisabled = false }) => {

    const buttonClasses = `${classes.buttonClass} btn`

    return (
        <div onMouseEnter={() => setHoverMessage(hoverText)} onMouseLeave={() => setHoverMessage(null)} onClick={() => setHoverMessage(null)}>
            <button className={buttonClasses} onClick={onClickFunction} disabled={isDisabled}>{label}</button>
        </div>
    );
};

/**
 * ButtonsComponent renders the buttons for analyzing drawings, 
 * clearing the canvas, and training the model.
 * 
 * It takes in the following props:
 * - onClickButtonAnalyze: callback for when "Analyze Drawing" is clicked
 * - onClickButtonClear: callback for when "Clear Canvas" is clicked  
 * - onClickButtonTrain: callback for when "Train Model" is clicked
 * - isTrainDisabled: whether the "Train Model" button should be disabled
 */
const ButtonsComponent = ({ onClickButtonAnalyze, onClickButtonClear, onClickButtonTrain, isTrainDisabled }) => {
    const [hoverMessage, setHoverMessage] = useState(null);

    return (
        <div>
            <div className={classes.buttonsDiv}>
                <HoverButton 
                    label={"ANALYZE DRAWING"}
                    onClickFunction={onClickButtonAnalyze}
                    hoverText={HOVER_TEXTS.ANALYZE_DRAWING}
                    setHoverMessage={setHoverMessage}
                />
                <HoverButton
                    label={"CLEAR CANVAS"}
                    onClickFunction={onClickButtonClear}
                    hoverText={HOVER_TEXTS.CLEAR_CANVAS}
                    setHoverMessage={setHoverMessage}
                />
                <HoverButton
                    label={"TRAIN MODEL"}
                    onClickFunction={onClickButtonTrain}
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