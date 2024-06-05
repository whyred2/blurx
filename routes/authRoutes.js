const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const multer = require('multer');
const { authenticateToken } = require('../middleware/authenticateToken.js');

const upload = multer({
  storage: multer.memoryStorage() 
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/all-users', authController.getAllUsers);

router.get('/profile', authenticateToken, authController.getUser);
router.patch('/profile/update-username', authenticateToken, authController.updateUsername);

router.get('/user/:id', authController.getUserById);
router.delete('/user/:id', authController.deleteUserById);

router.patch('/user/:id/update-username', authController.updateUsername);
router.patch('/user/:id/update-email', authController.updateEmail);
router.patch('/user/:id/update-password', authController.updatePassword);
router.patch('/user/:id/update-role', authController.updateRole);

router.post('/change-image', upload.single('avatar'), authenticateToken, authController.changeImage);
router.patch('/save-user-image', authController.saveImage);

router.delete('/delete-user-image', authenticateToken, authController.deleteUserImage);

module.exports = router;