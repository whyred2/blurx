import React from 'react';

import './Home.css';
import Movie from './MovieContainer/Movie.jsx';
import Auth from './AuthContainer/Auth.jsx';
import Series from './SeriesContainer/Series.jsx';
import AllContent from './AllContent/AllContent.jsx';

const Home = () => {
    
    return (
        <div className='home'>
            <Movie />
            <Auth />
            <Series />
            <AllContent />
        </div>
    );
}

export default Home;