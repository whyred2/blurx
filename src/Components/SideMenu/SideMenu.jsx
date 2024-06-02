import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import './SideMenu.css';

export const SideMenu = ({ onMenuClick }) => {
    const [activeItem, setActiveItem] = useState('main');

    const handleItemClick = (itemName) => {
        onMenuClick(itemName);
        setActiveItem(itemName);
    };
    
    return (
        <div className='side-menu'>
            <div className='menu-item'> 
                <Link 
                    to='' 
                    className={`menu-btn ${activeItem === 'main' ? 'active' : ''}`} 
                    onClick={() => handleItemClick('main')}
                >
                    Головна
                </Link>

                <Link 
                    to='' 
                    className={`menu-btn ${activeItem === 'users' ? 'active' : ''}`} 
                    onClick={() => handleItemClick('users')}
                >
                    Користувачі
                </Link>

                <Link 
                    to='' 
                    className={`menu-btn ${activeItem === 'content' ? 'active' : ''}`} 
                    onClick={() => handleItemClick('content')}
                >
                    Контент
                </Link>

                <Link 
                    to='' 
                    className={`menu-btn ${activeItem === 'comments' ? 'active' : ''}`} 
                    onClick={() => handleItemClick('comments')}
                >
                    Коментарі
                </Link>
            </div>
        </div>
    );
};

export default SideMenu;