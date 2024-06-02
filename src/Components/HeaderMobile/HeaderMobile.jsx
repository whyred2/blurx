import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import HeaderMenu from "./HeaderMobileMenu";
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch";
import SearchConteiner from '../SearchComponent/SearchComponent';

import { Menu, Search, User, LogOut, X } from 'lucide-react';

import LogoImageWhite from './../../Images/Logo/BLURX_WHITE.svg';
import LogoImageDark from './../../Images/Logo/BLURX_DARK.svg';

const MobileHeader = ({ isDarkTheme, toggleTheme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [userRole, setUserRole] = useState('user');
    const [authenticated, setAuthenticated] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };

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

    useEffect(() => {
        if (isOpen) {
        document.body.style.overflow = "hidden";
        } else {
        document.body.style.overflow = "";
        }
    }, [isOpen]);

    const logoSrc = isDarkTheme ? LogoImageWhite : LogoImageDark;

    return (
        <>
            <header className="mobile-header">
                <div className="mobile-header-left">
                    <button className="mobile-btn" onClick={toggleMenu}>
                        <Menu className="mobile-icon" size={30} min={30} />
                    </button>

                    <div className='mobile-logo'>
                        <Link to='/'>
                            <img className='logo-img' src={logoSrc} alt='logo' />
                        </Link>
                    </div>

                </div>
                
                
                <div className="mobile-header-btns">
                <ThemeSwitch isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />

                    <div className="mobile-search" onClick={toggleSearch}>
                        <Search className="mobile-icon" size={30} min={30} />
                    </div>
                    {isSearchOpen && (
                        <div className='mobile-search-bar'>
                            <SearchConteiner />
                            <div className="search-bar-icon" onClick={toggleSearch}>
                                <X className="mobile-icon" size={28} min={28} />
                            </div>
                        </div>
                    )}

                    {authenticated ? (
                        <>
                            <Link to='/profile' className="mobile-auth">
                                <User className="mobile-icon" size={30} min={30} />
                            </Link>
                            <Link to='/'
                                onClick={handleLogout}
                                className="mobile-auth"
                            >
                                <LogOut className="mobile-icon" size={30} min={30} /> 
                            </Link>
                        </>
                    ) : (
                        <Link to='/login' className="mobile-auth">
                            <User className="mobile-icon" size={30} min={30} />
                        </Link>
                    )}
                </div>
            </header>
            <HeaderMenu isOpen={isOpen} toggleMenu={toggleMenu} />
        </>
    );
};

export default MobileHeader;
