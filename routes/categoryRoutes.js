const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', categoryController.getAllCategories);
router.post('/', authenticateToken, requireAdmin, categoryController.addCategory);
router.put('/:id', authenticateToken, requireAdmin, categoryController.updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, categoryController.deleteCategory);

module.exports = router;
