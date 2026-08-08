const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', authenticateToken, requireAdmin, adminController.getDashboardStats);
router.get('/users', authenticateToken, requireAdmin, adminController.getUsers);
router.post('/users', authenticateToken, requireAdmin, adminController.createUser);
router.post('/users/upload-excel', authenticateToken, requireAdmin, adminController.uploadExcelUsers);
router.put('/users/:id', authenticateToken, requireAdmin, adminController.updateUser);
router.delete('/users/:id', authenticateToken, requireAdmin, adminController.deleteUser);
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', authenticateToken, requireAdmin, adminController.sendNotification);

module.exports = router;

