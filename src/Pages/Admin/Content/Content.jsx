import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ContentTable from './ContentTable';

import './Content.css'
import { Menu, Table } from 'lucide-react';

const Content = () => {
    const [contentStats, setContentStats] = useState({
        totalContent: {
            movieContent: 0,
            seriesContent: 0
        },
    });

    const [statsVisible, setStatsVisible] = useState(false);
    const [tableVisible, setTableVisible] = useState(false);
    const contentRefStats = useRef(null);
    const contentRefTable = useRef(null);
    const [contentHeightStats, setContentHeightStats] = useState('0px');
    const [contentHeightTable, setContentHeightTable] = useState('0px');    

    const toggleStatsVisibility = () => {
        setStatsVisible(!statsVisible);
        setContentHeightStats(statsVisible ? '0px' : `${contentRefStats.current.scrollHeight + 15}px`);
    };

    const toggleTableVisibility = () => {
        setTableVisible(!tableVisible);
        setContentHeightTable(tableVisible ? '0px' : `850px`);
    };

    useEffect(() => {
        const fetchContentStats = async () => {
            try {
                const response = await axios.get('http://localhost:3001/admin/content/stats');
                setContentStats(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке статистики:', error);
            }
        };

        fetchContentStats();
    }, []);

    return (
        <div className='admin-conteiner'>
            <div className={`admin-component ${statsVisible ? 'open' : ''}`}>
                <h2 className='admin-main-title admin-text-icon' onClick={toggleStatsVisibility}>
                    <Menu className={`admin-icon ${statsVisible ? 'clicked' : ''}`} size={40} />
                    Загальна статистика контенту
                </h2>
                
                <div
                    className={`admin-item-list ${statsVisible ? 'open' : ''}`}
                    style={{ maxHeight: contentHeightStats, transition: 'max-height 0.3s ease-out' }}
                    ref={contentRefStats}
                >
                    <div className='admin-item'>
                        <div className="admin-item-title">
                            {parseInt(contentStats.totalContent.movieContent) + parseInt(contentStats.totalContent.seriesContent)}
                        </div>
                        <div className='admin-item-span'>Всього контенту</div>
                    </div>
                    <div className='admin-item'>
                        <div className="admin-item-title">{parseInt(contentStats.totalContent.movieContent)}</div>
                        <div className='admin-item-span'>Фільми</div>
                    </div>
                    <div className='admin-item'>
                        <div className="admin-item-title">{parseInt(contentStats.totalContent.seriesContent)}</div>
                        <div className='admin-item-span'>Серіали</div>
                    </div>
                </div>
            </div>

            <div className={`admin-component ${tableVisible ? 'open' : ''}`}>
                <h2 className='admin-main-title admin-text-icon' onClick={toggleTableVisibility}>
                    <Table className={`admin-icon ${tableVisible ? 'clicked' : ''}`} size={40} />
                    Таблиці 
                </h2>

                <div
                    className={`admin-item-list ${tableVisible ? 'open' : ''}`}
                    style={{ maxHeight: contentHeightTable, transition: 'max-height 0.5s ease-out' }}
                    ref={contentRefTable}
                >
                    <ContentTable />
                </div>
            </div>

            <div className='admin-component'>
                <Link to='/add-content' className='main-btn'>Додати фільм/серіал</Link>
            </div>
        </div>
    );
}

export default Content;