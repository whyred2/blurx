const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favoriteController.js');
const { authenticateToken } = require('../middleware/authenticateToken.js');

router.post('/add', authenticateToken, favoritesController.addFavorite);
router.delete('/remove', authenticateToken, favoritesController.removeFavorite);

router.get('/check/:contentId', authenticateToken, favoritesController.checkFavorite);

router.get('/get', authenticateToken, favoritesController.getFavorites);

module.exports = router;