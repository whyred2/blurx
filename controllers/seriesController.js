const db = require('../db');

const addSeries = async (req, res) => {
    try {
        const {
            title,
            title_english,
            cover_image,
            description,
            episodes_count,
            season,
            trailer_url,
            frames_url,
            release_date,
            release_country,
            age_rating,
            duration_minutes,
            genres,
            rating,
        } = req.body;
    
        const { id: seriesId } = await db('series').insert({
            title,
            title_english,
            cover_image,
            description,
            episodes_count,
            season,
            trailer_url,
            frames_url,
            release_date,
            release_country,
            age_rating,
            duration_minutes,
            rating,
        }).returning('id').then(([id]) => id);
    
        const genreIds = genres.map(genre => parseInt(genre));
    
        await Promise.all(genreIds.map(async (genreId) => {
            await db('seriesgenres').insert({
            series_id: seriesId,
            genre_id: genreId,
            });
        }));
    
        res.status(201).json({ message: 'Сериал успешно добавлен' });
    } catch (error) {
        console.error('Ошибка при добавлении сериала:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const getSeries = async (req, res) => {
    try {
        const series = await db('series').select('*');
        res.json(series);
    } catch (error) {
        console.error('Ошибка при получении списка сериалов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const getSeriesByTitle = async (req, res) => {
    const { title } = req.params;
    try {
        const series = await db('series').where({ title }).first();
        if (!series) {
            return res.status(404).json({ message: 'Сериал не найден' });
        }
  
        const genres = await db('seriesgenres')
          .select('genres.name')
          .join('genres', 'seriesgenres.genre_id', 'genres.id')
          .where('seriesgenres.series_id', series.id);
        
  
        res.json({ series, genres });
    } catch (error) {
        console.error('Ошибка при получении данных о сериале:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const rateSeries = async (req, res) => {
    const { seriesId, value } = req.body;
    const userId = req.user.userId;
  
    try {
        // Получаем информацию о фильме
        const series = await db('series').where('id', seriesId).first();
        if (!series) {
            return res.status(404).json({ message: 'Сериал не найден' });
        }
    
        // Проверяем, что оценка находится в допустимых пределах
        if (value < 1 || value > 10) {
            return res.status(400).json({ message: 'Недопустимая оценка' });
        }
    
        // Проверяем, что пользователь еще не оценивал этот фильм
        const existingRating = await db('seriesratings')
            .where({ user_id: userId, series_id: seriesId })
            .first();
    
        if (existingRating) {
            // Если оценка уже существует, то обновляем её
            await db('seriesratings')
            .where({ user_id: userId, series_id: seriesId })
            .update({ rating: value });
    
            // Обновляем общий рейтинг фильма
            const ratings = await db('seriesratings').where('series_id', seriesId).select('rating');
            const totalRating = ratings.reduce((acc, cur) => acc + cur.rating, 0);
            const avgRating = totalRating / ratings.length;
    
            await db('series').where('id', seriesId).update({ rating: avgRating });
    
            return res.json({ message: 'Рейтинг обновлен успешно' });
        }
  
        // Добавляем новую оценку фильму
        await db('seriesratings').insert({ user_id: userId, series_id: seriesId, rating: value });
    
        // Обновляем общий рейтинг фильма
        const ratings = await db('seriesratings').where('series_id', seriesId).select('rating');
        const totalRating = ratings.reduce((acc, cur) => acc + cur.rating, 0);
        const avgRating = totalRating / ratings.length;
    
        await db('series').where('id', seriesId).update({ rating: avgRating });
    
        res.json({ message: 'Рейтинг добавлен успешно' });
    } catch (error) {
        console.error('Ошибка при добавлении/обновлении рейтинга сериала:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
  
const userRating = async (req, res) => {
    const { seriesId } = req.params;
    const userId = req.user.userId;

    try {
        const series = await db('series').where('title', seriesId).first();
        if (!series) {
            return res.json({ message: 'Фильм не найден' });
        }

        const userRating = await db('seriesratings')
            .where({ user_id: userId, series_id: series.id })
            .select('rating')
            .first();
    
        if (!userRating) {
            return res.json({ userRating: 0 });
        }
    
        res.json({ userRating: userRating.rating });
    } catch (error) {
        console.error('Ошибка при получении рейтинга пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const getRatingCount = async (req, res) => {
    const { seriesId } = req.params;
  
    try {
        const series = await db('series').where('title', seriesId).first();
        if (!series) {
            return res.status(404).json({ message: 'Фильм не найден' });
        }

        const ratingCount = await db('seriesratings').where({ series_id: series.id }).countDistinct('user_id').first();
        const count = ratingCount['count'];
        res.json({ count });
    } catch (error) {
        console.error('Ошибка при получении количества пользователей:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const deleteSeries = async (req, res) => {
    const { seriesId } = req.params;

    try {
        const series = await db('series').where('title', seriesId).first();
        if (!series) {
            return res.status(404).json({ message: 'Сериал не найден' });
        }

        await db('seriesfavorites').where('content_id', series.id).del();
        await db('seriesratings').where('series_id', series.id).del();
        await db('seriesgenres').where('series_id', series.id).del();

        await db('seriescomment_complaints').where('series_id', series.id).del();
        await db('seriescomments').where('series_id', series.id).del();
        
        await db('series').where('id', series.id).del();
        
        res.status(200).json({ message: 'Сериал успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении сериала:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении сериала' });
    }
};

module.exports = {
    addSeries,
    getSeries,
    getSeriesByTitle,
    rateSeries,
    userRating,
    getRatingCount,
    deleteSeries,
}