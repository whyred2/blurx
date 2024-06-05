import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

import './Comments.css';
import { LuThumbsUp, LuThumbsDown, LuUser, LuMegaphone } from "react-icons/lu";
import { IoStar } from "react-icons/io5";
import { Eraser } from 'lucide-react';

import AddComment from '../../../Components/AddComment/AddComment';

const adjustRepliesLineHeight = () => {
    const comments = document.querySelectorAll('.comment-item');
    
    comments.forEach(comment => {
        const repliesLine = comment.querySelector('.replies-line');
        const commentReply = comment.querySelector('.comment-reply');
        const repliesContainer = comment.querySelector('.replies-container');
        
        if (repliesLine && repliesContainer && commentReply) {
            const repliesHeight = repliesContainer.offsetHeight;

            repliesLine.style.height = `${repliesHeight - 90}px`;
            repliesLine.style.top = `${-repliesHeight + 135}px`;
        }
    });
};

const MovieComments = ({ seriesId }) => {
    const mediaId = seriesId;
    const [authenticated, setAuthenticated] = useState(false);
    const [comments, setComments] = useState([]);
    const [userRole, setUserRole] = useState('user');
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const [complaintText, setComplaintText] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const formRef = useRef(null);

    const handleComplaintButtonClick = (commentId) => {
        if (selectedCommentId === commentId && showForm) {
            setShowForm(false);
            setSelectedCommentId(null);
        } else {
            if (!showForm) {
                setShowForm(true);
                setSelectedCommentId(commentId);
            }
        }
    };

    const handleReplyButtonClick = (commentId) => {
        if (selectedCommentId === commentId && showReplyForm) {
            setShowReplyForm(false);
            setSelectedCommentId(null);
        } else {
            if (!showReplyForm) {
                setShowReplyForm(true);
                setSelectedCommentId(commentId);
            }
        }
    };

    const handleCancelReply = () => {
        setShowReplyForm(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formRef.current && !formRef.current.contains(event.target)) {
                setShowForm(false);
            }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
    
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = decodeToken(token);
            setUserRole(decodedToken.role);
            setAuthenticated(true);
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

    useEffect(() => {
        const fetchComments = async () => {
          try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/comment/series/${mediaId}`);
            response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setComments(response.data);
          } catch (error) {
            console.error('Ошибка при получении комментариев:', error);
          }
        };
    
        fetchComments();
    }, [mediaId, comments]);

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

    const handleCommentLike = async (commentId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Увійдіть до облікового запису'); 
            return;
        }
        console.log('ID', commentId);

        let endpoint = '', comment_id;
        if (commentId.comment_id) {
            endpoint = `comment/series/${commentId.id}/like-reply`;
            comment_id = commentId.id;
            console.log('like-reply')
        } else {
            endpoint = `comment/series/${commentId}/like`;
            comment_id = commentId;
            console.log('like')
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/${endpoint}`, 
                {
                    comment_id
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('Response:', response.data);
            
        } catch (error) {
            console.error('Ошибка при добавлении лайка:', error);
        }
    };

    const handleCommentDislike = async (commentId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Увійдіть до облікового запису'); 
            return;
        }
        console.log('ID', commentId);

        let endpoint = '';
        if (commentId.comment_id) {
            endpoint = `comment/series/${commentId.id}/dislike-reply`;
            console.log('like-reply')
        } else {
            endpoint = `comment/series/${commentId}/dislike`;
            console.log('like')
        }

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/${endpoint}`, 
                {
                    commentId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log('Response:', response.data);
            
        } catch (error) {
            console.error('Ошибка при добавлении лайка:', error);
        }
    };

    const handleCommentDelete = async (commentId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Увійдіть до облікового запису'); 
            return;
        }

        let endpoint = '';
        if (commentId.comment_id) {
            endpoint = `comment/series/${commentId.id}/del-comment-reply`;
            console.log('del-comment-reply')
        } else {
            endpoint = `comment/series/${commentId}/del-comment`;
            console.log('del-comment')
        }
        try {
            const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.status === 200) {
                toast.success('Коментарій видалено');               
            }
        } catch (error) {
            console.error('Ошибка при удалении комментария:', error);
        }
    };

    const handleComplaintSubmit = async (commentId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.warn('Перш ніж залишати коментар, увійдіть до облікового запису!')
                return;
            }
    
            console.log('SERIES_ID', seriesId);
            console.log('COMMENT_ID', selectedCommentId);
            console.log('TEXT', complaintText);

            let endpoint = '';
            if (commentId.comment_id) {
                endpoint = `comment/series/${commentId.id}/complaint-reply`;
                console.log('complaint-reply')
            } else {
                endpoint = `comment/series/${commentId}/complaint`;
                console.log('complaint')
            }
            await axios.post(`${process.env.REACT_APP_SERVER_URL}/${endpoint}`, {
                series_id: seriesId,
                complaint_text: complaintText,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setShowForm(false);
            setSelectedCommentId(null);
            setComplaintText('');
            
            toast.success('Жалоба успешно отправлена');
    
        } catch (error) {
            toast.error('Ошибка при отправке жалобы');
            console.error('Ошибка при отправке жалобы:', error);
        }
    };

    useEffect(() => {
        setTimeout(() => {    
            adjustRepliesLineHeight();
            window.addEventListener('resize', adjustRepliesLineHeight);
            
            return () => {
                window.removeEventListener('resize', adjustRepliesLineHeight);
            };
        }, 1500);
    }, []);

    return (
        <div className='comments-container content-conteiner'>
            {authenticated ? (
                <>
                    <h3 className='comments-thread-title'>Коментарі</h3>
                    <AddComment mediaId={mediaId} type='series'/>

                    <div className='comments-list'>
                        {comments.map((comment, index) => (
                            <div key={index} className='comment-item'>
                                <div className="comment">
                                    <div className='comment-avatar'>
                                        {comment.profile_image ? (
                                            <><img className='avatar-image' src={comment.profile_image} alt='Аватар' /></>   
                                        ) : (
                                            <>
                                                <LuUser 
                                                    className='user-icon'
                                                    size={80} 
                                                    min={80}
                                                />
                                            </>
                                        )}
                                        
                                    </div>
                                    <div className='comment-body'>
                                        <div className='flex'>
                                            <div className='comment-top'>
                                                <div className='comment-left'>
                                                    <p>{comment.username}</p>

                                                    {comment.rating !== 0 && (
                                                        <>
                                                            <div className='info-span'>{' | '}</div>
                                                            <div className='comment-rating'>
                                                                <IoStar size={24} min={24} />
                                                                {comment.rating}
                                                            </div>
                                                        </>
                                                    )}

                                                    <div className='info-span'>{' | '}</div>
                                                    <p className='info-span'>{formatDate(comment.created_at)}</p>
                                                </div>
                                                <div className='comment-right'>
                                                    {userRole === 'admin' && (
                                                        <div className='regular-btn complain-btn del-btn' onClick={() => handleCommentDelete(comment.id)}>
                                                            <Eraser className='tooltip-icon' size={24} min={24} />
                                                            <span className='tooltip-text'>Видалити коментар</span>
                                                        </div>
                                                    )}

                                                    <div 
                                                        className='regular-btn complain-btn' 
                                                        onClick={() => handleComplaintButtonClick(comment.id)}
                                                    >
                                                        <LuMegaphone className='tooltip-icon' size={24} min={24}/>
                                                        <span className='tooltip-text'>Подати скаргу</span>
                                                    </div>

                                                    {showForm && selectedCommentId === comment.id && (
                                                        <div className="complaint-form-container" ref={formRef}>
                                                            <textarea
                                                                className='change-input text-area'
                                                                value={complaintText}
                                                                onChange={(e) => setComplaintText(e.target.value)}
                                                                placeholder="Введіть текст скарги"
                                                                maxLength={255}
                                                            />
                                                            <div className='complaint-form-btns'>
                                                                <button 
                                                                    className='main-btn complaint-btn' 
                                                                    onClick={() => handleComplaintSubmit(comment.id)}
                                                                >
                                                                    Надіслати скаргу
                                                                </button>
                                                                <button 
                                                                    className='regular-btn complaint-btn' 
                                                                    onClick={() => setShowForm(false)}
                                                                >
                                                                    Скасувати
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    
                                                </div>
                                            </div>
                                            <div className='comment-text'>{comment.text}</div>
                                        </div>
                                        <div className='comment-btn'>
                                            <button 
                                                className='regular-btn answer-btn'
                                                onClick={() => handleReplyButtonClick(comment.id)}
                                            >
                                                Відповісти
                                            </button>

                                            <div className='flex-gap'>
                                                <button 
                                                    className='like-btn'
                                                    onClick={() => handleCommentLike(comment.id)}
                                                >
                                                    <LuThumbsUp 
                                                        className='ld-24'
                                                        size={24}
                                                        min={24}
                                                    />
                                                    <p>{comment.likes}</p>
                                                </button>
                                                
                                                <button
                                                    className='dislike-btn'
                                                    onClick={() => handleCommentDislike(comment.id)}
                                                >
                                                    <LuThumbsDown 
                                                        className='ld-24'
                                                        size={24}
                                                        min={24}
                                                    />
                                                    <p>{comment.dislikes}</p>
                                                </button>
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="replies-container">
                                        {comment.replies.map((reply, replyIndex) => (
                                            <div key={replyIndex} className="comment-reply">
                                                <div className='replies-line'></div>

                                                <div className='comment-avatar'>
                                                    {reply.profile_image ? (
                                                        <><img className='avatar-image' src={reply.profile_image} alt='Аватар' /></>   
                                                    ) : (
                                                        <>
                                                            <LuUser 
                                                                className='user-icon'
                                                                size={80} 
                                                                min={80}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                                <div className='comment-body'>
                                                    <div className='flex'>
                                                        <div className='comment-top'>
                                                            <div className='comment-left'>
                                                                <p>{reply.username}</p>
                                                                <div className='info-span'>{' | '}</div>
                                                                <p className='info-span'>{formatDate(reply.created_at)}</p>
                                                            </div>
                                                            <div className='comment-right'>
                                                                {userRole === 'admin' && (
                                                                    <div className='regular-btn complain-btn del-btn' onClick={() => handleCommentDelete(reply)}>
                                                                        <Eraser className='tooltip-icon' size={24} min={24} />
                                                                        <span className='tooltip-text'>Видалити коментар</span>
                                                                    </div>
                                                                )}
                                                                
                                                                <div 
                                                                    className='regular-btn complain-btn' 
                                                                    onClick={() => handleComplaintButtonClick(reply.id)}
                                                                >
                                                                    <LuMegaphone className='tooltip-icon' size={24} min={24}/>
                                                                    <span className='tooltip-text'>Подати скаргу</span>
                                                                </div>

                                                                {showForm && selectedCommentId === reply.id && (
                                                                    <div className="complaint-form-container" ref={formRef}>
                                                                        <textarea
                                                                            className='change-input text-area'
                                                                            value={complaintText}
                                                                            onChange={(e) => setComplaintText(e.target.value)}
                                                                            placeholder="Введіть текст скарги"
                                                                            maxLength={255}
                                                                        />
                                                                        <div className='complaint-form-btns'>
                                                                            <button 
                                                                                className='main-btn complaint-btn' 
                                                                                onClick={() => handleComplaintSubmit(reply)}
                                                                            >
                                                                                Надіслати скаргу
                                                                            </button>
                                                                            <button 
                                                                                className='regular-btn complaint-btn' 
                                                                                onClick={() => setShowForm(false)}
                                                                            >
                                                                                Скасувати
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className='comment-text'>{reply.text}</div>
                                                    </div>
                                                    <div className='comment-btn'>
                                                        <button 
                                                            className='regular-btn answer-btn' 
                                                            onClick={() => handleReplyButtonClick(comment.id)}
                                                        >
                                                            Відповісти
                                                        </button>
                                                        <div className='flex-gap'>
                                                            <button 
                                                                className='like-btn'
                                                                onClick={() => handleCommentLike(reply)}
                                                            >
                                                                <LuThumbsUp 
                                                                    className='ld-24'
                                                                    size={24}
                                                                    min={24}
                                                                />
                                                                <p>{reply.likes}</p>
                                                            </button>
                                                            
                                                            <button
                                                                className='dislike-btn'
                                                                onClick={() => handleCommentDislike(reply)}
                                                            >
                                                                <LuThumbsDown 
                                                                    className='ld-24'
                                                                    size={24}
                                                                    min={24}
                                                                />
                                                                <p>{reply.dislikes}</p>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {showReplyForm && selectedCommentId === comment.id && (
                                    <AddComment mediaId={mediaId} type='series' commentId={comment.id} reply={true} onCancelReply={handleCancelReply} />
                                )}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className='auth-comment'>
                    <h3 className='comments-thread-title'>Бажаєте написати коментар? Увійдіть або зареєструйтесь</h3>
                    <Link to='/login' className='main-btn'>Написати коментар</Link>
                </div>
            )}
            
        </div>
    );
}
 
export default MovieComments;