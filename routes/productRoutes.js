const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', productController.getAllProducts);
router.post('/import-excel', authenticateToken, requireAdmin, productController.importExcelProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticateToken, requireAdmin, productController.addProduct);
router.put('/:id', authenticateToken, requireAdmin, productController.updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, productController.deleteProduct);

module.exports = router;
