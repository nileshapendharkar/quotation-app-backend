const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', subCategoryController.getAllSubCategories);
router.post('/', authenticateToken, requireAdmin, subCategoryController.addSubCategory);
router.put('/:id', authenticateToken, requireAdmin, subCategoryController.updateSubCategory);
router.delete('/:id', authenticateToken, requireAdmin, subCategoryController.deleteSubCategory);

module.exports = router;
