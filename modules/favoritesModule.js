const db = require('../db');
const moviesModel = require('./moviesModule');
const seriesModel = require('./seriesModule');

const addFavorite = async (contentId, userId, contentType) => {
    try {
        let content, tableName;
        if (contentType === 'movie') {
            content = await moviesModel.getMovieById(contentId);
            tableName = 'moviefavorites';
        } else if (contentType === 'series') {
            content = await seriesModel.getSeriesById(contentId);
            tableName = 'seriesfavorites';
        } else {
            throw new Error('Неподдерживаемый тип контента');
        }

        if (!content) {
            throw new Error('Контент не найден');
        }

        const existingFavorite = await db(tableName)
            .where({ user_id: userId, content_id: contentId })
            .first();

        if (existingFavorite) {
            throw new Error('Контент уже добавлен в избранное');
        }

        await db(tableName).insert({ user_id: userId, content_id: contentId });

        return 'Контент успешно добавлен в избранное';
    } catch (error) {
        throw error;
    }
};

const removeFavorite = async (contentId, userId, contentType) => {
    try {
        let content;
        let tableName;
        if (contentType === 'movie') {
            content = await moviesModel.getMovieById(contentId);
            tableName = 'moviefavorites';
        } else if (contentType === 'series') {
            content = await seriesModel.getSeriesById(contentId);
            tableName = 'seriesfavorites';
        } else {
            throw new Error('Неподдерживаемый тип контента');
        }

        if (!content) {
            throw new Error('Контент не найден');
        }

        const existingFavorite = await db(tableName)
            .where({ user_id: userId, content_id: contentId })
            .first();

        if (!existingFavorite) {
            throw new Error('Контент не добавлен в избранное');
        }

        await db(tableName)
            .where({ user_id: userId, content_id: contentId })
            .del();

        return 'Контент успешно удален из избранного';
    } catch (error) {
        throw error;
    }
};

const checkFavorite = async (contentId, userId, contentType) => {
    try {
        let tableName;
        if (contentType === 'movie') {
            tableName = 'moviefavorites';
        } else if (contentType === 'series') {
            tableName = 'seriesfavorites';
        } else {
            throw new Error('Неподдерживаемый тип контента');
        }

        const existingFavorite = await db(tableName)
            .where({ content_id: contentId, user_id: userId })
            .first();

        return !!existingFavorite;
    } catch (error) {
        throw error;
    }
};

const getFavorites = async (userId) => {
    try {
        const movieFavorites = await db('moviefavorites')
            .join('movies', 'moviefavorites.content_id', 'movies.id')
            .where('moviefavorites.user_id', userId)
            .select('movies.*', 'moviefavorites.created_at as added_at');

        const seriesFavorites = await db('seriesfavorites')
            .join('series', 'seriesfavorites.content_id', 'series.id')
            .where('seriesfavorites.user_id', userId)
            .select('series.*', 'seriesfavorites.created_at as added_at');

        // Добавляем тип контента для различия между фильмами и сериалами
        const moviesWithContentType = movieFavorites.map(movie => ({ ...movie, content_type: 'movie' }));
        const seriesWithContentType = seriesFavorites.map(series => ({ ...series, content_type: 'series' }));

        const favorites = [...moviesWithContentType, ...seriesWithContentType];
        
        // Сортируем избранное по дате добавления
        favorites.sort((a, b) => new Date(b.added_at) - new Date(a.added_at));
        
        return favorites;
    } catch (error) {
        throw error;
    }
};


module.exports = {
    addFavorite,
    removeFavorite,
    checkFavorite,
    getFavorites,
};
