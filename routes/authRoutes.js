const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/send-otp', authController.sendOtp);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/change-password', authenticateToken, authController.changePassword);
router.delete('/delete-account', authenticateToken, authController.deleteAccount);

module.exports = router;
