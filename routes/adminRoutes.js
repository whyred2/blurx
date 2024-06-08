const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController.js');
const { authenticateToken } = require('../middleware/authenticateToken.js');

router.get('/admin-chat', adminController.getChatMessages);
router.delete('/admin-chat/delete', adminController.deleteChatMessages);

router.post('/send-message-chat', authenticateToken, adminController.sendMessageToChat);

router.get('/stats', adminController.getAdminStats);
router.get('/content/stats', adminController.getContentStats);
router.get('/users/stats', adminController.getUsersStats);

router.get('/content', adminController.getContent);
router.put('/content/update', adminController.updateContent);
router.delete('/content/:id', adminController.deleteContent);

router.delete('/comment/complaints/:complaintId', authenticateToken, adminController.deleteComplaint);
router.delete('/comment/:commentId', authenticateToken, adminController.deleteComment);

module.exports = router;