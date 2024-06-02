import React from 'react';

import './Contact.css';

const Contact = () => {
    return (
        <div className='contact-container'>
            <h1 className='contact-heading'>Контакты</h1>

            <div className='contact-info'>
                <div className='contact-item'>
                    <h2>Номер телефона</h2>
                    <p>+38 (063) 341-40-27</p>
                </div>

                <div className='contact-item'>
                    <h2>Электронная почта</h2>
                    <p>dima74181@gmail.com</p>
                </div>
                        
                <div className='contact-item'>
                    <h2>Локация</h2>
                    <p>Одесса, Украина</p>
                </div>
            </div>

        </div>
    );
}
 
export default Contact;