import React from 'react';
import { Helmet } from "react-helmet";

import './Home.css';
import Movie from './MovieContainer/Movie.jsx';
import Auth from './AuthContainer/Auth.jsx';
import Series from './SeriesContainer/Series.jsx';
import AllContent from './AllContent/AllContent.jsx';

const Home = () => {
    
    return (
        <div className='home'>
            <Helmet>
                <meta charSet="utf-8" />
                <title>Головна - BLURX</title>
            </Helmet>
            <Movie />
            <Auth />
            <Series />
            <AllContent />
        </div>
    );
}

export default Home;