import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from "react-helmet";

import './Register.css';

import LogoImageWhite from './../../../Images/Logo/BLURX_WHITE.svg';
import LogoImageDark from './../../../Images/Logo/BLURX_DARK.svg';
import GoogleAuth from '../../../Components/GoogleLogin/GoogleLogin';

const Register = () => {
    const navigate = useNavigate(); 
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: '',
    });

    const [isDarkTheme, setIsDarkTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark';
    });

    const [errors, setErrors] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);

    useEffect(() => {
        document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
    }, [isDarkTheme]);

    const logoSrc = isDarkTheme ? LogoImageWhite : LogoImageDark;
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (formSubmitted) {
            setErrors({
                ...errors,
                [e.target.name]: e.target.value.trim() ? '' : `Це поле є обов'язковим для заповнення`,
            });
        }
    };
     
    const validatePassword = (password) => {
        return /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(password);
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);
    
        const formErrors = {};
        if (!formData.username.trim()) {
            formErrors.username = `Це поле є обов'язковим для заповнення`;
        }
        if (!formData.email.trim()) {
            formErrors.email = `Це поле є обов'язковим для заповнення`;
        }
        if (!formData.password.trim()) {
            formErrors.password = `Це поле є обов'язковим для заповнення`;
        } else if (!validatePassword(formData.password)) {
            formErrors.password = 'Пароль повинен містити як мінімум 8 символів, включаючи цифри, малі та великі літери';
        }
    
        setErrors(formErrors);
    
        if (Object.keys(formErrors).length > 0) {
            toast.error('Перевірте правильність введених даних');
            return;
        }
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/register`, formData);
            const token = response.data.token;
            localStorage.setItem('token', token);
            toast.success('Успіх');  
            navigate('/profile');
        } catch (error) {
            if (error.response && error.response.status === 409) {
                toast.error('Користувач із такою поштою вже зареєстрований');
            } else {
                toast.error('Сталася помилка під час реєстрації. Будь ласка, спробуйте ще раз');
                console.error('Помилка під час реєстрації:', error);
            }
        }
    };

    const handleGoogleAuthClick = (e) => {
        e.preventDefault();
    };

    return (
        <div className='register-container'>
            <Helmet>
                <meta charSet="utf-8" />
                <title>Реєстрація - BLURX</title>
            </Helmet>
            <header className='header-auth'>
                <div className='logo'>
                    <Link to='/'>
                        <img className='logo-img' src={logoSrc} alt='' />
                    </Link>
                </div>
            </header>
            <div className='register-page'>
                <div className='register-form'>
                    <h1>
                        Зареєструйтесь
                    </h1>
                    <div className='reg-acc'>
                        Вже є обліковий запис? <Link to='/login'>Увійдіть тут</Link>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className='auth-inputs'>
                            <div className='auth-input'>
                                <input
                                    placeholder='Логін'
                                    className={`change-input ${errors.username ? 'error' : ''}`}
                                    type='username'
                                    name='username'
                                    onChange={handleChange}
                                />
                                {errors.username && <div className="error-message">{errors.username}</div>}
                            </div>
                            <div className='auth-input'>
                                <input
                                    placeholder='Пошта'
                                    className={`change-input ${errors.email ? 'error' : ''}`}
                                    type='email'
                                    name='email'
                                    onChange={handleChange}
                                />
                                {errors.email && <div className="error-message">{errors.email}</div>}
                            </div>
                            <div className='auth-input'>
                                <input
                                    placeholder='Пароль'
                                    className={`change-input ${errors.password ? 'error' : ''}`}
                                    type='password'
                                    name='password'
                                    onChange={handleChange}
                                />
                                {errors.password && <div className="error-message">{errors.password}</div>}
                            </div>
                        </div>
                        <div className='register-copyright'>
                            <p>
                                Будь ласка, ознайомтеся з нашою 
                                {' '}
                                <Link to='/terms'>Умовами використання</Link>
                                {' та '}
                                <Link to='/privacy'>Політикою конфіденційності</Link>
                                {'.'}
                            </p>
                        </div>

                        <div className='auth-btn'>
                            <button className='main-btn content-btn' style={{ height: '40px', width: '100%' }} type='submit'>
                                Зареєструватись
                            </button>
                            <GoogleAuth preventDefault={handleGoogleAuthClick} />

                        </div>
                    </form>
                </div>
                
                <div className='register-footer'>
                    <div className='register-footer-info'>
                        <Link to='/privacy'>Умовами використання</Link>{' | '}
                        <Link to='/terms'>Політикою конфіденційності</Link>
                    </div>
                    <p>&copy; 2024 BLURX. Всі права захищені.</p>
                </div>
            </div>

        </div>
    );
}
 
export default Register;
