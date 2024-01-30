import React, {useState} from 'react';
import DrawingCanvas from "../components/DrawingCanvas/DrawingCanvas";
import DescriptionSide from "../components/DescriptionSide/DescriptionSide";
import classes from './DigitRecognition.module.css';
import AlertBanner from '../components/Alerts/AlertBanner';
import ResultModal from '../components/Modals/ResultModal';
import PredictionModal from '../components/Modals/PredictionModal';
import Footer from '../components/Footer/Footer';

const BANNER_TIMEOUT = 5000;

/**
 * DigitRecognition is a React component that renders the digit recognition page.
 * It manages state for showing alert banners, result modals, and prediction modals.
 * It contains handler functions to open/close modals and start banner alerts.
 * Renders the DrawingCanvas, DescriptionSide, AlertBanner, ResultModal, 
 * and PredictionModal components.
 */
const DigitRecognition = () => {
    const [showAlertBanner, setShowAlertBanner] = useState(false);
    const [bannerMessage, setBannerMessage] = useState('');
    const [bannerVariant, setBannerVariant] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [showPredictionModal, setShowPredictionModal] = useState(false);
    const [accuracy, setAccuracy] = useState(0);
    const [prediction, setPrediction] = useState(null);
    const [confidence, setConfidence] = useState(0);

    const startBannerAlert = (message, variant = 'secondary') => {
        setBannerMessage(message);
        setBannerVariant(variant);
        setShowAlertBanner(true);

        setTimeout(() => {
            setShowAlertBanner(false);
        }, BANNER_TIMEOUT);
    };

    const handleOpenResultModal = (accuracy) => {
        setAccuracy(accuracy);
        setShowResultModal(true);
    };

    const handleOpenPredictionModal = (prediction, confidence) => {
        setPrediction(prediction);
        setConfidence(confidence);
        setShowPredictionModal(true);
    }

    //Close all modals, they won't be open at the same time
    const handleCloseModal = () => {
        setShowResultModal(false);
        setShowPredictionModal(false);
    };

    return (
        <div className={showResultModal ? `${classes.container} ${classes.modalOpen}` : classes.container}>
            <ResultModal show={showResultModal} onClose={handleCloseModal} accuracy={accuracy} />
            <PredictionModal show={showPredictionModal} onClose={handleCloseModal} prediction={prediction} confidence={confidence} />
            {showAlertBanner &&
                <AlertBanner message={bannerMessage} variant={bannerVariant} />
            }
            <div className={classes.innerContainer}>
                <DescriptionSide></DescriptionSide>
                <div className={classes.canvasSideContainer}>
                    <DrawingCanvas startBannerAlert={startBannerAlert} handleOpenResultModal={handleOpenResultModal} handleOpenPredictionModal={handleOpenPredictionModal} />
                </div>
            </div>
            <Footer />
        </div>
    );

};

export default DigitRecognition;