import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

import './FavoriteButton.css';
import { Heart } from 'lucide-react';

const FavoriteButton = ({ contentId, contentType }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    return;
                }
                const response = await axios.get(`http://localhost:3001/favorites/check/${contentId}`, {
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
    }, [contentId, contentType, isFavorite]);

    const handleAddAndRemoveToFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Увійдіть, щоб додати контент до обраного'); 
                return;
            }

            if (isFavorite) {
                const response = await axios.delete('http://localhost:3001/favorites/remove', {
                    data: { item_id: contentId, type: contentType },
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setIsFavorite(false);
                }
            } else {
                const response = await axios.post('http://localhost:3001/favorites/add', {
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
            onClick={handleAddAndRemoveToFavorites}
        >
            {isFavorite ? (
                <>
                    <Heart size={24} className='heart-icon' />
                    Видалити з обраного
                </>
            ) : (
                <>
                    <Heart size={24} />
                    Додати в обране
                </>
            )}
        </button>
    );
};

export default FavoriteButton;
