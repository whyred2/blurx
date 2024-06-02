import React from 'react';
import { Link } from 'react-router-dom';

import LogoImageWhite from './../../Images/Logo/BLURX_WHITE.svg';
import LogoImageDark from './../../Images/Logo/BLURX_DARK.svg';
import './Footer.css';

import { FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebookF } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";

const Footer = ({ isDarkTheme }) => {
    const logoSrc = isDarkTheme ? LogoImageWhite : LogoImageDark;

    return (
        <footer className='footer'>
            <div className='footer-logo-social'>
                <div className='footer-logo'>
                    <img className='logo-img' src={logoSrc} alt='logo' />
                </div>
                <div className='footer-social'>
                    <div className='footer-social-links'>
                        <Link to='' className='icon' title='Instagram'><FaInstagram size={24} /></Link>
                        
                        <Link to='' className='icon' title='Twitter'><FaXTwitter size={24} /></Link>
                        <Link to='' className='icon' title='Facebook'><FaFacebookF size={24} /></Link>
                        <Link to='' className='icon' title='Youtube'><FaYoutube size={24} /></Link>
                    </div>
                </div>
            </div>

            <div className='footer-copyright-link'>
                <span className='footer-copyright'>
                    &copy; 2024 BLURX. Всі права захищені.
                </span>
                <div className='footer-link'>
                    <Link to=''>Політика конфіденційності</Link>{' | '}
                    <Link to=''>Умови використання</Link>
                </div>
            </div>
        </footer>
    );
}
 
export default Footer;