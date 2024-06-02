import React, { useState, useEffect } from 'react';
import { LuArrowUp } from 'react-icons/lu';

import './ScrolltoTop.css';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <div id="scroll-top">
            <button onClick={scrollToTop}>
                <span data-hover="Вгору"><LuArrowUp size={24} min={24}/></span>
            </button>
        </div>
      )}
    </>
  );
};

export default ScrollToTopButton;
