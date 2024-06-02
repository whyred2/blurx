import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

import SideMenu from './../../Components/SideMenu/SideMenu';
import HomeAdmin from './Home/Home.jsx';
import Users from './Users/Users.jsx';
import Content from './Content/Content.jsx';
import Comments from './Comments/Comments.jsx';

import './Admin.css';

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [activeContent, setActiveContent] = useState('main');

  const handleMenuClick = (content) => {
    setActiveContent(content);
  };

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


  return (
    <div className='admin-page'>
      <h1 className='main-title admin-title'>Адмін-панель</h1>
      {authenticated ? (
        <div>
          {userRole === 'admin' ? (
            <div className='admin-container'>
              
              <SideMenu onMenuClick={handleMenuClick} />
              
              {activeContent === 'main' && <HomeAdmin />}
              {activeContent === 'users' && <Users />}
              {activeContent === 'content' && <Content />}
              {activeContent === 'comments' && <Comments />}
              
            </div>              
          ) : (
            <div className='error'>
              <p>Доступ заборонено.</p>
            </div>
          )}
        </div>
      ) : (
        <div className='error'>
          <p>Доступ заборонено.</p>
        </div>
      )}
    </div>
  );
};

export default Admin;
