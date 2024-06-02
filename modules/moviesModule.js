const db = require('../db');

const getMovieById = async (movieId) => {
    try {
        const movie = await db('movies').where('id', movieId).first();
        return movie;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getMovieById,
};