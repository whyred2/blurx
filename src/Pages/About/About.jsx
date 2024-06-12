import React from 'react';
import { Helmet } from "react-helmet";

import './About.css';

const About = () => {
    return (
        <div className='about-container'>
            <Helmet>
                <meta charSet="utf-8" />
                <title>Про нас - BLURX</title>
            </Helmet>
            <h1 className='about-heading'>Про нас</h1>
            <div className='about-info'>
                <h1 className='about-title'>
                    Наша мета – бути корисними
                </h1>
                <p>Ми віримо, що фільми існують для того, щоб робити життя простішим, приємнішим і добрішим.
                    Тому і пошук тих же фільмів має бути швидким, зручним та приємним.
                    Ми допомагаємо знайти саме те, що потрібно і без зайвих хвилювань,
                    щоб ви не витрачали життя на пошуки, а просто жили щасливо.</p>

                <h1 className='about-title'>
                    Зв'яжіться з нами
                </h1>
                <p>Якщо у вас є питання, пропозиції або ви знайшли помилку, зв'яжіться з нами - dima74181@gmail.com</p>
            </div>
        </div>
    );
}

export default About;