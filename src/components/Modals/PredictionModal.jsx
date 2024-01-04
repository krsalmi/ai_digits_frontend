import React from 'react';
import Modal from 'react-overlays/Modal';
import classes from './Modals.module.css';
import PropTypes from 'prop-types';


/**
 * ResultModal React component that displays the prediction result.
 * Received confidence estimate might be over 99.99%, which rounds up to 100.00%.
 * However, to not confuse the user with an over-confident estimate, we round it down to 99.99%.
 * 
 * @param {boolean} show - Whether to show the modal. 
 * @param {Function} onClose - Callback for closing the modal.
 * @param {string} prediction - The predicted digit.
 * @param {string} confidence - The confidence percentage.
 */
const ResultModal = ({ show, onClose, prediction, confidence }) => {

    const buttonClasses = `btn btn-primary ${classes.modalCloseButton}`
    const confidenceEstimate = confidence === "100.00" ? "> 99.99" : confidence;
  
    return (
        <Modal
            show={show}
            onHide={onClose}
            containerClassName={classes.modalBackdrop}
            className={classes.modal}
            backdrop="static"
        >
           <div>
                <div className={classes.modalContent}>
                    <h3>Analysis complete!</h3>
                    <h5>The model predicts the drawing to be a <span className={classes.bold}>{prediction}</span> with <span className={classes.bold}>{confidenceEstimate}%</span> confidence.</h5>
                </div>
                <div className={classes.btnDiv}>
                    <button className={buttonClasses} onClick={onClose}>OK</button>
                </div>
            </div>
        </Modal>
    );
}

ResultModal.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default ResultModal;