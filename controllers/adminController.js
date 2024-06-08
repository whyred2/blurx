const db = require('../db');

const getChatMessages = async (req, res) => {
    try {
        const result = await db('admin_chat')
            .select('admin_chat.*', 'users.username as user_username')
            .leftJoin('users', 'admin_chat.user_id', 'users.id');
        
        res.status(200).json( result );
    } catch (error) {
        console.error('Ошибка при получении сообщений:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении сообщений' });
    }
};

const deleteChatMessages = async (req, res) => {
    try {
        await db('admin_chat').del();
        
        res.status(200).json({ message: 'Все сообщения чата успешно удалены' });
    } catch (error) {
        console.error('Ошибка при удалении сообщений чата:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении сообщений чата' });
    }
};

const sendMessageToChat = async (req, res) => {
    const { text } = req.body;
    const userId = req.user.userId;
    try {
        await db('admin_chat').insert({ 'user_id': userId, 'text': text });

        res.status(200);
    } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
        res.status(500).json({ message: 'Ошибка сервера при отправке сообщения' });
    }
};

const deleteComment = async (req, res) => {
    const { commentId } = req.params;
    const { type } = req.body;
    try {
        let contentTable;
        if (type.contentType === 'movie') {
            contentTable = 'movie';
        } else if (type.contentType === 'series') {
            contentTable = 'series';
        } else {
            throw new Error('Неверный тип контента');
        }

        await db.transaction(async (trx) => {
            if (type.commentType === 'comment') {
                await trx(`${contentTable}comment_complaints`).where({ 'comment_id': commentId }).del();
                await trx(`${contentTable}comment_replies`).where({ 'comment_id': commentId }).del();
                await trx(`${contentTable}comment_votes`).where({ 'comment_id': commentId }).del();
                await trx(`${contentTable}comments`).where({ 'id': commentId }).del();
            } else if (type.commentType === 'reply') {
                await trx(`${contentTable}comment_complaints_reply`).where({ 'comment_id': commentId }).del();
                await trx(`${contentTable}comment_votes_reply`).where({ 'comment_id': commentId }).del();
                await trx(`${contentTable}comment_replies`).where({ 'id': commentId }).del();
            } else {
                throw new Error('Неверный тип комментария');
            }
        });

        res.status(200).json({ message: 'Комментарий успешно удален' });
    } catch (error) {
        console.error('Ошибка при удалении комментария через админ-панель:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении комментария' });
    }
};

const deleteComplaint = async (req, res) => {
    const { complaintId } = req.params;
    const { type } = req.body;
    try {

        let contentTable;
        if (type.contentType === 'movie') {
            contentTable = 'movie';
        } else if (type.contentType === 'series') {
            contentTable = 'series';
        } else {
            throw new Error('Неверный тип контента');
        }

        await db.transaction(async (trx) => {
            if (type.commentType === 'comment') {
                await trx(`${contentTable}comment_complaints`).where({ 'id': complaintId }).del();
            } else if (type.commentType === 'reply') {
                await trx(`${contentTable}comment_complaints_reply`).where({ 'id': complaintId }).del();
            } else {
                throw new Error('Неверный тип комментария');
            }
        });

    } catch (error) {
        console.error('Ошибка при удалении комментария через админ-панель:', error);
        res.status(500).json({ message: 'Ошибка сервера при отправке сообщения' });
    }
};

const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await db('users').count('* as count').first();

        const [movieContent, seriesContent] = await Promise.all([
            db('movies').count('* as count').first(),
            db('series').count('* as count').first()
        ]);

        const totalContent = { 
            movieContent: movieContent.count, 
            seriesContent: seriesContent.count 
        };

        const [movieComments, seriesComments, replyMovieComments, replySeriesComments] = await Promise.all([
            db('moviecomments').count('* as count').first(),
            db('seriescomments').count('* as count').first(),
            db('moviecomment_replies').count('* as count').first(),
            db('seriescomment_replies').count('* as count').first()
        ]);

        const totalComments = { 
            movieComments: movieComments.count, 
            seriesComments: seriesComments.count, 
            replyMovieComments: replyMovieComments.count, 
            replySeriesComments: replySeriesComments.count 
        };

        const [movieCommentsComplaints, seriesCommentsComplaints, replyMovieCommentsComplaints, replySeriesCommentsComplaints] = await Promise.all([
            db('moviecomment_complaints').count('* as count').first(),
            db('seriescomment_complaints').count('* as count').first(),
            db('moviecomment_complaints_reply').count('* as count').first(),
            db('seriescomment_complaints_reply').count('* as count').first()
        ]);

        const totalComplaints = { 
            movieCommentsComplaints: movieCommentsComplaints.count, 
            seriesCommentsComplaints: seriesCommentsComplaints.count, 
            replyMovieCommentsComplaints: replyMovieCommentsComplaints.count, 
            replySeriesCommentsComplaints: replySeriesCommentsComplaints.count 
        };

        res.json({ 
            totalUsers: totalUsers.count, 
            totalContent, 
            totalComments, 
            totalComplaints 
        });
    } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении статистики' });
    }
};

const getContentStats = async (req, res) => {
    try {
        const [movieContent, seriesContent] = await Promise.all([
            db('movies').count('* as count').first(),
            db('series').count('* as count').first()
        ]);

        const totalContent = { 
            movieContent: movieContent.count, 
            seriesContent: seriesContent.count 
        };

        res.json({ 
            totalContent, 
        });
    } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении статистики' });
    }
};

const getContent = async (req, res) => {
    try {
        const [movieContent, seriesContent] = await Promise.all([
            db('movies').select('*'),
            db('series').select('*')
        ]);

        const content = { 
            movies: movieContent, 
            series: seriesContent 
        };

        res.json({ 
            content, 
        });
    } catch (error) {
        console.error('Ошибка при получении контента:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении контента' });
    }
};

const updateContent = async (req, res) => {
    const { contentType, rowIndex, columnId, value } = req.body;

    const tableNames = {
        movie: 'movies',
        series: 'series',
    };

    const columnNames = {
        title: 'title',
        title_english: 'title_english',
        cover_image: 'cover_image',
        trailer_url: 'trailer_url',
        description: 'description',
        release_date: 'release_date',
        release_country: 'release_country',
        age_rating: 'age_rating',
        duration_minutes: 'duration_minutes',
        rating: 'rating',
        season: 'season',
        episodes_count: 'episodes_count',
    };

    if (!tableNames[contentType] || !columnNames[columnId]) {
        return res.status(400).json({ message: 'Неверное имя столбца или тип контента' });
    }
    try {
        const result = await db(tableNames[contentType])
        .update({ [columnNames[columnId]]: value })
        .where({ id: rowIndex });
    
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Запись не найдена' });
        }

        res.status(200).json({ message: 'Контент успешно обновлен' });
    } catch (error) {
        console.error('Ошибка при обновлении контента:', error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении контента' });
    }
};

const deleteContent = async (req, res) => {
    const { contentId } = req.params;
    console.log(contentId, )
    const tableNames = {
        movie: 'movies',
        series: 'series',
    }

    try {
        await db('movies').where({ 'id': contentId }).del();

        res.status(200).json({ message: 'Контент успішно видалено' });
    } catch (error) {
        console.error('Помилка при видаленні контенту:', error);
        res.status(500).json({ message: 'Помилка сервера при видаленні контенту' });
    }
};


const getUsersStats = async (req, res) => {
    try {
        const totalUsers = await db('users').count('id').first();
        const users30Days = await db('users')
            .count('*')
            .where('register_date', '>=', db.raw('CURRENT_DATE - INTERVAL \'30 days\''))
            .first();

        const users7Days = await db('users')
            .count('*')
            .where('register_date', '>=', db.raw('CURRENT_DATE - INTERVAL \'7 days\''))
            .first();

        const users1Day = await db('users')
            .count('*')
            .where('register_date', '>=', db.raw('CURRENT_DATE'))
            .first();

        res.json({
            totalUsers: totalUsers.count,
            users30Days: users30Days.count,
            users7Days: users7Days.count,
            users1Days: users1Day.count
        });
    } catch (error) {
        console.error('Ошибка при загрузке статистики пользователей:', error);
        res.status(500).json({ message: 'Ошибка сервера при загрузке статистики пользователей' });
    }
};


module.exports = {
    getChatMessages,
    deleteChatMessages,
    sendMessageToChat,

    deleteComment,
    deleteComplaint,

    getAdminStats,
    getContentStats,
    getUsersStats,

    getContent,
    updateContent,
    deleteContent,
};
