import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import LogoImageWhite from './../../Images/Logo/BLURX_WHITE.svg';
import LogoImageDark from './../../Images/Logo/BLURX_DARK.svg';

import SearchConteiner from '../SearchComponent/SearchComponent';
import ThemeSwitch from '../ThemeSwitch/ThemeSwitch';
import './Header.css';

const Header = ({ isDarkTheme, toggleTheme }) => {
    const [userRole, setUserRole] = useState('user');
    const [authenticated, setAuthenticated] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
            setPrevScrollPos(currentScrollPos);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [prevScrollPos]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = decodeToken(token);
            setUserRole(decodedToken.role);

            setAuthenticated(true);
        }
    }, []);
    
    const decodeToken = (token) => {
        try {
            const decoded = jwtDecode(token);
            return decoded;
        } catch (error) {
            console.error('Error decoding token:', error);
            return {};
        }
    };

    const handleLogout = () => {
        setAuthenticated(false);
        setUserRole('user');
        localStorage.removeItem('token');
        window.location.reload();
    };

    const logoSrc = isDarkTheme ? LogoImageWhite : LogoImageDark;

    return (
        <header className={`header ${visible ? 'visible' : 'hidden'}`}>
            <div className='logo'>
                <Link to='/'>
                    <img className='logo-img' src={logoSrc} alt='logo' />
                </Link>
            </div>
        
            <nav className='header-content'>
                <ul className='header-menu'>
                    <li className='header-menu-item'><Link to='/movies'>Фільми</Link></li>
                    <li className='header-menu-item'><Link to='/series'>Серіали</Link></li>
                    <li className='header-menu-item'><Link to='/about'>О нас</Link></li>
                </ul>
            </nav>

            <SearchConteiner />

            

            {authenticated ? (
                <div className='header-login'>
                    <ThemeSwitch isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
                    {userRole === 'admin' && (
                        <Link to='/admin' className='header-btn'>
                            Адмін панель
                        </Link>
                    )}
                    <Link to='/profile' className='header-btn'>
                        Профіль
                    </Link>
                    <Link to='/'
                        onClick={handleLogout}
                        className='main-btn'
                    >
                        Вийти
                    </Link>
                </div>
            ) : (
                <div className='header-login'>
                    <ThemeSwitch isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
                    <Link to='/login' className='header-btn'>Увійти</Link>
                    <Link to='/register' className='header-btn'>Зареєструватись</Link>
                </div>
            )}
            
        </header>
    );
}

export default Header; 