import React from 'react';
import { Helmet } from "react-helmet";

import './Contact.css';

const Contact = () => {
    return (
        <div className='contact-container'>
            <Helmet>
                <meta charSet="utf-8" />
                <title>Контакти - BLURX</title>
            </Helmet>
            <h1 className='contact-heading'>Контакти</h1>

            <div className='contact-info'>
                <div className='contact-item'>
                    <h2>Номер телефону</h2>
                    <p>+38 (063) 341-40-27</p>
                </div>

                <div className='contact-item'>
                    <h2>Електронна пошта</h2>
                    <p>dima74181@gmail.com</p>
                </div>
                        
                <div className='contact-item'>
                    <h2>Локація</h2>
                    <p>Одеса, Україна</p>
                </div>
            </div>

        </div>
    );
}
 
export default Contact;