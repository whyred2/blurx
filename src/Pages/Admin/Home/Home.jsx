import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Helmet } from "react-helmet";

import { Menu, MessageSquare, SendHorizontal } from 'lucide-react';
import './Home.css';

const HomeAdmin = () => {
    const [adminStats, setAdminStats] = useState({
        totalUsers: 0,
        totalContent: {
            movieContent: 0,
            seriesContent: 0
        },
        totalComments: {
            movieComments: 0,
            seriesComments: 0,
            replyMovieComments: 0,
            replySeriesComments: 0
        },
        totalComplaints: {
            movieCommentsComplaints: 0,
            seriesCommentsComplaints: 0,
            replyMovieCommentsComplaints: 0,
            replySeriesCommentsComplaints: 0
        }
    });

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    
    const [statsVisible, setStatsVisible] = useState(false);
    const contentRefStats = useRef(null);
    const [contentHeightStats, setContentHeightStats] = useState('0px');

    const [chatVisible, setChatVisible] = useState(false);
    const contentRefChat = useRef(null);
    const [contentHeightChat, setContentHeightChat] = useState('0px');

    const messagesEndRef = useRef(null);

    const toggleStatsVisibility = () => {
        setStatsVisible(!statsVisible);
        setContentHeightStats(statsVisible ? '0px' : `${contentRefStats.current.scrollHeight + 15}px`);
    };

    const toggleChatVisibility = () => {
        setChatVisible(!chatVisible);
        if (!chatVisible) {
            if (messages.length > 0) {
                setContentHeightChat(`${contentRefStats.current.scrollHeight + 600}px`);
                loadChatMessages();
            } else {
                setContentHeightChat(`${contentRefStats.current.scrollHeight + 80}px`);
            }
        } else {
            setContentHeightChat('0px');
        }
    };
    

    useEffect(() => {
        loadChatMessages();
    }, []);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/admin/stats`);
                setAdminStats(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке статистики:', error);
            }
        };

        fetchAdminStats();
    }, []);

    const loadChatMessages = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/admin/admin-chat`);
            setMessages(response.data);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } catch (error) {
            console.error('Ошибка при загрузке сообщений чата:', error);
        }
    };
    

    const handleSendMessage = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Увійдіть до облікового запису'); 
            return;
        }
        if (newMessage === '') {
            toast.error('Поле не повинно бути порожнім'); 
            return;
        }
        try {
            await axios.post(`${process.env.REACT_APP_SERVER_URL}/admin/send-message-chat`, 
            { text: newMessage },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setNewMessage('');
            loadChatMessages();
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    };

    const formatDate = (dateString) => {
        const currentDate = new Date();
        const commentDate = new Date(dateString);
        const timeDifference = currentDate - commentDate;
        
        const minute = 60 * 1000;
        const hour = minute * 60;
        const day = hour * 24;
    
        if (timeDifference < minute) {
            const secondsAgo = Math.floor(timeDifference / 1000);
            return `${secondsAgo} секунд${pluralize(secondsAgo, 'а', 'и', '')} тому`;
        } else if (timeDifference < hour) {
            const minutesAgo = Math.floor(timeDifference / minute);
            return `${minutesAgo} хвилин${pluralize(minutesAgo, 'а', 'и', '')} тому`;
        } else if (timeDifference < day) {
            const hoursAgo = Math.floor(timeDifference / hour);
            return `${hoursAgo} годин${pluralize(hoursAgo, 'а', 'и', '')} тому`;
        } else {
            const daysAgo = Math.floor(timeDifference / day);
            return `${daysAgo} днів тому`;
        }
    };

    const pluralize = (number, form1, form2, form3) => {
        if (number % 10 === 1 && number % 100 !== 11) {
            return form1;
        } else if ([2, 3, 4].includes(number % 10) && ![12, 13, 14].includes(number % 100)) {
            return form2;
        } else {
            return form3;
        }
    };

    return (
        <div className="admin-conteiner">
            <Helmet>
                <meta charSet="utf-8" />
                <title>Головна - Адмін-панель - BLURX</title>
            </Helmet>
            <div className={`admin-component ${statsVisible ? 'open' : ''}`}>
                <h2 className='admin-main-title admin-text-icon' onClick={toggleStatsVisibility}>
                    <Menu className={`admin-icon ${statsVisible ? 'clicked' : ''}`} size={40} />
                    Загальна статистика
                </h2>

                <div
                    className={`admin-item-list ${statsVisible ? 'open' : ''}`}
                    style={{ maxHeight: contentHeightStats, transition: 'max-height 0.3s ease-out' }}
                    ref={contentRefStats}
                >
                    <div className='admin-item'>
                        <div className="admin-item-title">{adminStats.totalUsers}</div>
                        <div className='admin-item-span'>Всього користувачів</div>
                    </div>
                    <div className='admin-item'>
                        <div className="admin-item-title">
                            {parseInt(adminStats.totalContent.movieContent) + parseInt(adminStats.totalContent.seriesContent)}
                        </div>
                        <div className='admin-item-span'>Всього контенту</div>
                    </div>
                    <div className='admin-item'>
                        <div className="admin-item-title">
                            {parseInt(adminStats.totalComments.movieComments) + parseInt(adminStats.totalComments.seriesComments) +
                            parseInt(adminStats.totalComments.replyMovieComments) + parseInt(adminStats.totalComments.replySeriesComments)}
                        </div>
                        <div className='admin-item-span'>Всього коментарів</div>
                    </div>
                    <div className='admin-item'>
                        <div className="admin-item-title">
                            {parseInt(adminStats.totalComplaints.movieCommentsComplaints) + parseInt(adminStats.totalComplaints.seriesCommentsComplaints) +
                            parseInt(adminStats.totalComplaints.replyMovieCommentsComplaints) + parseInt(adminStats.totalComplaints.replySeriesCommentsComplaints)}
                        </div>
                        <div className='admin-item-span'>Всього скарг</div>
                    </div>
                </div>
            </div>

            <div className='admin-component'>
                <h2 className='admin-main-title admin-text-icon' onClick={toggleChatVisibility}>
                    <MessageSquare className={`admin-icon ${chatVisible ? 'clicked' : ''}`} size={40} />
                    Чат адміністраторів
                </h2>
                <div 
                    className={`chat ${chatVisible ? 'open' : ''}`}
                    style={{ maxHeight: contentHeightChat, transition: 'max-height 0.3s ease-out, margin-top 0.3s ease-out' }}
                    ref={contentRefChat}
                >
                    <div className='chat-messages'>
                        <div className='messages-list'>
                            {messages.length > 0 ? (
                                <>
                                    {messages.map(message => (
                                        <div key={message.id} className='message'>
                                            <div className='message-top'>
                                                <div className='admin-item-span'>{message.user_username}</div>
                                                <div className='admin-item-span'>{formatDate(message.created_at)}</div>
                                            </div>
                                            <div className='comment-text'>{message.text}</div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </>
                            ) : (
                                <div className='message'>Повідомлень нема</div>
                            )}
                        </div>
                    </div>
                    <div className="chat-bottom">
                        <input
                            type="text"
                            className='change-input chat-input'
                            placeholder="Введіть повідомлення..."
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                        />
                        <div className='main-btn chat-btn' onClick={handleSendMessage}>
                            <SendHorizontal size={30} min={30} />
                            Відправити
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeAdmin;
