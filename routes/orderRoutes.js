const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.post('/create', authenticateToken, orderController.createOrder);
router.get('/my-orders', authenticateToken, orderController.getUserOrders);
router.get('/admin/all-orders', authenticateToken, requireAdmin, orderController.getAllOrders);
router.put('/admin/status/:id', authenticateToken, requireAdmin, orderController.updateOrderStatus);
router.get('/download-pdf/:id', authenticateToken, orderController.downloadQuotationPDF);
router.get('/download-excel/:id', authenticateToken, orderController.downloadQuotationExcel);

module.exports = router;
