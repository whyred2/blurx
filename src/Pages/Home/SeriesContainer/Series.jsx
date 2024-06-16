import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './../Home.css';

import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { IoStar } from "react-icons/io5";

import Loading from '../../../Components/Loader/Loader.jsx';
import FavoriteButton from '../../../Components/FavoriteButton/FavoriteButton.jsx';

const Series = () => {
    const [content, setContent] = useState([]);

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_SERVER_URL}/content/series`)
            .then(response => {
                setContent(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Ошибка при получении контента:', error);
            });
    
        }, 
    []);

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 6,
        slidesToScroll: 2,
        autoplay: true,
        autoplaySpeed: 3000,
        prevArrow: <CustomPrevArrow />,
        nextArrow: <CustomNextArrow />,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: true,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <div className='content-container'>
            <h1 className='content-header'>Серіали</h1>
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    <Slider {...settings}>
                        {content.map((item) => (
                            <div key={item.id} className='content-movie all-content'>
                                <div className='content-cover'>
                                    <Link to={`/series/${item.title}`}>
                                        <img className='image-content' src={item.cover_image} alt={item.title} />
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
                                        <div className='content-add-watchlist'>
                                            <FavoriteButton contentId={item.id} contentType='series' />
                                        </div>
                                        <div className='content-trailer'>
                                            <Link to={item.trailer_url} className='regular-btn content-btn'>Трейлер</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>
                </>
            )}
        </div>
    );
}

const CustomPrevArrow = (props) => {
    const { onClick } = props;
    return (
        <div className='regular-btn navigation-btn' onClick={onClick}>
            <LuChevronLeft size={50} min={50} />
        </div>
    );
  };
  
const CustomNextArrow = (props) => {
    const { onClick } = props;
    return (
        <div className='regular-btn navigation-btn' onClick={onClick}>
            <LuChevronRight size={50} min={50} />
        </div>
    );
};
 
export default Series;