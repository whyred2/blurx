import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import './Favorites.css';
import Loading from '../../Components/Loader/Loader';
import FavoriteButton from '../../Components/FavoriteButton/FavoriteButton';
import { LuClapperboard, LuChevronUp, LuChevronDown, LuArrowDownNarrowWide, LuArrowDownWideNarrow } from 'react-icons/lu';
import { IoStar } from 'react-icons/io5';

const FavoritesPage = () => {
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setLoading] = useState(true);

    const [isOpen, setIsOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Датою додавання');
    const [selectedItem, setSelectedItem] = useState('Датою додавання');
    const [sortOrder, setSortOrder] = useState('asc');
    const selectRef = useRef(null);
    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get('https://blurx-cd4ad36829cd.herokuapp.com/favorites/get', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 200) {
                    setFavorites(response.data);
                
                    setLoading(false);
                    console.log('FAVORITES:', response.data)
                }
                
            } catch (error) {
                console.error('Ошибка при загрузке избранного:', error);
                navigate('/login');
            }
        };

        fetchFavorites();
    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [selectRef]);

    const handleSortOrderChange = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    const sortContent = (content) => {
        const sortedContent = [...content];
        sortedContent.sort((a, b) => {
            if (sortBy === 'Датою додавання') {
                return sortOrder === 'asc' ? new Date(b.added_at) - new Date(a.added_at) : new Date(a.added_at) - new Date(b.added_at);
            } else if (sortBy === 'Датою виходу') {
                return sortOrder === 'asc' ? new Date(a.release_date) - new Date(b.release_date) : new Date(b.release_date) - new Date(a.release_date);
            } else if (sortBy === 'Рейтингом') {
                return sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating;
            } else if (sortBy === 'Назвою') {
                return sortOrder === 'asc' ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
            }
            return 0;
        });
        return sortedContent;
    };

    const handleSelect = (value) => {
        setSortBy(value);
        setSelectedItem(value);
        setIsOpen(false);
    };

    return (
        <div className='content-main' id='cm-1'>
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    <div className='content-header-title' id='cht-1'>
                        <div className='sort'>
                            <div className='content-icon'>
                                <LuClapperboard size={24} min={24}/>
                            </div>
                            <h2 className='content-label-title'>Обране</h2>
                        </div>
                        <div className='sort'>
                            <div className='content-text-sort'>Сортувати за:</div>
                            <div className='custom-select' ref={selectRef}>        
                                <div className='select-header'>
                                    <button className='regular-btn select-btn' id='sb-1' onClick={() => setIsOpen(!isOpen)}>
                                        {sortBy} 
                                        {isOpen ? 
                                            <LuChevronUp
                                                className='select-icon'
                                            /> : 
                                            <LuChevronDown 
                                                className='select-icon'
                                            />
                                        }
                                    </button>
                                </div>
                                
                                {isOpen && (
                                    <div className='select-list sort-list'>
                                        <label 
                                            className={`select-item ${selectedItem === 'Датою додавання' ? 'selected' : ''}`}
                                            onClick={() => handleSelect('Датою додавання')}
                                        >
                                            Датою додавання
                                        </label>
                                        <label 
                                            className={`select-item ${selectedItem === 'Датою виходу' ? 'selected' : ''}`}
                                            onClick={() => handleSelect('Датою виходу')}
                                        >
                                            Датою виходу
                                        </label>
                                        <label 
                                            className={`select-item ${selectedItem === 'Рейтингом' ? 'selected' : ''}`} 
                                            onClick={() => handleSelect('Рейтингом')}
                                        >
                                            Рейтингом
                                        </label>
                                        <label 
                                            className={`select-item ${selectedItem === 'Назвою' ? 'selected' : ''}`} 
                                            onClick={() => handleSelect('Назвою')}
                                        >
                                            Назвою
                                        </label>
                                    </div>
                                )}
                            </div>
                            <button className='regular-btn select-btn' onClick={handleSortOrderChange}>
                                {sortOrder === 'asc' ? <LuArrowDownNarrowWide /> : <LuArrowDownWideNarrow />}
                            </button>
                        </div>
                    </div>
                    <div className="favorite-conteiner">
                        {sortContent(favorites).map((item, index) => (
                            <div className='favorite-item' key={`favorite-${index}`}>
                                <div className='favorite-media'>
                                    <Link to={item.season ? `/series/${item.title}` : `/movie/${item.title}`}>
                                        <img className='favorite-img' src={item.cover_image} title={item.title} alt='cover-img'/>
                                    </Link>
                                </div>
                                <div className='favorite-body'>
                                    <div className='favorite-info'>
                                        <div className='favorite-item-top'>
                                            <div className="favorite-titles">
                                                <Link to={item.season ? `/series/${item.title}` : `/movie/${item.title}`} className='favorite-title'>
                                                    {item.title}
                                                </Link>
                                                {' | '}
                                                <div className='favorite-title_english'>
                                                    {item.title_english}
                                                </div>
                                            </div> 
                                            <div className="favorite-item-info">
                                                <div className='favorite-item-year'>{new Date(item.release_date).getFullYear()}</div>
                                                {' | '}
                                                <div className='favorite-item-duration'>{item.duration_minutes} хв.</div>            
                                                {' | '}
                                                <div className='favorite-item-age'>{item.age_rating}</div>
                                            </div>
                                        </div>
                                        <div className='favorite-item-bottom'>
                                            <div className='favorite-item-description'>
                                                {item.description}
                                            </div>
                                            <div className='fb-1'>
                                                <FavoriteButton contentId={item.id} contentType={item.season ? 'series' : 'movie'} />
                                            </div>
                                        </div>
                                        
                                    </div>

                                    <div className="favorite-absolution">
                                        
                                        <div className='favorite-item-rating'>
                                            <IoStar className='icon-star' size={24} min={24}/>{item.rating}
                                        </div>
                                        <div className='favorite-item-type'>
                                            {item.season ? 'Серіал' : 'Фільм'}
                                        </div>
                                    </div>
                                    
                                </div>
                               
                                    
                                
                            </div>
                        ))}
                    </div>
                        
                </>
            )}
            
        </div>
    );
}
 
export default FavoritesPage;