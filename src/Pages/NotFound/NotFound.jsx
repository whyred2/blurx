import React from 'react';
import { Link } from 'react-router-dom';

import './NotFound.css';

const NotFound = () => {
    return (
        <div className='notfound-container'>
            <h1>Страница не найдена</h1>
            <div className='notfound-info'>
                <p>Извините, запрашиваемая вами страница не существует.</p>
                <p><Link to='/'>Вернуться на главную</Link></p>
            </div>
        </div>
    );
}
 
export default NotFound;