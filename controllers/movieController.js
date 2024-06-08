const db = require('../db');
const moviesModule = require('../modules/favoritesModule.js');

const addMovie = async (req, res) => {
    try {
        const {
            title,
            title_english,
            cover_image,
            description,
            trailer_url,
            frames_url,
            release_date,
            release_country,
            age_rating,
            duration_minutes,
            genres,
            rating,
        } = req.body;
    
        const { id: movieId } = await db('movies').insert({
            title,
            title_english,
            cover_image,
            trailer_url,
            frames_url,
            description,
            release_date,
            release_country,
            age_rating,
            duration_minutes,
            rating,
        }).returning('id').then(([id]) => id);
    
        const genreIds = genres.map(genre => parseInt(genre));
    
        await Promise.all(genreIds.map(async (genreId) => {
            await db('moviegenres').insert({
            movie_id: movieId,
            genre_id: genreId,
            });
        }));
    
        res.status(201).json({ message: 'Фильм успешно добавлен' });
    } catch (error) {
        console.error('Ошибка при добавлении фильма:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const getMovies = async (req, res) => {
    try {
        const movies = await db('movies').select('*');
        res.json(movies);
    } catch (error) {
        console.error('Ошибка при получении списка фильмов:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const getMovieByTitle = async (req, res) => {
    const { title } = req.params;
    try {
        const movie = await db('movies').where({ title }).first();
        if (!movie) {
            return res.status(404).json({ message: 'Фильм не найден' });
        }
  
        const genres = await db('moviegenres')
          .select('genres.name')
          .join('genres', 'moviegenres.genre_id', 'genres.id')
          .where('moviegenres.movie_id', movie.id);
        
        res.json({ movie, genres });
    } catch (error) {
        console.error('Ошибка при получении данных о фильме:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const rateMovie = async (req, res) => {
    const { movieId, value } = req.body;
    const userId = req.user.userId;
  
    try {
        // Получаем информацию о фильме
        const movie = await db('movies').where('id', movieId).first();
        if (!movie) {
            return res.status(404).json({ message: 'Фильм не найден' });
        }
    
        // Проверяем, что оценка находится в допустимых пределах
        if (value < 1 || value > 10) {
            return res.status(400).json({ message: 'Недопустимая оценка' });
        }
    
        // Проверяем, что пользователь еще не оценивал этот фильм
        const existingRating = await db('movieratings')
            .where({ user_id: userId, movie_id: movieId })
            .first();
    
        if (existingRating) {
            // Если оценка уже существует, то обновляем её
            await db('movieratings')
            .where({ user_id: userId, movie_id: movieId })
            .update({ rating: value });
    
            // Обновляем общий рейтинг фильма
            const ratings = await db('movieratings').where('movie_id', movieId).select('rating');
            const totalRating = ratings.reduce((acc, cur) => acc + cur.rating, 0);
            const avgRating = totalRating / ratings.length;
    
            await db('movies').where('id', movieId).update({ rating: avgRating });
    
            return res.json({ message: 'Рейтинг обновлен успешно' });
        }
  
        // Добавляем новую оценку фильму
        await db('movieratings').insert({ user_id: userId, movie_id: movieId, rating: value });
    
        // Обновляем общий рейтинг фильма
        const ratings = await db('movieratings').where('movie_id', movieId).select('rating');
        const totalRating = ratings.reduce((acc, cur) => acc + cur.rating, 0);
        const avgRating = totalRating / ratings.length;
    
        await db('movies').where('id', movieId).update({ rating: avgRating });
    
        res.json({ message: 'Рейтинг добавлен успешно' });
    } catch (error) {
        console.error('Ошибка при добавлении/обновлении рейтинга фильма:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
  
const userRating = async (req, res) => {
    const { movieId } = req.params;
    const userId = req.user.userId;

    try {
        const movie = await db('movies').where('title', movieId).first();
        if (!movie) {
            return res.json({ message: 'Фильм не найден' });
        }

        const userRating = await db('movieratings')
            .where({ user_id: userId, movie_id: movie.id })
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
    const { movieId } = req.params;
  
    try {
        const movie = await db('movies').where('title', movieId).first();
        if (!movie) {
            return res.status(404).json({ message: 'Фильм не найден' });
        }

        const ratingCount = await db('movieratings').where({ movie_id: movie.id }).countDistinct('user_id').first();
        const count = ratingCount['count'];
        res.json({ count });
    } catch (error) {
        console.error('Ошибка при получении количества пользователей:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

const deleteMovie = async (req, res) => {
    const { movieId } = req.params;

    try {
        const movie = await db('movies').where('title', movieId).first();
        if (!movie) {
            return res.status(404).json({ message: 'Фильм не найден' });
        }
        await db('moviefavorites').where('content_id', movie.id).del();
        await db('movieratings').where('movie_id', movie.id).del();
        await db('moviegenres').where('movie_id', movie.id).del();

        await db('moviecomment_complaints').where('movie_id', movie.id).del();
        await db('moviecomments').where('movie_id', movie.id).del();

        await db('movies').where('id', movie.id).del();
        
        res.status(200).json({ message: 'Фильм успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении фильма:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении фильма' });
    }
};

module.exports = {
    addMovie,
    getMovies,
    getMovieByTitle,
    rateMovie,
    userRating,
    getRatingCount,
    deleteMovie,
}