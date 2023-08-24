import React from 'react';
import Modal from 'react-overlays/Modal';
import classes from './Modals.module.css';
import PropTypes from 'prop-types';


const ResultModal = ({show, onClose, accuracy}) => {

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
                    <p>Congratulations! You've built, trained and saved a model that achieves a <span className={classes.bold}>{accuracy}%</span> accuracy on testing data.
                    All subsequent analysis will be performed with this model until it is retrained.</p>
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