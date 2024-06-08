import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { IoStar } from 'react-icons/io5';
import { LuClapperboard, LuChevronUp, LuChevronDown, LuArrowDownNarrowWide, LuArrowDownWideNarrow } from 'react-icons/lu';
import { TriangleAlert } from 'lucide-react';
import '../../Components/Filter/Filter.jsx';
import './Content.css';
import { Helmet } from "react-helmet";

import Filter from '../../Components/Filter/Filter.jsx';
import Loading from '../../Components/Loader/Loader.jsx';
import FavoriteButton from '../../Components/FavoriteButton/FavoriteButton.jsx';

const Content = ({ contentType }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [sortBy, setSortBy] = useState('Датою додавання');
    const [selectedItem, setSelectedItem] = useState('Датою додавання');
    const [sortOrder, setSortOrder] = useState('asc');
    const selectRef = useRef(null);

    const [isLoading, setLoading] = useState(true);

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
                if (sortOrder === 'asc') {
                    return new Date(a.id) - new Date(b.id);
                } else {
                    return new Date(b.id) - new Date(a.id);
                }
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

    const [filteredContent, setFilteredContent] = useState([]);

    const handleFilteredContent = (filteredContent) => {
        setFilteredContent(filteredContent);
        setLoading(false);
    };

    return (
        <div className='content' >
            <Helmet>
                <meta charSet="utf-8" />
                {contentType === 'movies' ? (
                    <title>Фільми - BLURX</title>
                ) : (
                    <title>Серіали - BLURX</title>
                )}
            </Helmet>
            <div className='content-main' >
                {contentType === 'movies' && (
                    <>
                        
                        <div className='content-header-title'>
                            <div className='sort'>
                                <div className='content-icon'>
                                    <LuClapperboard size={32} min={32}/>
                                </div>
                                <h2 className='content-label-title'>Фільми</h2>
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
                        <div className='all-content-items' id='la-1'>      
                            {isLoading ? (
                                <Loading />
                            ) : (
                                <>
                                    {(filteredContent.movies && filteredContent.movies.length > 0) ? (
                                        sortContent(filteredContent.movies).map((item) => (
                                            <div key={item.id} className='content-movie'>
                                                <div className='content-cover'>
                                                    <Link to={`/movie/${item.title}`}>
                                                        <img className='content-image' id='ci-1' src={item.cover_image} alt={item.title} />
                                                    </Link>
                                                    <div className='content-rating'>
                                                        <IoStar size={24} min={24}/>{item.rating}
                                                    </div>
                                                </div>
                                                <div className='content-footer'>
                                                    <div className='content-link'>
                                                        <Link to={`/movie/${item.title}`} className='content-title'>{item.title}</Link>
                                                        <p>{new Date(item.release_date).getFullYear()}</p>
                                                    </div>
                                                    <div className='content-add'>
                                                        <FavoriteButton contentId={item.id} contentType='movie'/>
                                                        <div className='content-trailer'>
                                                            <Link to={item.trailer_url} className='regular-btn content-btn' target='_blank' rel='noopener noreferrer'>Дивитися трейлер</Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='alert'>
                                            <TriangleAlert size={32} min={32} />
                                            <div className=''> 
                                                За заданими параметрами нічого не знайдено, спробуйте змінити параметри пошуку.
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}                      
                        </div>  
                    </>
                )}
                {contentType === 'series' && (
                    <>
                        <div className='content-header-title'>
                            <div className='sort'>
                                <div className='content-icon'>
                                    <LuClapperboard size={32} min={32}/>
                                </div>
                                <h2 className='content-label-title'>Серіали</h2>
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
                        <div className='all-content-items' id='la-1'>
                            {isLoading ? (
                                    <Loading />
                                ) : (
                                    <>
                                    {filteredContent.series && filteredContent.series.length > 0 ? (
                                        sortContent(filteredContent.series).map((item) => (
                                            <div key={item.id} className='content-movie'>
                                                <div className='content-cover'>
                                                    <Link to={`/series/${item.title}`}>
                                                        <img className='content-image' id='ci-1' src={item.cover_image} alt={item.title} />
                                                    </Link>
                                                    <div className='content-rating'>
                                                        <IoStar size={24} min={24}/>{item.rating}
                                                    </div>
                                                </div>
                                                <div className='content-footer'>
                                                    <div className='content-link'>
                                                        <Link to={`/series/${item.title}`} className='content-title'>{item.title}</Link>
                                                        <p>{new Date(item.release_date).getFullYear()}</p>
                                                    </div>
                                                    <div className='content-add'>
                                                        <FavoriteButton contentId={item.id} contentType='series'/>
                                                        <div className='content-trailer'>
                                                            <Link to={item.trailer_url} className='regular-btn content-btn' target='_blank' rel='noopener noreferrer'>Дивитися трейлер</Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='alert'>
                                                <TriangleAlert size={24} min={24} />
                                                <div className=''> 
                                                    За заданими параметрами нічого не знайдено, спробуйте змінити параметри пошуку.
                                                </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>  
                    </>
                )}
            </div>

            

            <Filter setFilteredContent={handleFilteredContent} />
        </div>
    );
}
 
export default Content;