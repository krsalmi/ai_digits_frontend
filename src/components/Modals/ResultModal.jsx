import React from 'react';
import Modal from 'react-overlays/Modal';
import classes from './Modals.module.css';
import PropTypes from 'prop-types';

/**
 * ResultModal React component that displays the model training result.
 * @param {boolean} show - Whether to show the modal. 
 * @param {Function} onClose - Callback function when modal is closed.
 * @param {number} accuracy - Accuracy percentage of trained model.
 */
const ResultModal = ({ show, onClose, accuracy }) => {

    const buttonClasses = `btn btn-primary ${classes.modalCloseButton}`
  
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
                    <h4>Training complete</h4>
                    <p>Congratulations! You've built, trained and saved a model that achieves a <span className={classes.bold}>{accuracy}%</span> accuracy score on testing data!
                    Analysis of the drawings will however continue to happen with the original locally trained model.</p>
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