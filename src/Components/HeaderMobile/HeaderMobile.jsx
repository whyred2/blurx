import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

import HeaderMenu from "./HeaderMobileMenu";
import ThemeSwitch from "../ThemeSwitch/ThemeSwitch";
import SearchConteiner from '../SearchComponent/SearchComponent';

import { Menu, Search, User, LogOut, X } from 'lucide-react';

import LogoImageWhite from './../../Images/Logo/BLURX_WHITE.svg';
import LogoImageDark from './../../Images/Logo/BLURX_DARK.svg';

import { Sheet, CircleUser, CircleHelp } from 'lucide-react';


const MobileHeader = ({ isDarkTheme, toggleTheme, toggleFeedbackForm }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [userRole, setUserRole] = useState('user');
    const [authenticated, setAuthenticated] = useState(false);
    const [userMenu, setUserMenu] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [userImage, setUserImage] = useState(null);
    const userMenuRef = useRef(null);
    const userImageBtnRef = useRef(null);

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

            const fetchProfileData = async () => {
                try {
                
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/auth/profile`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setUserInfo(response.data);
                setUserImage(response.data.profile_image);
                } catch (error) {
                    console.error('Ошибка при получении данных пользоваетеля:', error);
                }
            };

            fetchProfileData();
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

    const toggleUserMenu = () => {
        setUserMenu(prevState => !prevState);
    };

    const handleClickOutside = (event) => {
        if (userMenuRef.current && !userMenuRef.current.contains(event.target) &&
            userImageBtnRef.current && !userImageBtnRef.current.contains(event.target)) {
            setUserMenu(false);
        }
    };

    useEffect(() => {
        if (userMenu) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenu]);


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
                        <><div className='user-image-btn' ref={userImageBtnRef} onClick={toggleUserMenu}>
                        {userImage ? (
                            <img className='user-image' src={userImage} alt='user'></img>
                        ) : (
                            <CircleUser size={40}/>
                        )}
                    </div>
                            {userMenu && (
                        <div className='user-menu' ref={userMenuRef}>
                            <div className='top'>
                                {userImage ? (
                                    <img className='user-image' src={userImage} alt='user' style={{width: '50px', height: '50px'}}></img>
                                ) : (
                                    <CircleUser size={50}/>
                                )}
                                <div className='info'>
                                    <div className='span'>{userInfo.username}</div>
                                    <div className='span'>{userInfo.email}</div>
                                </div>
                            </div>
                            <div className='main'>

                                {userRole === 'admin' && (
                                    <Link to='/admin' className='header-btn content-btn' style={{justifyContent: 'flex-start', padding: '0 15px'}}>
                                        <Sheet size={24}/> Адмін панель
                                    </Link>
                                )}
                                <Link to='/profile' className='header-btn content-btn' style={{justifyContent: 'flex-start', padding: '0 15px'}}>
                                    <User size={24}/> Профіль
                                </Link>
                                <Link to='/' onClick={handleLogout} className='header-btn content-btn' style={{justifyContent: 'flex-start', padding: '0 15px'}}>
                                    <LogOut size={24}/> Вийти
                                </Link>
                            </div>
                            <div className='bottom'>
                                <div className='span'><ThemeSwitch isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} /> Змінити тему</div>
                                <button onClick={toggleFeedbackForm} className='header-btn content-btn' style={{justifyContent: 'flex-start', padding: '0 15px'}}>
                                    <CircleHelp size={24}/> Потрібна допомога?
                                </button>
                                

                            </div>

                        </div>
                    )}
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
