import React, { useState, useEffect, useRef } from 'react';
import { LuChevronUp, LuChevronDown } from 'react-icons/lu';
import './Select.css';

const CustomSelect = ({ options, defaultValue, onSelect, type }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleSelect = (value) => {
        const isSelected = selectedItems.includes(value);
        let updatedItems;
        if (isSelected) {
            updatedItems = selectedItems.filter((item) => item !== value);
        } else {
            updatedItems = [...selectedItems, value];
        }

        updatedItems.sort((a, b) => {
            const numA = typeof a === 'string' ? parseInt(a.replace(/[^\d]/g, ''), 10) : a;
            const numB = typeof b === 'string' ? parseInt(b.replace(/[^\d]/g, ''), 10) : b;
            return numA - numB;
        });

        setSelectedItems(updatedItems);
        onSelect(updatedItems, type);
    };

    const renderButtonLabel = () => {
        const selectedLabels = selectedItems.map(item => options.find(option => option.value === item)?.label);
        const label = selectedLabels.join(', ');
        if (label.length > 25) {
            return label.substring(0, 25) + '...';
        }
        return label;
    };

    return (
        <div ref={selectRef} className='custom-select'>
            <div className='select-header'>
                <button className='regular-btn select-btn' onClick={() => setIsOpen(!isOpen)}>
                    {selectedItems.length > 0 ? renderButtonLabel() : defaultValue} 
                    {isOpen ? 
                        <LuChevronUp
                            className='select-icon'
                        /> : 
                        <LuChevronDown 
                            className='select-icon'
                        />
                    }
                </button>
            </div>
            {isOpen && (
                <div className='select-list'>
                    {options.map((option) => (
                        <label key={option.value} className='dropdown-item'>
                            <span className='custom-control'>
                                <input
                                    className='custom-control-input'
                                    type='checkbox'
                                    value={option.value}
                                    checked={selectedItems.includes(option.value)}
                                    onChange={() => handleSelect(option.value)}
                                />
                                <span className='custom-control-indicator'></span>
                                <span className='custom-control-description'>{option.label}</span>
                            </span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;