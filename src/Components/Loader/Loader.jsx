import React from 'react';

import './Loader.css';
import { Loader } from 'lucide-react';

const Loading = () => {
    return (
        <div className='loader-container'>
            <div className='loader'><Loader size={50} min={50}/></div>
        </div>
    );
}
 
export default Loading;