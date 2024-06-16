import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import InputRange from 'react-input-range';
import './../../Pages/Content/Content.css';
import './Filter.css';
import 'react-input-range/lib/css/index.css';
import CustomSelect from './../CustomSelect/Select.jsx';

import { Filter, X } from 'lucide-react';


const Filters = ({ setFilteredContent, isFilterOpen, toggleFilter }) => {
    const [genres, setGenres] = useState([]);
    const [minYear, setMinYear] = useState(1959);
    const [maxYear, setMaxYear] = useState(2024);
    const options = genres.map((genre) => ({ value: genre.id, label: genre.name }));
    const ageOptions = [
        { value: '0+', label: '0+' },
        { value: '6+', label: '6+' },
        { value: '12+', label: '12+' },
        { value: '16+', label: '16+' },
        { value: '18+', label: '18+' },
    ];

    const [appliedFilters, setAppliedFilters] = useState({ genres: [], age: [] });

    const handleSelect = (value, type) => {
        if (type === 'genres') {
            setAppliedFilters({ ...appliedFilters, genres: value });
        } else if (type === 'age') {
            setAppliedFilters({ ...appliedFilters, age: value });
        }
    };

    const applyFilters = useCallback(async () => {
        const filtersToSend = {
            genres: appliedFilters.genres,
            age: appliedFilters.age,
            years: {
                min: minYear,
                max: maxYear,
            },
        };
        try {
            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/content/filter`, filtersToSend);
            setFilteredContent(response.data);
        } catch (error) {
            console.error('Ошибка при отправке фильтров на сервер:', error);
        }
    }, [appliedFilters, minYear, maxYear, setFilteredContent]);

    useEffect(() => {
        const delay = setTimeout(() => {
            applyFilters();
        }, 500);

        return () => clearTimeout(delay);
    }, [applyFilters]);


    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/content/genres`);
                setGenres(response.data);
            } catch (error) {
                console.error('Ошибка при получении списка жанров:', error);
            }
        };

        fetchGenres();
    }, []);

    return (
        <div className={`filter-container content-main ${isFilterOpen ? 'open' : ''}`}>
            <div className='content-header-title' style={{margin: '-15px -20px 0 -20px', padding: '20px'}}>
                <div className='sort'>
                    <div className='content-icon'>
                        <Filter size={32} min={32} />
                    </div>
                    <h2 className='content-label-title'>Фільтр</h2>
                </div>
                <button className='filter-close-button' onClick={toggleFilter}>
                    <X size={24} />
                </button>
            </div>
            <div className='filter-group year'>
                <div className='row'>
                    <InputRange
                        minValue={1959}
                        maxValue={2024}
                        value={{ min: minYear, max: maxYear }}
                        onChange={value => {
                            setMinYear(value.min);
                            setMaxYear(value.max);
                        }}
                        formatLabel={(value) => value}
                        step={1}
                    />
                    <div className='marker-range'>
                        <div className='verical-line-100' style={{ left: 0 + '%' }}></div>
                        <>
                            <div className='verical-line-30' style={{ left: 4.1025 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 8.20513 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 12.3077 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 16.4103 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 20.5128 + '%' }}></div>
                        </>
                        <div className='verical-line-100' style={{ left: 24.6154 + '%' }}></div>
                        <>
                            <div className='verical-line-30' style={{ left: 28.3516 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 32.0879 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 35.8242 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 39.5604 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 43.2967 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 47.033 + '%' }}></div>
                        </>
                        <div className='verical-line-100' style={{ left: 50.7692 + '%' }}></div>
                        <>
                            <div className='verical-line-30' style={{ left: 54.8718 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 58.9744 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 63.0769 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 67.1795 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 71.282 + '%' }}></div>
                        </>
                        <div className='verical-line-100' style={{ left: 75.3846 + '%' }}></div>
                        <>
                            <div className='verical-line-30' style={{ left: 79.4872 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 83.5897 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 87.6923 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 91.7949 + '%' }}></div>
                            <div className='verical-line-30' style={{ left: 95.8974 + '%' }}></div>
                        </>
                        <div className='verical-line-100' style={{ left: 100 + '%' }}></div>
                    </div>
                    <div className='date-filter-value'>
                        <div className='date-value' style={{ left: 0 + '%' }}>
                            1959
                        </div>
                        <div className='date-value' style={{ left: 24.6154 + '%' }}>
                            1975
                        </div>
                        <div className='date-value' style={{ left: 50.7692 + '%' }}>
                            1992
                        </div>
                        <div className='date-value' style={{ left: 75.3846 + '%' }}>
                            2008
                        </div>
                        <div className='date-value' style={{ left: 100 + '%' }}>
                            2024
                        </div>
                    </div>
                </div>
            </div>
            <div className='filter-group genres'>
                <div className='genres'>Жанри</div>
                <div className='content-genres filter-genres'>
                    <CustomSelect
                        options={options}
                        defaultValue='Виберіть жанр'
                        onSelect={handleSelect}
                        type='genres'
                    />
                </div>
            </div>
            <div className='filter-group age'>
                <div className='genres'>Вікове обмеження</div>
                <CustomSelect
                    options={ageOptions}
                    defaultValue='Виберіть рейтинг'
                    onSelect={handleSelect}
                    type='age'
                />
            </div>
        </div>
    );
};

export default Filters;
