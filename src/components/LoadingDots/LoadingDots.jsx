import { ThreeDots } from  'react-loader-spinner';
import classes from './LoadingDots.module.css';

const LoadingDots = () => {
    return (
        <div className={classes.loadingDots}>
            <ThreeDots 
                    height="40" 
                    width="40" 
                    radius="9"
                    color="#4e918b" 
                    ariaLabel="three-dots-loading"
                    wrapperStyle={{}}
                    wrapperClassName=""
                    visible={true}
            />
        </div>
    );
};

export default LoadingDots;