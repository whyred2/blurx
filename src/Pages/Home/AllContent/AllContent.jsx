import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { IoStar } from "react-icons/io5";
import FavoriteButton from '../../../Components/FavoriteButton/FavoriteButton';
import { Ellipsis } from 'lucide-react';

const AllContent = () => {
    const [content, setContent] = useState([]);
    const [pageNumber, setPageNumber] = useState(0);
    const itemsPerPage = 4;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/content/movies-and-series`);
                const { movies, series } = response.data;

                const allContent = [
                    ...movies.map((movie) => ({ ...movie, type: 'movie' })),
                    ...series.map((serie) => ({ ...serie, type: 'series' })),
                ];

                setContent(allContent);
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
            }
        };

        fetchData();
    }, []);

    const pageCount = Math.ceil(content.length / itemsPerPage);

    const handlePageChange = ({ selected }) => {
        setPageNumber(selected);
    };

    const displayContent = content
        .slice(pageNumber * itemsPerPage, (pageNumber + 1) * itemsPerPage)
        .map((item, index) => (
            <div key={`${item.type}-${item.id}`} className='all-content'>
                <div className='content-cover'>
                    <Link to={item.season ? `/series/${item.title}` : `/movie/${item.title}`}>
                        <img className='content-image' src={item.cover_image} alt={item.title} />
                    </Link>
                    <div className='content-rating'>
                        <IoStar size={24} min={24} />{item.rating}
                    </div>
                </div>
                <div className='content-footer'>
                    <div className='content-link'>
                        <Link to='' className='content-title'>{item.title}</Link>
                        <p>{new Date(item.release_date).getFullYear()}</p>
                    </div>
                    <div className='content-add'>
                        <div className='content-add-watchlist'>
                            <FavoriteButton contentId={item.id} contentType={item.season ? 'series' : 'movie'} />
                        </div>
                        <div className='content-trailer'>
                            <Link to={item.trailer_url} className='regular-btn content-btn'>Трейлер</Link>
                        </div>
                    </div>
                </div>
            </div>
        ));

    return (
        <div className='all-content-container'>
            <div className='all-content-items'>
                {displayContent}
            </div>
            <ReactPaginate
                previousLinkClassName={'page-previous'}
                nextLinkClassName={'page-next'}
                previousLabel={'Назад'}
                nextLabel={'Вперед'}
                breakLabel={<Ellipsis />}
                breakLinkClassName={'page-break'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageChange}
                pageLinkClassName={'page'}
                activeLinkClassName={'active-page'}
                containerClassName={'pagination'}
            />
        </div>
    );
};

export default AllContent;
