const express = require('express');
const router = express.Router();
const db = require('../db');
const contentController = require('../controllers/contentController.js');
const movieController = require('../controllers/movieController.js');
const seriesController = require('../controllers/seriesController.js');
const { authenticateToken } = require('../middleware/authenticateToken.js');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage() 
});

router.get('/genres', async (req, res) => {
    try {
      const genres = await db.select().from('genres');
      res.json(genres);
    } catch (error) {
      console.error('Ошибка при получении списка жанров:', error);
      res.status(500).json({ message: 'Ошибка сервера' });
    }
});
  
router.post('/upload-cover', upload.single('coverImage'), contentController.uploadCover);
router.post('/upload-frames', upload.array('files', 4), contentController.uploadFrames);
router.delete('/remove-cover', contentController.removeCover);
router.post('/remove-frames', contentController.removeFrames);

router.post('/add-movie', movieController.addMovie);
router.post('/add-series', seriesController.addSeries);
router.get('/movies', movieController.getMovies);
router.get('/series', seriesController.getSeries);
router.get('/movies/:title', movieController.getMovieByTitle);
router.get('/series/:title', seriesController.getSeriesByTitle);
router.delete('/movies/:movieId/delete-movie', movieController.deleteMovie);
router.delete('/series/:seriesId/delete-series', seriesController.deleteSeries);

router.get('/movies-and-series', contentController.getMoviesAndSeries);

router.post('/filter', contentController.contentFilter);
router.get('/search', contentController.contentSearch);

router.post('/movies/:movieId/rating', authenticateToken, movieController.rateMovie);
router.get('/movies/:movieId/user-rating', authenticateToken, movieController.userRating);
router.get('/movies/:movieId/rating-count', movieController.getRatingCount);

router.post('/series/:seriesId/rating', authenticateToken, seriesController.rateSeries);
router.get('/series/:seriesId/user-rating', authenticateToken, seriesController.userRating);
router.get('/series/:seriesId/rating-count', seriesController.getRatingCount);

module.exports = router;