import React, { createContext, useState, useContext } from 'react';

const CommentContext = createContext();

export const useComments = () => {
    return useContext(CommentContext);
};

export const CommentProvider = ({ children }) => {
    const [comments, setComments] = useState([]);

    const addComment = (comment) => {
        setComments(prevComments => [...prevComments, comment]);
    };

    return (
        <CommentContext.Provider value={{ comments, addComment }}>
            {children}
        </CommentContext.Provider>
    );
};
