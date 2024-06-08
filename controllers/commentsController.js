const commentModule = require('../modules/commentModule');
const db = require('../db');

const getStats = async (req, res) => {
    try {
        const movieComments = await db('moviecomments').count('*').first();
        const seriesComments = await db('seriescomments').count('*').first();

        const comments = { movieComments, seriesComments }

        const replyMovieComments = await db('moviecomment_replies').count('*').first();
        const replySeriesComments = await db('seriescomment_replies').count('*').first();
        const replyComments = { replyMovieComments, replySeriesComments };

        const movieCommentsComplaints = await db('moviecomment_complaints').count('*').first();
        const seriesCommentsComplaints = await db('seriescomment_complaints').count('*').first();
        const CommentsComplaints = { movieCommentsComplaints, seriesCommentsComplaints };

        const replyMovieCommentsComplaints = await db('moviecomment_complaints_reply').count('*').first();
        const replySeriesCommentsComplaints = await db('seriescomment_complaints_reply').count('*').first();
        const replyCommentsComplaints = { replyMovieCommentsComplaints, replySeriesCommentsComplaints };

        res.json({ comments, replyComments, CommentsComplaints, replyCommentsComplaints });
    } catch (error) {
        console.error('Ошибка при получении статистики:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении статистики' });
    }
};

const getLatestComments = async (req, res) => {
    try {
        const movieComments = await db('moviecomments')
            .select('moviecomments.*', 'users.username as user_username')
            .leftJoin('users', 'moviecomments.user_id', 'users.id')
            .select('moviecomments.*', 'movies.title as title')
            .leftJoin('movies', 'moviecomments.movie_id', 'movies.id');
        
        const seriesComments = await db('seriescomments')
            .select('seriescomments.*', 'users.username as user_username')
            .leftJoin('users', 'seriescomments.user_id', 'users.id')
            .select('seriescomments.*', 'series.title as title')
            .leftJoin('series', 'seriescomments.series_id', 'series.id');;
            
        const comments = { movieComments, seriesComments };

        res.status(200).json(comments);
    } catch (error) {
        console.error('Ошибка при получении комментариев:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении статистики' });
    }
};

const getCommentsComplaints = async (req, res) => {
    try {
        const movieCommentsComplaints = await db('moviecomment_complaints')
            .select(
                'moviecomment_complaints.*',
                'moviecomments.text as comment_text',
                'moviecomments.created_at as comment_created_at',
                'users.username as user_username',
                'movies.title'
            )
            .leftJoin('moviecomments', 'moviecomment_complaints.comment_id', 'moviecomments.id')
            .leftJoin('users', 'moviecomments.user_id', 'users.id')
            .leftJoin('movies', 'moviecomment_complaints.movie_id', 'movies.id');

        const seriesCommentsComplaints = await db('seriescomment_complaints')
            .select(
                'seriescomment_complaints.*',
                'seriescomments.text as comment_text',
                'seriescomments.created_at as comment_created_at',
                'users.username as user_username',
                'series.title'
            )
            .leftJoin('seriescomments', 'seriescomment_complaints.comment_id', 'seriescomments.id')
            .leftJoin('users', 'seriescomments.user_id', 'users.id')
            .leftJoin('series', 'seriescomment_complaints.series_id', 'series.id');

        
        const movieCommentsComplaintsReply = await db('moviecomment_complaints_reply')
            .select(
                'moviecomment_complaints_reply.*',
                'moviecomment_replies.text as comment_text',
                'moviecomment_replies.created_at as comment_created_at',
                'users.username as user_username',
                'movies.title'
            )
            .leftJoin('moviecomment_replies', 'moviecomment_complaints_reply.comment_id', 'moviecomment_replies.id')
            .leftJoin('users', 'moviecomment_replies.user_id', 'users.id')
            .leftJoin('movies', 'moviecomment_complaints_reply.movie_id', 'movies.id');

        const seriesCommentsComplaintsReply = await db('seriescomment_complaints_reply')
            .select(
                'seriescomment_complaints_reply.*',
                'seriescomment_replies.text as comment_text',
                'seriescomment_replies.created_at as comment_created_at',
                'users.username as user_username',
                'series.title'
            )
            .leftJoin('seriescomment_replies', 'seriescomment_complaints_reply.comment_id', 'seriescomment_replies.id')
            .leftJoin('users', 'seriescomment_replies.user_id', 'users.id')
            .leftJoin('series', 'seriescomment_complaints_reply.series_id', 'series.id');
        
        const comments = { movieCommentsComplaints, seriesCommentsComplaints, movieCommentsComplaintsReply, seriesCommentsComplaintsReply };
        res.status(200).json(comments);
    } catch (error) {
        console.error('Ошибка при получении жалоб на комментарии:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении жалоб на комментарии' });
    }
};

const addComment = async (req, res) => {
    const { text } = req.body;
    const { mediaId } = req.params;
    const userId = req.user.userId;
    const mediaType = req.path.includes('movie') ? 'movie' : 'series';
    try {
        const comments = mediaType === 'movie' 
            ? await commentModule.addMovieComment(mediaId, userId, text)
            : await commentModule.addSeriesComment(mediaId, userId, text);
        res.status(200).json(comments);
    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
        res.status(500).json({ message: 'Ошибка сервера при добавлении комментария' });
    }
};

const addCommentReply = async (req, res) => {
    const { text } = req.body;
    const { commentId } = req.params;
    const userId = req.user.userId;
    const mediaType = req.path.includes('movie') ? 'movie' : 'series';
    try {
        
        const comments = mediaType === 'movie' 
            ? await commentModule.addMovieCommentReply(commentId, userId, text)
            : await commentModule.addSeriesCommentReply(commentId, userId, text);
        res.status(200).json(comments);
    } catch (error) {
        console.error('Ошибка при добавлении комментария:', error);
        res.status(500).json({ message: 'Ошибка сервера при добавлении комментария' });
    }
};

const getComment = async (req, res) => {
    const { mediaId } = req.params;
    const mediaType = req.path.includes('movie') ? 'movie' : 'series';
    try {
        const comments = mediaType === 'movie' 
            ? await commentModule.getMovieComment(mediaId)
            : await commentModule.getSeriesComment(mediaId);
        res.status(200).json(comments);
    } catch (error) {
        console.error('Ошибка при получении комментариев:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении комментариев' });
    }
};

const likeComment = async(req, res) => {
    const { commentId } = req.params;
    const mediaType = req.path.includes('movie') ? 'movie' : 'series';
    const userId = req.user.userId;
    try {
        const result = mediaType === 'movie' 
            ? await commentModule.addMovieLike(commentId, userId)
            : await commentModule.addSeriesLike(commentId, userId);
        return res.status(200).json({ message: result });
    } catch (error) {
        console.error('Ошибка при добавлении лайка:', error);
        res.status(500).json({ message: 'Ошибка сервера при добавлении лайка' });
    }
};

const likeCommentReply = async(req, res) => {
    const { commentId } = req.params;
    const mediaType = req.path.includes('movie') ? 'movie' : 'series';
    const userId = req.user.userId;
    try {
        const result = mediaType === 'movie' 
            ? await commentModule.addMovieLikeReply(commentId, userId)
            : await commentModule.addSeriesLikeReply(commentId, userId);
        return res.status(200).json({ message: result });
    } catch (error) {
        console.error('Ошибка при добавлении лайка:', error);
        res.status(500).json({ message: 'Ошибка сервера при добавлении лайка' });
    }
};

const dislikeComment = async(req, res) => {
    const { commentId } = req.params;
    const mediaType = req.path.includes('movie') ? 'movie' : 'series';
    const userId = req.user.userId;
    try {
        const result = mediaType === 'movie' 
            ? await commentModule.addMovieDislike(commentId, userId)
            : await commentModule.addSeriesDislike(commentId, userId);
        return res.status(200).json({ message: result });
    } catch (error) {
        console.error('Ошибка при добавлении дизлайка:', error);
        res.status(500).json({ message: 'Ошибка сервера при добавлении дизлайка' });
    }
};

const dislikeCommentReply = async(req, res) => {
    const { commentId } = req.params;
    const mediaType = req.path.includes('movie') ? 'movie' : 'series';
    const userId = req.user.userId;
    try {
        const result = mediaType === 'movie' 
            ? await commentModule.addMovieDislikeReply(commentId, userId)
            : await commentModule.addSeriesDislikeReply(commentId, userId);
        return res.status(200).json({ message: result });
    } catch (error) {
        console.error('Ошибка при добавлении лайка:', error);
        res.status(500).json({ message: 'Ошибка сервера при добавлении лайка' });
    }
};

const delComment = async(req, res) => {
    const { commentId } = req.params;
    const mediaType = req.path.includes('movie') ? 'movie' : 'series';
    try {
        const result = mediaType === 'movie' 
            ? await commentModule.delComment(commentId, 'movie')
            : await commentModule.delComment(commentId, 'series');
        return res.status(200).json({ message: result });
    } catch (error) {
        console.error('Ошибка при удалении комментария:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении комментария' });
    }
};

const delCommentReply = async(req, res) => {
    const { commentId } = req.params;
    const mediaType = req.path.includes('movie') ? 'movie' : 'series';
    try {
        const result = mediaType === 'movie' 
            ? await commentModule.delCommentReply(commentId, 'movie')
            : await commentModule.delCommentReply(commentId, 'series');
        return res.status(200).json({ message: result });
    } catch (error) {
        console.error('Ошибка при удалении комментария:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении комментария' });
    }
};

const addComplaint = async(req, res) => {
    const mediaType = req.path.includes('movie') ? 'movie' : 'series';
    const userId = req.user.userId;
    const contentTitle = mediaType === 'movie' ? req.body.movie_id : req.body.series_id;
    const { commentId } = req.params;
    const complaintText = req.body.complaint_text;
    try { 
        const result = mediaType === 'movie' 
            ? await commentModule.addComplaint(userId, commentId, contentTitle, complaintText, 'movie')
            : await commentModule.addComplaint(userId, commentId, contentTitle, complaintText, 'series');
        return res.status(200).json({ message: result });
    } catch (error) {
        console.error('Ошибка при отправке жалобы:', error);
        res.status(500).json({ message: 'Ошибка сервера при отправке жалобы' });
    }
};

const addComplaintReply = async(req, res) => {
    const mediaType = req.path.includes('movie') ? 'movie' : 'series';
    const userId = req.user.userId;
    const contentTitle = mediaType === 'movie' ? req.body.movie_id : req.body.series_id;
    const { commentId } = req.params;
    const complaintText = req.body.complaint_text;
    try { 
        const result = mediaType === 'movie' 
            ? await commentModule.addComplaintReply(userId, commentId, contentTitle, complaintText, 'movie')
            : await commentModule.addComplaintReply(userId, commentId, contentTitle, complaintText, 'series');
        return res.status(200).json({ message: result });
    } catch (error) {
        console.error('Ошибка при отправке жалобы:', error);
        res.status(500).json({ message: 'Ошибка сервера при отправке жалобы' });
    }
};

module.exports = {
    getStats,
    getLatestComments,
    getCommentsComplaints,

    addComment,
    addCommentReply,
    getComment,
    likeComment,
    likeCommentReply,
    dislikeComment,
    dislikeCommentReply,
    delComment,
    delCommentReply,
    addComplaint,
    addComplaintReply,
};