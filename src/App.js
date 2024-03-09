import React from 'react';
import DigitRecognition from './pages/DigitRecognition';
import MobileComponent from './pages/MobileComponent';

/**
 * App component, the root component of the application.
 * Renders the main DigitRecognition page component.
 */
const App = () => {

    const isMobile = window.innerWidth < 900;



  return (
    <div>
      <main>
      {isMobile ? <MobileComponent /> : <DigitRecognition />}
      </main>
    </div>
  );
};

export default App;
