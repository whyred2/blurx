import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search } from 'lucide-react';
import { IoStar } from 'react-icons/io5';
import './SearchComponent.css';

const SearchContainer = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ movies: [], series: [] });
    const [isSearchActive, setIsSearchActive] = useState(false);
    const searchInputRef = useRef(null);

    const handleSearchInputChange = async (event) => {
        const query = event.target.value;
        setSearchQuery(query);
        setIsSearchActive(query.trim() !== '');

        try {
            if (query.trim() === '') {
                return;
            } else {
                const response = await axios.get(`https://blurx-cd4ad36829cd.herokuapp.com/content/search?q=${query}`);
                setSearchResults(response.data);
            }
        } catch (error) {
            console.error('Ошибка при выполнении поиска:', error);
        }
    };

    const handleBlur = (event) => {
        

        const query = event.target.value;
        setSearchQuery(query);
        setIsSearchActive(query.trim() !== '');
        if (query.trim() === '') {
            return;
        } else {
            setTimeout(() => {
                setIsSearchActive(false);
            }, 200);
        }
    };
    
    const handleFocus = () => {
        setIsSearchActive(true);
    };

    return (
        <form className='search-container'>
            <input
                type='text'
                placeholder='Поиск'
                value={searchQuery}
                onChange={handleSearchInputChange}
                onBlur={handleBlur}
                onFocus={handleFocus}
                ref={searchInputRef}
            />
            <button type='submit' className='search-btn' title='Поиск'>
                <Search size={24} />
            </button>
            {isSearchActive && (searchResults.movies.length > 0 || searchResults.series.length > 0) && (
                <div className='select-list search-results'>
                    {searchResults.movies && searchResults.movies.length > 0 && (
                        searchResults.movies.map((movie) => (
                            <Link key={movie.id} to={`/movie/${movie.title}`}>
                                <div className='search-result-item'>
                                    <div className='search-media'>
                                        <img className='search-cover' src={movie.cover_image} alt={movie.title} />
                                    </div>
                                    <div className='search-info'>
                                        <div className='search-title'>
                                            <div className='search-text'>{movie.title}</div>
                                            <div className='search-span-text'>{movie.title_english}</div>
                                        </div>
                                        <div className='search-rating'>
                                            <IoStar className='icon-star' size={24} min={24}/>{movie.rating}
                                        </div>
                                        <div className='search-span-text'>{new Date(movie.release_date).getFullYear()}</div>
                                        <div className='search-item-type'>
                                            Фільм
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                    {searchResults.series && searchResults.series.length > 0 && (
                        searchResults.series.map((series) => (
                            <Link key={series.id} to={`/series/${series.title}`}>
                                <div className='search-result-item'>
                                    <div className='search-media'>
                                        <img className='search-cover' src={series.cover_image} alt={series.title} />
                                    </div>
                                    <div className='search-info'>
                                        <div className='search-title'>
                                            <div className='search-text'>{series.title}</div>
                                            <div className='search-span-text'>{series.title_english}</div>
                                        </div>
                                        <div className='search-rating'>
                                            <IoStar className='icon-star' size={24} min={24}/>{series.rating}
                                        </div>
                                        <div className='search-span-text'>{new Date(series.release_date).getFullYear()}</div>
                                        <div className='search-item-type'>
                                            Серіал
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            )}
        </form>
    );
}

export default SearchContainer;
