import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Auth = () => {
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
      
            setAuthenticated(true);
        }
    }, []);
    
    return (
        <>
        {!authenticated ? (
            <div className='auth-container'>
                <div className='auth-title'>
                    <h2 className='about-title'>Приєднуйтесь прямо зараз і нічого не пропускай!</h2>
                    <span>Реєстрація безкоштовна</span>
                </div>
                <div className='auth-btns'>
                    <Link to='/register' className='main-btn enter-auth-btn'>Зареєструватись</Link>
                    <Link to='/login' className='regular-btn enter-auth-btn'>Увійти</Link>
                </div>
            </div>
        ) : (
            <></>
        )}
        </>
    );
}
 
export default Auth;