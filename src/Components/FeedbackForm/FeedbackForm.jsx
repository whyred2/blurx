import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './FeedbackForm.css';
import { toast } from 'react-toastify';

import { X } from 'lucide-react';

const FeedbackForm = ({ feedbackFormVisible, toggleVisibility }) => {
    const [feedbackText, setFeedbackText] = useState('');
    const feedbackTextareaRef = useRef(null);

    useEffect(() => {
        if (feedbackTextareaRef.current) {
            feedbackTextareaRef.current.style.height = 'auto';
            feedbackTextareaRef.current.style.height = `${feedbackTextareaRef.current.scrollHeight}px`;
        }
    }, [feedbackText]);

    const handleSendFeedback = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/send-feedback`, 
            { 
                feedbackText 
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            setFeedbackText('');
            toggleVisibility();
            toast.success('Відгук відправлений')
        } catch (error) {
            console.error('Error sending feedback:', error);
            toast.error('Не вдалося надіслати відгук');
        }
    };

    return (
        <div className={`feedback-form ${feedbackFormVisible ? 'open' : ''}`}>
            <div>
                <div className='feedback-top'>
                    <h2>BLURX: надіслати відгук</h2>
                    <button className='close' onClick={toggleVisibility}><X size={24} /></button>
                </div>

                <div className='feedback-main'>
                    <div className=''>Опишіть проблему</div>
                    <textarea
                        className='editor-area'
                        ref={feedbackTextareaRef}
                        placeholder='Розкажіть, чому ви вирішили відправити відгук'
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                    ></textarea>
                    <span>
                        Не вказуйте конфіденційну інформацію.
                    </span>
                </div>
            </div>

            <div className='feedback-bottom'>
                <p>Ми можемо запитувати у вас додаткові відомості або повідомляти вам про оновлення електронною поштою.</p>
                <button className='main-btn' onClick={handleSendFeedback}>Відправити</button>
            </div>
        </div>
    );
};

export default FeedbackForm;
