import React, { useState, useEffect } from 'react';
import classes from './ImageWithConditionalFadeIn.module.css';

const ImageWithConditionalFadeIn = ({ src, alt, className }) => {
  const [loaded, setLoaded] = useState(false);


  // Apply the 'imageLoaded' class when the image is loaded for a fade-in effect
  // The external className is appended directly
  const imageClass = `${loaded ? classes.imageLoaded : classes.imageInitial} ${classes[className]}`;


return (
    <img
      src={src}
      alt={alt}
      className={imageClass}
      onLoad={() => setLoaded(true)}
    />
  );
};

export default ImageWithConditionalFadeIn;
