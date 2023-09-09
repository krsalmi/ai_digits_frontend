import React from 'react';
import Modal from 'react-overlays/Modal';
import classes from './Modals.module.css';
import PropTypes from 'prop-types';


const ResultModal = ({show, onClose, prediction, confidence}) => {

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