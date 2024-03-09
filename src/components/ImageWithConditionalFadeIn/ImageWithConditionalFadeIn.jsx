import React, { useState, useEffect } from 'react';
import classes from './ImageWithConditionalFadeIn.module.css';

const ImageWithConditionalFadeIn = ({ src, alt, className = '' }) => {
  const [useFadeIn, setUseFadeIn] = useState(false);

  useEffect(() => {
    const img = new Image();
    const start = performance.now();

    img.onload = () => {
      const end = performance.now();
      // Determine if we need the fade-in effect based on loading time
      setUseFadeIn(end - start > 50);
    };

    img.src = src;
    if (img.complete) {
      // If image is cached and loads immediately, we might skip fade-in
      setUseFadeIn(false);
    }
  }, [src]);

  // Combine the dynamic class name based on `useFadeIn`
  const imageClass = `${classes[className]} ${
    useFadeIn ? classes.imageInitial : `${classes.imageLoaded} ${classes.imageNoTransition}`
  }`;

  return <img src={src} alt={alt} className={imageClass} onLoad={() => setUseFadeIn(false)} />;
};


export default ImageWithConditionalFadeIn;