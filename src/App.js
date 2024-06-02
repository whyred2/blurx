import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

import Header from './Components/Header/Header.jsx';
import MobileHeader from './Components/HeaderMobile/HeaderMobile.jsx';
import Footer from './Components/Footer/Footer.jsx';
import ScrollToTop from './Components/ScrollToTop/ScrolltoTop'
import BackgroundLines from './Components/Lines/BackgroundLines.jsx';

import Home from './Pages/Home/Home.jsx';
import About from './Pages/About/About.jsx';
import Contact from './Pages/Contact/Contact.jsx';
import NotFound from './Pages/NotFound/NotFound.jsx';
import MoviePage from './Pages/ContentPage/MoviePage.jsx';
import SeriesPage from './Pages/ContentPage/SeriesPage.jsx';
import Content from './Pages/Content/Content.jsx';
import Search from './Pages/SearchPage/SearchPage.jsx';
import FavoritesPage from './Pages/Favorites/Favorites.jsx';

import Admin from './Pages/Admin/Admin.jsx';

import Login from './Pages/Auth/Login/Login.jsx';
import Register from './Pages/Auth/Register/Register.jsx';
import Profile from './Pages/Profile/Profile.jsx';

import AddContent from './Pages/Admin/Content/AddContent.jsx'; 

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const toggleTheme = () => {
    const newIsDarkTheme = !isDarkTheme;
    setIsDarkTheme(newIsDarkTheme);
    localStorage.setItem('theme', newIsDarkTheme ? 'dark' : 'light');
    document.body.className = newIsDarkTheme ? 'dark-theme' : 'light-theme';
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    setIsDarkTheme(isDark);
    document.body.className = isDark ? 'dark-theme' : 'light-theme';
  }, []);

  return (    
    <Router>
        <div className={`App ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
          <BackgroundLines />
          <Routes>
            <Route path="/" element={<OutletFooter isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />}>
              <Route index element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />      
              <Route path="/add-content" element={<AddContent />} />
              <Route path="/movie/:movieId" element={<MoviePage />} />
              <Route path="/series/:seriesId" element={<SeriesPage />} />
              <Route path="/movies" element={<Content contentType="movies" />} />
              <Route path="/series" element={<Content contentType="series" />} />
              <Route path='/search' element={<Search />} />
              <Route path='/favorites' element={<FavoritesPage />} />
            </Route>
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ScrollToTop />
          <ToastContainer
            position="bottom-left"
            autoClose={3000}
            limit={10}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />

        </div>
    </Router>
  );
}

export default App;

function OutletFooter() {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  const toggleTheme = () => {
    const newIsDarkTheme = !isDarkTheme;
    setIsDarkTheme(newIsDarkTheme);
    localStorage.setItem('theme', newIsDarkTheme ? 'dark' : 'light');
    document.body.className = newIsDarkTheme ? 'dark-theme' : 'light-theme';
  };

  return (
    <>
      <Header isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
      <MobileHeader isDarkTheme={isDarkTheme} toggleTheme={toggleTheme} />
      <Outlet />
      <Footer isDarkTheme={isDarkTheme} />
    </>
  );
}