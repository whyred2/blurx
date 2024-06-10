import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
    const navigate = useNavigate(); 

    useEffect(() => {
        const handleGoogleCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            console.log('Authorization code:', code);

            if (code) {
                try {
                    const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/auth/google`, { code });
                    console.log('Server response:', response.data);

                    const { user, token } = response.data;

                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token', token);
                    navigate('/profile');

                    window.location.reload();
                } catch (error) {
                    console.error('Login failed:', error);
                    alert('Ошибка авторизации. Пожалуйста, попробуйте снова.');
                    navigate('/');
                }
            } else {
                console.error('No authorization code found');
                alert('Код авторизации не найден.');
                navigate('/');
            }
        };

        handleGoogleCallback();
    }, [navigate]);

    return <div>Загрузка...</div>;
};

export default GoogleCallback;
