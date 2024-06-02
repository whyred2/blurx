import React from 'react';
import { Link } from 'react-router-dom';

import { X } from 'lucide-react';

const HeaderMenu = ({ isOpen, toggleMenu }) => {
    return (
        <div className={`mobile-header-menu ${isOpen ? 'show' : 'hide'}`}>
            <div className="backdrop"></div>
                <ul>
                    <li><Link to='/movies' className='regular-btn'>Фильмы</Link></li>
                    <li><Link to='/series' className='regular-btn'>Сериалы</Link></li>
                    <li><Link to='/about' className='regular-btn'>О нас</Link></li>
                </ul>
            <button onClick={toggleMenu}><X size={30} min={30} /></button>
        </div>
    );
};

export default HeaderMenu;
