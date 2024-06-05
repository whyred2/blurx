import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

import './AddComment.css';

const AddComment = ({ mediaId, type, commentId, reply, onCancelReply }) => {
    const [commentText, setCommentText] = useState('');

    const handleCommentSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.warn('Перш ніж залишати коментар, увійдіть до облікового запису!')
                return;
            }

            if (!commentText.trim()) {
                toast.error('Текст коментаря не повинен бути порожнім');
                return;
            }

            let endpoint = '', data = {};
            if (reply) {
                endpoint = `comment/${type === 'movie' ? 'movie' : 'series'}/${commentId}/add-comment-reply`;
                data = { mediaId, type, text: commentText };
            } else {
                endpoint = `comment/${type === 'movie' ? 'movie' : 'series'}/${mediaId}/add-comment`;
                data = { text: commentText };
            }

            const response = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/${endpoint}`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                toast.success('Коментар доданий');
                setCommentText('');
                if (reply) {
                    onCancelReply();
                }
            }
        } catch (error) {
            console.error('Ошибка при добавлении комментария:', error);
            toast.error('Помилка при додаванні коментаря');
        }
    };

    const handleCommentClear = () => {
        setCommentText('');
    };

    return (
        <div className='add-comment'>
            <div className='form-group'>
                <textarea
                    className='editor-area'
                    placeholder='Текст коментаря'
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
            </div>

            <div className='comment-btns'>
                <button className='main-btn comment_save' onClick={handleCommentSave}>Додати</button>
                <button className='regular-btn comment_save' onClick={handleCommentClear}>Очистити</button>
                {reply && (
                    <button className='regular-btn comment_save' onClick={onCancelReply}>Скасувати</button>
                )}
            </div>
        </div>
    );
};

export default AddComment;
