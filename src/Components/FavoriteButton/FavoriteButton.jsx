import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

import './FavoriteButton.css';
import { Heart } from 'lucide-react';

const FavoriteButton = ({ contentId, contentType }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            const fetchFavoriteStatus = async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        return;
                    }
                    
                    const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/favorites/check/${contentId}`, {
                        params: {
                            item_id: contentId,
                            type: contentType,
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
        
                    if (response.status === 200) {
                        setIsFavorite(response.data.isFavorite);
                    }
                } catch (error) {
                    console.error('Помилка при перевірці на обране:', error);
                }
            };
        
            fetchFavoriteStatus();      
        }, 1000);
        
    }, [contentId, contentType, isFavorite]);

    const handleAddAndRemoveToFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Увійдіть, щоб додати контент до обраного'); 
                return;
            }

            if (isFavorite) {
                const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/favorites/remove`, {
                    data: { item_id: contentId, type: contentType },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setIsFavorite(false);
                }
            } else {
                const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/favorites/add`, {
                    item_id: contentId,
                    type: contentType,
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setIsFavorite(true);
                }
            }
        } catch (error) {
            console.error('Ошибка при добавлении/удалении из избранного:', error);
        }
        
        
    };

    return (
        <button
            className={`main-btn content-btn ${isFavorite ? 'favorite-btn' : ''}`}
            style={{minWidth: '40px', minHeight: '40px'}}
            onClick={handleAddAndRemoveToFavorites}
        >
            {isFavorite ? (
                <>
                    <Heart size={24} className='heart-icon' />
                </>
            ) : (
                <>
                    <Heart size={24} />
                </>
            )}
        </button>
    );
};

export default FavoriteButton;
