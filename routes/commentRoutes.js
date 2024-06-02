const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController.js');
const { authenticateToken } = require('../middleware/authenticateToken.js');

/* ФИЛЬМЫ */
router.get('/movie/:mediaId', commentsController.getComment);

router.post('/movie/:mediaId/add-comment', authenticateToken, commentsController.addComment);
router.post('/movie/:commentId/add-comment-reply', authenticateToken, commentsController.addCommentReply);

router.delete('/movie/:commentId/del-comment', authenticateToken, commentsController.delComment);
router.delete('/movie/:commentId/del-comment-reply', authenticateToken, commentsController.delCommentReply);

router.post('/movie/:commentId/like', authenticateToken, commentsController.likeComment);
router.post('/movie/:commentId/like-reply', authenticateToken, commentsController.likeCommentReply);
router.post('/movie/:commentId/dislike', authenticateToken, commentsController.dislikeComment);
router.post('/movie/:commentId/dislike-reply', authenticateToken, commentsController.dislikeCommentReply);

router.post('/movie/:commentId/complaint', authenticateToken, commentsController.addComplaint);
router.post('/movie/:commentId/complaint-reply', authenticateToken, commentsController.addComplaintReply);


/* СЕРИАЛЫ */
router.get('/series/:mediaId', commentsController.getComment);

router.post('/series/:mediaId/add-comment', authenticateToken, commentsController.addComment);
router.post('/series/:commentId/add-comment-reply', authenticateToken, commentsController.addCommentReply);

router.delete('/series/:commentId/del-comment', authenticateToken, commentsController.delComment);
router.delete('/series/:commentId/del-comment-reply', authenticateToken, commentsController.delCommentReply);

router.post('/series/:commentId/like', authenticateToken, commentsController.likeComment);
router.post('/series/:commentId/like-reply', authenticateToken, commentsController.likeCommentReply);
router.post('/series/:commentId/dislike', authenticateToken, commentsController.dislikeComment);
router.post('/series/:commentId/dislike-reply', authenticateToken, commentsController.dislikeCommentReply);

router.post('/series/:commentId/complaint', authenticateToken, commentsController.addComplaint);
router.post('/series/:commentId/complaint-reply', authenticateToken, commentsController.addComplaintReply);


router.get('/stats', commentsController.getStats);
router.get('/latest', commentsController.getLatestComments);
router.get('/complaints', commentsController.getCommentsComplaints);

module.exports = router;