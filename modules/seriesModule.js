const db = require('../db');

const getSeriesById = async (seriesId) => {
    try {
        const series = await db('series').where('id', seriesId).first();
        return series;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getSeriesById,
};