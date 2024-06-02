import React from 'react';
import Line from './Lines';
import './Lines.css';

const BackgroundLines = () => {
  const lines = [
    { top: 200, rotate: -20, color: 'blue'},
    { top: 400, rotate: 25, color: 'blue'},
    { top: 800, rotate: -30, color: 'blue'},
    { top: 1000, rotate: -10, color: 'blue'},

  ];

  return (
    <div className="background-lines">
      {lines.map((line, index) => (
        <Line 
          key={index} 
          top={line.top} 
          rotate={line.rotate} 
          color={line.color} 
          duration={line.duration} 
        />
      ))}
    </div>
  );
};

export default BackgroundLines;