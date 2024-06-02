import React from 'react';
import './ThemeSwitch.css'; // Импортируйте стили для ThemeSwitch

import { Sun, Moon } from 'lucide-react';

const ThemeSwitch = ({ isDarkTheme, toggleTheme }) => {
    
    
    return (
        <button className="theme-switch">
            <div
                className={`theme-toggle ${isDarkTheme ? 'dark' : 'light'}`} 
                onClick={toggleTheme} 
                aria-checked={!isDarkTheme}
                title={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
            >
                <span className='check'>
                    <span className='theme-icon'>
                        <Sun size={24} />
                        <Moon size={24} />
                    </span>
                </span>
            </div>
        </button>
    );
};

export default ThemeSwitch;
