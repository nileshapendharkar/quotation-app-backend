const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', authenticateToken, requireAdmin, adminController.getDashboardStats);
router.get('/users', authenticateToken, requireAdmin, adminController.getUsers);
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', authenticateToken, requireAdmin, adminController.sendNotification);

module.exports = router;
