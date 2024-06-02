const favoritesModule = require('../modules/favoritesModule');

const addFavorite = async (req, res) => {
    const contentId = req.body.item_id;
    const contentType = req.body.type;
    const userId = req.user.userId;
    try {
        const result = await favoritesModule.addFavorite(contentId, userId, contentType);
        return res.status(200).json({ message: result });
    } catch (error) {
        console.error('Ошибка при добавлении в избранное:', error);
        return res.status(500).json({ message: 'Ошибка сервера при добавлении' });
    }
};

const removeFavorite = async (req, res) => {
    const contentId = req.body.item_id;
    const userId = req.user.userId;
    const contentType = req.body.type;
    try {
        const result = await favoritesModule.removeFavorite(contentId, userId, contentType);
        return res.status(200).json({ message: result });
    } catch (error) {
        console.error('Ошибка при удалении из избранного:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении' });
    }
};

const checkFavorite = async (req, res) => {
    const contentId = req.params.contentId;
    const userId = req.user.userId;
    const contentType = req.query.type;
    try {
        const isFavorite = await favoritesModule.checkFavorite(contentId, userId, contentType);
        return res.status(200).json({ isFavorite });
    } catch (error) {
        console.error('Ошибка при проверке на избранное:', error);
        res.status(500).json({ message: 'Ошибка сервера при проверке' });
    }
};

const getFavorites = async (req, res) => {
    const userId = req.user.userId;
    try {
        const result = await favoritesModule.getFavorites(userId);
        return res.status(200).json( result );
    } catch (error) {
        console.error('Ошибка при получении избранного:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении' });
    }
};

module.exports = {
    addFavorite,
    removeFavorite,
    checkFavorite,
    getFavorites,
};
