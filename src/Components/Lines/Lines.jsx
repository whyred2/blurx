import React from 'react';
import './Lines.css';

const Line = ({ top, rotate, color }) => {

    return (
        <div
            className="line"
            style={{
                backgroundColor: color,
                top: `${top}px`,
                transform: `rotate(${rotate}deg)`,
                boxShadow: `0 0 100px 5px ${color}`,
            }}
        ></div>
    );
};

export default Line;