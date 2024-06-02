const db = require('../db');

const getMediaByTitle = async (table, title) => {
    try {
        const media = await db(`${table === 'movie' ? 'movies' : 'series'}`).where('title', title).first();
        if (!media) throw new NotFoundError(`${table === 'movies' ? 'Фильм' : 'Сериал'} не найден`);
        return media;
    } catch (error) {
        throw error;
    }
};

const addComment = async (table, mediaId, userId, text) => {
    try {
        const media = await getMediaByTitle(table, mediaId);
        await db(`${table}comments`).insert({ [`${table}_id`]: media.id, user_id: userId, text });
        return 'Комментарий успешно добавлен';
    } catch (error) {
        throw error;
    }
};

const addCommentReply = async (table, commentId, userId, text) => {
    try {
        await db(`${table}comment_replies`).insert({ 'comment_id': commentId, user_id: userId, text });
        return 'Ответ на комментарий успешно добавлен';
    } catch (error) {
        throw error;
    }
}

const getComments = async (table, mediaId) => {
    try {
        const media = await getMediaByTitle(table, mediaId);
        
        const comments = await db(`${table}comments`)
            .select(`${table}comments.*`, 'users.username', db.raw(`COALESCE(${table}ratings.rating, 0) as rating`))
            .where(`${table}comments.${table}_id`, media.id)
            .leftJoin(`${table}ratings`, function () {
                this.on(`${table}comments.user_id`, '=', `${table}ratings.user_id`)
                    .andOn(`${table}comments.${table}_id`, '=', `${table}ratings.${table}_id`);
            })
            .innerJoin('users', `${table}comments.user_id`, 'users.id');

            const replies = await db(`${table}comment_replies`)
            .select(`${table}comment_replies.*`, 'users.username')
            .leftJoin('users', `${table}comment_replies.user_id`, 'users.id')
            .whereIn('comment_id', comments.map(comment => comment.id))
            .orderBy('created_at', 'desc');

        const repliesByCommentId = replies.reduce((acc, reply) => {
            acc[reply.comment_id] = acc[reply.comment_id] || [];
            acc[reply.comment_id].push(reply);
            return acc;
        }, {});

        comments.forEach(comment => {
            comment.replies = repliesByCommentId[comment.id] || [];
        });

        return comments;
    } catch (error) {
        throw error;
    }
};

const addVote = async (table, commentId, userId, voteType) => {
    try {
        const comment = await db(`${table}comments`).where('id', commentId).first();
        if (!comment) throw new NotFoundError('Комментарий не найден');

        const existingVote = await db(`${table}comment_votes`)
            .where({ user_id: userId, comment_id: commentId })
            .first();

        if (existingVote) {
            if (existingVote.vote_type === voteType) {
                await db(`${table}comment_votes`)
                    .where({ user_id: userId, comment_id: commentId })
                    .del();

                await db(`${table}comments`)
                    .where('id', commentId)
                    .decrement(voteType === 'like' ? 'likes' : 'dislikes', 1);

                return `${voteType === 'like' ? 'Лайк' : 'Дизлайк'} успешно удален`;
            } else {
                await db(`${table}comment_votes`)
                    .where({ user_id: userId, comment_id: commentId })
                    .update({ vote_type: voteType });

                await db(`${table}comments`)
                    .where('id', commentId)
                    .increment(voteType === 'like' ? 'likes' : 'dislikes', 1)
                    .decrement(voteType === 'like' ? 'dislikes' : 'likes', 1);

                return `${voteType === 'like' ? 'Дизлайк' : 'Лайк'} успешно изменен`;
            }
        }

        await db(`${table}comment_votes`).insert({
            user_id: userId,
            comment_id: commentId,
            vote_type: voteType,
        });

        await db(`${table}comments`).where('id', commentId).increment(voteType === 'like' ? 'likes' : 'dislikes', 1);

        return `${voteType === 'like' ? 'Лайк' : 'Дизлайк'} успешно добавлен`;
    } catch (error) {
        throw error;
    }
};

const addVoteReply = async (table, commentId, userId, voteType) => {
    try {
        const comment = await db(`${table}comment_replies`).where('id', commentId).first();
        if (!comment) throw new NotFoundError('Комментарий не найден');

        const existingVote = await db(`${table}comment_votes_reply`)
            .where({ user_id: userId, comment_id: commentId })
            .first();

        if (existingVote) {
            if (existingVote.vote_type === voteType) {
                await db(`${table}comment_votes_reply`)
                    .where({ user_id: userId, comment_id: commentId })
                    .del();

                await db(`${table}comment_replies`)
                    .where('id', commentId)
                    .decrement(voteType === 'like' ? 'likes' : 'dislikes', 1);

                return `${voteType === 'like' ? 'Лайк' : 'Дизлайк'} успешно удален`;
            } else {
                await db(`${table}comment_votes_reply`)
                    .where({ user_id: userId, comment_id: commentId })
                    .update({ vote_type: voteType });

                await db(`${table}comment_replies`)
                    .where('id', commentId)
                    .increment(voteType === 'like' ? 'likes' : 'dislikes', 1)
                    .decrement(voteType === 'like' ? 'dislikes' : 'likes', 1);

                return `${voteType === 'like' ? 'Дизлайк' : 'Лайк'} успешно изменен`;
            }
        }

        await db(`${table}comment_votes_reply`).insert({
            user_id: userId,
            comment_id: commentId,
            vote_type: voteType,
        });

        await db(`${table}comment_replies`).where('id', commentId).increment(voteType === 'like' ? 'likes' : 'dislikes', 1);

        return `${voteType === 'like' ? 'Лайк' : 'Дизлайк'} успешно добавлен`;
    } catch (error) {
        throw error;
    }
};

const delComment = async (commentId, type) => {
    try {
        const table = type === 'movie' ? 'movie' : 'series';

        await db(`${table}comment_votes_reply`)
            .whereIn('comment_id', function() {
                this.select('id').from(`${table}comment_replies`).where('comment_id', commentId);
            })
            .del();

        await db(`${table}comment_complaints_reply`)
        .whereIn('comment_id', function() {
            this.select('id').from(`${table}comment_replies`).where('comment_id', commentId);
        })
        .del();

        await db(`${table}comment_replies`).where('comment_id', commentId).del();

        await db(`${table}comment_complaints`).where('comment_id', commentId).del();
        await db(`${table}comment_votes`).where('comment_id', commentId).del();

        const deletedCount = await db(`${table}comments`).where('id', commentId).del();
        if (deletedCount === 0) throw new NotFoundError('Комментарий не найден');

        return 'Комментарий успешно удален';
    } catch (error) {
        throw error;
    }
};

const delCommentReply = async (commentId, type) => {
    try {
        const table = type === 'movie' ? 'movie' : 'series';
        await db(`${table}comment_complaints_reply`).where('comment_id', commentId).del();
        await db(`${table}comment_votes_reply`).where('comment_id', commentId).del();
        const deletedCount = await db(`${table}comment_replies`).where('id', commentId).del();
        if (deletedCount === 0) throw new NotFoundError('Комментарий не найден');
        return 'Комментарий успешно удален';
    } catch (error) {
        throw error;
    }
};

const addComplaint = async (userId, commentId, contentTitle, complaintText, type) => {
    try {
        const table = type === 'movie' ? 'movie' : 'series';
        const content = await getMediaByTitle(table, contentTitle);
        await db(`${table}comment_complaints`).insert({ user_id: userId, comment_id: commentId, [`${table}_id`]: content.id, text: complaintText });
        return 'Жалоба на комментарий успешно отправлена';
    } catch (error) {
        throw error;
    }
};

const addComplaintReply = async (userId, commentId, contentTitle, complaintText, type) => {
    try {
        const table = type === 'movie' ? 'movie' : 'series';
        const content = await getMediaByTitle(table, contentTitle);
        await db(`${table}comment_complaints_reply`).insert({ user_id: userId, comment_id: commentId, [`${table}_id`]: content.id, text: complaintText });
        return 'Жалоба на комментарий успешно отправлена';
    } catch (error) {
        throw error;
    }
};

module.exports = {
    addMovieComment: (movieId, userId, text) => addComment('movie', movieId, userId, text),
    addMovieCommentReply: (commentId, userId, text) => addCommentReply('movie', commentId, userId, text),
    getMovieComment: (movieId) => getComments('movie', movieId),
    
    addMovieLike: (commentId, userId) => addVote('movie', commentId, userId, 'like'),
    addMovieDislike: (commentId, userId) => addVote('movie', commentId, userId, 'dislike'),
    addMovieLikeReply: (commentId, userId) => addVoteReply('movie', commentId, userId, 'like'),
    addMovieDislikeReply: (commentId, userId) => addVoteReply('movie', commentId, userId, 'dislike'),

    addSeriesComment: (seriesId, userId, text) => addComment('series', seriesId, userId, text),
    addSeriesCommentReply: (commentId, userId, text) => addCommentReply('series', commentId, userId, text),
    getSeriesComment: (seriesId) => getComments('series', seriesId),

    addSeriesLike: (commentId, userId) => addVote('series', commentId, userId, 'like'),
    addSeriesDislike: (commentId, userId) => addVote('series', commentId, userId, 'dislike'),
    addSeriesLikeReply: (commentId, userId) => addVoteReply('series', commentId, userId, 'like'),
    addSeriesDislikeReply: (commentId, userId) => addVoteReply('series', commentId, userId, 'dislike'),


    delComment,
    delCommentReply,
    addComplaint,
    addComplaintReply,
};