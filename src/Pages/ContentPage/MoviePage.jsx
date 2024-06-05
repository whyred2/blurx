import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ReactPlayer from 'react-player';
import { toast } from 'react-toastify';

import './ContentPage.css';
import MovieComments from './Comments/MovieComments.jsx';
import Auth from '../Home/AuthContainer/Auth.jsx';
import FavoriteButton from '../../Components/FavoriteButton/FavoriteButton.jsx';

import { IoStar } from "react-icons/io5";
import { LuExpand, LuX } from "react-icons/lu";

const MoviePage = () => {
    const { movieId } = useParams();
    const [authenticated, setAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('user');
    const [movie, setMovie] = useState(null);
    const [rating, setRating] = useState(0);
    const [userRated, setUserRated] = useState(false);
    const [userRating, setUserRating] = useState(null);
    const [ratingCount, setRatingCount] = useState(null);
    const [hoveredRating, setHoveredRating] = useState(null);
    const [currentFrame, setCurrentFrame] = useState(null);
    const trailerContainerRef = useRef(null);
    const navigate = useNavigate();

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
        const fetchMovie = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/content/movies/${movieId}`);
                setMovie(response.data);

                const token = localStorage.getItem('token');
                if (!token) {
                    return;
                }
                const userRatingResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/content/movies/${movieId}/user-rating`,
                    {
                        params: {
                            movieId: movieId
                        },
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setUserRating(userRatingResponse.data.userRating);
                setRating(userRatingResponse.data.rating);

                const ratingCountResponse = await axios.get(`${process.env.REACT_APP_SERVER_URL}/content/movies/${movieId}/rating-count`);
                setRatingCount(ratingCountResponse.data.count);
            } catch (error) {
                console.error('Ошибка при получении данных о фильме:', error);
            }
        }; 
        
        fetchMovie();
    }, [movieId]);

    useEffect(() => {
        setRating(userRating);
    }, [userRating, userRated]);

    const handleRatingChange = async (value) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Увійдіть до облікового запису'); 
                return;
            }

            const response = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/content/movies/${movieId}/rating`,
                { value, movieId:movie.movie.id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setUserRated(true);
                setRating(value);
                setUserRating(value); // Обновляем состояние userRating при установке рейтинга
                setHoveredRating(null);
                
            }
        } catch (error) {
            console.error('Ошибка при оценке фильма:', error);
        }
    };
    
    if (!movie || !movie.movie || !movie.movie.frames_url || movie.movie.frames_url.trim() === '') {
        return null; // Если не удовлетворяет условию, не выводим ничего
    }
    
    const framesString = movie.movie.frames_url;
    const regex = /"([^"]+)"/g;
    let match;
    const framesArray = [];
    
    while ((match = regex.exec(framesString)) !== null) {
      framesArray.push(match[1]);
    }

    const handleFrameClick = (index) => {
        setCurrentFrame(index);
    };

    const handleCloseClick = () => {
        setCurrentFrame(null);
    };

    const handleDeleteMovie = async () => {
        try {
            const confirmDelete = window.confirm("Ви впевнені, що хочете видалити фільм?");
            if (!confirmDelete) {
                return;
            }

            const response = await axios.delete(`${process.env.REACT_APP_SERVER_URL}/content/movies/${movieId}/delete-movie`);
            if (response.status === 200) {
                console.log('Фільм успішно вилучено');
                navigate('/');
                toast.success('Серіал видалено');  
            }

        } catch (error) {
            console.error('Помилка видалення фільму:', error);
        }
    };

    const handleWatchTrailerClick = () => {
        if (trailerContainerRef.current) {
            trailerContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    return (
        <div className='content-main'>
            <div className='form-container'>
                <div className='form content-conteiner'>
                    <div className='cover'>
                        <img className='cover-img' src={movie.movie.cover_image} alt={movie.movie.title} />
                    </div>
                    <div className='form-btn'>
                        <FavoriteButton contentId={movie.movie.id} contentType='movie' />

                        <button className='regular-btn content-btn' onClick={handleWatchTrailerClick}>Дивитися трейлер</button>
                        {authenticated ? (
                            <>
                                {userRole === 'admin' ? (
                                    <>
                                        <button 
                                            className='regular-btn content-btn'
                                            onClick={handleDeleteMovie}
                                        >
                                            Видалити фільм
                                        </button>
                                    </>
                                ) : (
                                    <></>
                                )}
                            </>
                        ) : (
                            <>
                            </>
                        )}
                    </div>                    
                </div>
                <div className='movie-body'>
                    <div className='rating content-conteiner'>
                        <div className='rating-info'>
                            <h3 className='rating-title'>Рейтинг BLURX:</h3>
                            <div className='total-info'>
                                <IoStar 
                                    size={70}
                                    min={70}
                                    className='total-star-rating'
                                /> 
                                <div className='pr-2'>
                                    <div className='total-rating'>
                                        <p className='rating-value'>{movie?.movie?.rating}</p>
                                        <p className='rating-span'>/10</p>
                                    </div>
                                    <p className='rating-span'>{ratingCount}</p>
                                </div>
                            </div>
                        </div>
                        <div className='rating-info'>
                            <h3 className='rating-title'>Моя оцінка:</h3>
                            <div className='total-info'>
                                <IoStar 
                                    size={70}
                                    min={70}
                                    className='user-star-rating'
                                />
                                <div className='pr-2'>
                                    <div className='total-rating'>
                                        <p className='rating-value'>
                                            {userRating !== null && userRating !== 0 ? (hoveredRating !== null ? hoveredRating : userRating) : (hoveredRating !== null ? hoveredRating : '0')}
                                        </p>
                                        <p className='rating-span'>/10</p>
                                    </div>
                                    <div className='stars-container'>
                                        {[...Array(10)].map((_, index) => {
                                            const uniqueKey = `star-${index}`;
                                            return (
                                                <IoStar
                                                    key={uniqueKey}
                                                    size={24}
                                                    min={24}
                                                    className={`star ${index < (hoveredRating !== null ? hoveredRating : rating) ? 'filled' : ''}`}
                                                    onMouseEnter={() => setHoveredRating(index + 1)}
                                                    onMouseLeave={() => setHoveredRating(null)} 
                                                    onClick={() => handleRatingChange(index + 1)}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                    <div className='titles content-conteiner'>
                        <h2 className='main-title'>{movie.movie.title}</h2>
                        <p className='title-span'>{movie.movie.title_english}</p>
                    </div>
                    <div className='content-info content-conteiner'>
                        <table className="content-table">
                            <tbody className='table-info'>
                                <tr className='content-row'>
                                    <td className="info">Дата релізу:</td>
                                    <td className="info-span">{new Date(movie.movie.release_date).getFullYear()}</td>
                                </tr>
                                <tr className='content-row'>
                                    <td className="info">Країна:</td>
                                    <td className="info-span">{movie.movie.release_country}</td>
                                </tr>
                                <tr className='content-row'>
                                    <td className="info">Рейтинг MPAA:</td>
                                    <td className="info-span">{convertToMPAA(movie.movie.age_rating)}</td>
                                </tr>
                                <tr className='content-row'>
                                    <td className="info">Вік:</td>
                                    <td className="info-span">{movie.movie.age_rating}</td>
                                </tr>
                                <tr className='content-row'>
                                    <td className="info">Тривалість:</td>
                                    <td className="info-span">{movie.movie.duration_minutes} хвилин</td>
                                </tr>
                                <tr className='content-row'>
                                    <td className="info">Жанри:</td>
                                    <td className="info-span">
                                        {movie.genres.map((genre, index) => (
                                            <span key={index}>{genre.name}{index !== movie.genres.length - 1 ? ', ' : ''}</span>
                                        ))}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className='description-container content-conteiner'>
                <p>{movie.movie.description}</p>
            </div>
            <div className='frames-container content-conteiner'>
            <div className='frames'>
                {framesArray.map((frameUrl, index) => (
                    <div key={index} className='frame'>
                        <button
                            className='frame-btn'
                            onClick={() => handleFrameClick(frameUrl)}
                        >
                            <img className='frame-image' src={frameUrl.trim()} alt={`Кадр ${frameUrl.id}`} />
                            <LuExpand 
                                className='expand-icon'
                                size={30}
                            />
                        </button>
                    </div>
                ))}
            </div>
            {currentFrame && (
                <div className='frame'>
                    <button 
                        className='frame-btn' 
                        onClick={handleCloseClick}
                    >
                        <img className='frame-image' src={currentFrame} alt='Movie frame' />
                        <LuX 
                            className='expand-icon'
                            size={30}
                        />
                    </button>
                </div>
            )}
        </div>
            <Auth />
            <div className='trailer-conteiner content-conteiner' ref={trailerContainerRef}>
                <ReactPlayer
                    url={movie.movie.trailer_url}
                    controls
                    className='trailer'
                    width='100%'
                    height='678px'
                    style={{
                        borderRadius: '10px',
                        overflow: 'hidden',
                    }}
                />
            </div>
            <MovieComments movieId={movieId} />
        </div>
    );
};

export default MoviePage;

function convertToMPAA(ageRating) {
  switch (ageRating) {
    case '0+':
      return 'G';
    case '6+':
      return 'PG';
    case '12+':
      return 'PG-13';
    case '16+':
      return 'R';
    case '18+':
      return 'NC-17';
    default:
      return 'Not Rated';
  }
}
