import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import './Comments.css';
import { Menu, List, ListX } from 'lucide-react';


const Comments = () => {
    const [commentStats, setCommentStats] = useState({
        totalComments: 0,
        mainComments: 0,
        replyComments: 0,
        totalComplaints: 0
    });
    const [comments, setComments] = useState([]);
    const [commentsComplaints, setCommentComplaints] = useState([]);

    const [statsVisible, setStatsVisible] = useState(false);
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [complaintsVisible, setComplaintsVisible] = useState(false);
    const contentRefStats = useRef(null);
    const contentRefComments = useRef(null);
    const contentRefComplaints = useRef(null);
    const [contentHeightStats, setContentHeightStats] = useState('0px');
    const [contentHeightComments, setContentHeightComments] = useState('0px');
    const [contentHeightComplaints, setContentHeightComplaints] = useState('0px');

    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchCommentStats = async () => {
            try {
                const response = await axios.get('https://blurx-cd4ad36829cd.herokuapp.com/comment/stats');
                setCommentStats({
                    totalComments: parseInt(response.data.comments.movieComments.count) + 
                        parseInt(response.data.comments.seriesComments.count) + 
                        parseInt(response.data.replyComments.replyMovieComments.count) + 
                        parseInt(response.data.replyComments.replySeriesComments.count),

                    mainComments: parseInt(response.data.comments.movieComments.count) + 
                        parseInt(response.data.comments.seriesComments.count),

                    replyComments: parseInt(response.data.replyComments.replyMovieComments.count) + 
                        parseInt(response.data.replyComments.replySeriesComments.count),
                    
                    totalComplaints: parseInt(response.data.CommentsComplaints.movieCommentsComplaints.count) + 
                        parseInt(response.data.CommentsComplaints.seriesCommentsComplaints.count) +
                        parseInt(response.data.replyCommentsComplaints.replyMovieCommentsComplaints.count) +
                        parseInt(response.data.replyCommentsComplaints.replySeriesCommentsComplaints.count),
                });
            } catch (error) {
                console.error('Ошибка при загрузке статистики комментариев:', error);
            }
        };

        fetchCommentStats();
    }, []);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get('https://blurx-cd4ad36829cd.herokuapp.com/comment/latest');
                const { movieComments, seriesComments } = response.data;
                const mergedComments = [...movieComments, ...seriesComments];
                mergedComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setComments(mergedComments);
            } catch (error) {
                console.error('Ошибка при загрузке последних комментариев:', error);
            }
        };

        fetchComments();
    }, []);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get('https://blurx-cd4ad36829cd.herokuapp.com/comment/complaints');
                
                const { 
                    movieCommentsComplaints, 
                    seriesCommentsComplaints, 
                    movieCommentsComplaintsReply, 
                    seriesCommentsComplaintsReply 
                } = response.data;
                
                // Добавление типа контента и типа комментария
                const movieComments = movieCommentsComplaints.map(comment => ({
                    ...comment, 
                    contentType: 'movie', 
                    commentType: 'comment'
                }));
                const seriesComments = seriesCommentsComplaints.map(comment => ({
                    ...comment, 
                    contentType: 'series', 
                    commentType: 'comment'
                }));
                const movieReplies = movieCommentsComplaintsReply.map(reply => ({
                    ...reply, 
                    contentType: 'movie', 
                    commentType: 'reply'
                }));
                const seriesReplies = seriesCommentsComplaintsReply.map(reply => ({
                    ...reply, 
                    contentType: 'series', 
                    commentType: 'reply'
                }));
    
                // Объединение всех комментариев и сортировка
                const mergedComments = [...movieComments, ...seriesComments, ...movieReplies, ...seriesReplies];
                mergedComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                
                setCommentComplaints(mergedComments);
            } catch (error) {
                console.error('Ошибка при загрузке жалоб:', error);
            }
        };
    
        fetchComments();
    }, [commentsComplaints]);
    

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

    const handleDeleteComplaint = async (complaintId, comment) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.delete(
                `https://blurx-cd4ad36829cd.herokuapp.com/admin/comment/complaints/${complaintId}`, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    data: {
                        type: comment
                    }
                }
            )

            console.log(response.data);
        } catch (error) {
            console.error('Ошибка при удалении жалобы:', error);
        }
    };
    
    const handleDeleteComment = async (commentId, comment) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            console.log(commentId);
        
            const response = await axios.delete(
                `https://blurx-cd4ad36829cd.herokuapp.com/admin/comment/${commentId}`, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    data: {
                        type: comment
                    }
                }
            );
    
            console.log(response.data);
        } catch (error) {
            console.error('Ошибка при удалении комментария:', error);
        }
    };
    
    

    const toggleStatsVisibility = () => {
        setStatsVisible(!statsVisible);
        setContentHeightStats(statsVisible ? '0px' : `${contentRefStats.current.scrollHeight + 15}px`);
    };

    const toggleCommentsVisibility = () => {
        setCommentsVisible(!commentsVisible);
        setContentHeightComments(commentsVisible ? '0px' : `${contentRefComments.current.scrollHeight + 15}px`);
    };

    const toggleComplaintsVisibility = () => {
        setComplaintsVisible(!complaintsVisible);
        setContentHeightComplaints(complaintsVisible ? '0px' : `${contentRefComplaints.current.scrollHeight + 15}px`);
    };

    return (
        <div className='admin-conteiner'>

            <div className={`admin-component ${statsVisible ? 'open' : ''}`}>
                <h2 className='admin-main-title admin-text-icon' onClick={toggleStatsVisibility}>
                    <Menu className={`admin-icon ${statsVisible ? 'clicked' : ''}`} size={40} />
                    Загальна статистика за коментарями
                </h2>
                
                <div
                    className={`admin-item-list ${statsVisible ? 'open' : ''}`}
                    style={{ maxHeight: contentHeightStats, transition: 'max-height 0.3s ease-out' }}
                    ref={contentRefStats}
                >
                    <div className='admin-item'>
                        <div className="admin-item-title">{commentStats.totalComments}</div>
                        <div className='admin-item-span'>Всього коментарів</div>
                    </div>
                    <div className='admin-item'>
                        <div className="admin-item-title">{commentStats.mainComments}</div>
                        <div className='admin-item-span'>Основні коментарі</div>
                    </div>
                    <div className='admin-item'>
                        <div className="admin-item-title">{commentStats.replyComments}</div>
                        <div className='admin-item-span'>Відповіді на коментарі</div>
                    </div>
                    
                    <div className='admin-item'>
                        <div className="admin-item-title">{commentStats.totalComplaints}</div>
                        <div className='admin-item-span'>Всього скарг</div>
                    </div>
                </div>
            </div>
            
            <div className={`admin-component ${commentsVisible ? 'open' : ''}`}>
                <h2 className='admin-main-title admin-text-icon' onClick={toggleCommentsVisibility}>
                    <List className={`admin-icon ${commentsVisible ? 'clicked' : ''}`} size={40} />
                    Останні коментарі
                </h2>
                <div 
                    className={`admin-items-list ${commentsVisible ? 'open' : ''}`}
                    style={{ maxHeight: contentHeightComments, transition: 'max-height 0.3s ease-out' }}
                    ref={contentRefComments}
                >
                    {comments.length > 0 ? (
                        <>
                            {comments.slice(0, 20).map((comment, index) => (
                                <div key={index} className='admin-comments'>
                                    <div className='admin-comment-top'>
                                        
                                        <div className='admin-comment-top-left'>
                                            
                                            <div className='admin-item-span'>
                                                <p>
                                                    Коментар до{comment.movie_id ? (<> фільму </>) : (<> серіалу </>)} 
                                                    <Link to={comment.series_id ? `/series/${comment.title}` : `/movie/${comment.title}`} className='content-title'>
                                                        {comment.title}
                                                    </Link>  
                                                </p>
                                            </div>   
                                            
                                        </div>             
                                        
                                        <div className='admin-item-span'>Час публікації коментаря: {formatDate(comment.created_at)}</div>
                                    </div>

                                    <div className='admin-comment-bottom'>
                                        <div className='admin-comment-item'>
                                            <div className='admin-item-span'>{comment.user_username}</div>
                                            <div className='comment-text'>{comment.text}</div>
                                        </div>
                                    </div>
                                </div>  
                            ))}
                        </>
                    ) : (
                        <div className='admin-comments'>Немає коментарів</div>
                    )}
                </div>
            </div>

            <div className={`admin-component ${complaintsVisible ? 'open' : ''}`}>
                <h2 className='admin-main-title admin-text-icon' onClick={toggleComplaintsVisibility}>
                    <ListX className={`admin-icon ${complaintsVisible ? 'clicked' : ''}`} size={40} />
                    Скарги за коментарями
                </h2>
                <div 
                    className={`admin-items-list ${complaintsVisible ? 'open' : ''}`}
                    style={{ maxHeight: contentHeightComplaints, transition: 'max-height 0.3s ease-out' }}
                    ref={contentRefComplaints}
                >
                    {commentsComplaints.length > 0 ? (
                        <>
                            {commentsComplaints.slice(0, 20).map((comment, indexComplains) => (
                                <div key={`commentComplains_${indexComplains}`} className="admin-comments">
                                    <div className='admin-comment-top'>
                                        <div className='admin-item-title'>Скарга #{indexComplains + 1}</div>
                                        <div className='admin-item-span'>Дата надсилання скарги: {formatDate(comment.created_at)}</div>
                                    </div>
                                    <div className='complain-text'>{comment.text}</div>

                                    <div className='admin-comment-top'>
                                        <div className='admin-item-span'>Коментар до скарги</div>
                                        <div className='admin-item-span'>Час публікації коментаря: {formatDate(comment.comment_created_at)}</div>
                                        <div className='admin-item-span'>Тип контенту: {comment.contentType}</div>
                                        <div className='admin-item-span'>Тип коментаря: {comment.commentType}</div>
                                    </div>
                                    <div className='admin-comment-bottom'>
                                        <div className='admin-comment-item'>
                                            <div className='admin-item-span'>{comment.user_username}</div>
                                            <div className='comment-text'>{comment.comment_text}</div>
                                        </div>
                                        <div className="admin-comment-btns">
                                            <div className='regular-btn' onClick={() => handleDeleteComplaint(comment.id, comment)}>Видалити скаргу</div>
                                            <div className='main-btn' onClick={() => handleDeleteComment(comment.comment_id, comment)}>Видалити коментар</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="admin-comments">{'Скарг немає :)'}</div>
                    )}
                    
                </div>
            </div>

        </div>
    );
}

export default Comments;