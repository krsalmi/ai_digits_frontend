import sorryImage from '../img/Sorry.png';
import classes from './pageStyles.module.css';

/**
 * Mobile view component. The app is not available in mobile view, so show page to inform user.
 */

const MobileComponent = () => {
    return (
        <div className={classes.mobileBackground} >
            <div className={classes.mobileContainer}>
                <img src={sorryImage} alt={"Sorry image for mobile view"} className={classes.imgSorry} />
            </div>
        </div>
    );

};

export default MobileComponent;