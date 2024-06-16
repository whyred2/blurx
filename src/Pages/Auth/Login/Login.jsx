import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from "react-helmet";

import './Login.css';

import LogoImageWhite from './../../../Images/Logo/BLURX_WHITE.svg';
import LogoImageDark from './../../../Images/Logo/BLURX_DARK.svg';
import GoogleAuth from '../../../Components/GoogleLogin/GoogleLogin';

const Login = () => {
    const navigate = useNavigate(); 
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [formErrors, setFormErrors] = useState({});
    
    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    useEffect(() => {
        document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
    }, [isDarkTheme]);

    const logoSrc = isDarkTheme ? LogoImageWhite : LogoImageDark;
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.email.trim()) {
            errors.email = `Це поле є обов'язковим для заповнення`;
        }
        if (!formData.password.trim()) {
            errors.password = `Це поле є обов'язковим для заповнення`;
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Перевірте правильність введених даних');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/login`, formData);
            const token = response.data.token;
            localStorage.setItem('token', token);
            toast.success('Успіх');  
            navigate('/profile');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                toast.error('Неправильний логін або пароль');
            } else {
                toast.error('Виникла помилка при вході');
                console.error('Помилка при вході:', error);
            }
        }
    };

    const handleGoogleAuthClick = (e) => {
        e.preventDefault();
    };

    return (
        <div className='login-container'>
            <Helmet>
                <meta charSet="utf-8" />
                <title>Вхід - BLURX</title>
            </Helmet>
            <header className='header-auth'>
                <div className='logo'>
                    <Link to='/'>
                        <img className='logo-img' src={logoSrc} alt='logo' />
                    </Link>
                </div>
            </header>
            <div className='login-page'>
                <div className='login-form'>
                    <h1>
                        Увійти до BLUR<span>X</span>
                    </h1>
                    <p>Перш ніж продовжити вам необхідно увійти.</p>
                    <form onSubmit={handleSubmit}>
                        <div className='auth-inputs'>
                            <div className='auth-input'>
                                <input
                                    placeholder='Пошта'
                                    className={'change-input'}
                                    type='email'
                                    name='email'
                                    onChange={handleChange}
                                />
                                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                            </div>

                            <div className='auth-input'>
                                <input
                                    placeholder='Пароль'
                                    className={'change-input'}
                                    type='password'
                                    name='password'
                                    onChange={handleChange}
                                />
                                {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                            </div>
                        </div>

                        <div className='auth-btn'>
                            <button className='main-btn content-btn' style={{ height: '40px', width: '100%' }} type='submit'>
                                Увійти
                            </button>
                            <GoogleAuth preventDefault={handleGoogleAuthClick} />

                        </div>

                    </form>
                    <div className='login-acc'>
                        Потрібен обліковий запис? <Link to='/register'>Зареєструйся тут</Link>
                    </div>
                </div>

                <div className='login-footer'>
                    <div className='login-footer-info'>
                        <Link to='/privacy'>Політика конфіденційності</Link>{' | '}
                        <Link to='/terms'>Умови використання</Link>
                    </div>
                    <p>&copy; 2024 BLURX. Всі права захищені.</p>
                </div>
            </div>
        </div>
    );
}
 
export default Login;
