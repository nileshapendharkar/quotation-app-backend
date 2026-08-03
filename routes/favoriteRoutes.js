const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, favoriteController.getFavorites);
router.post('/toggle', authenticateToken, favoriteController.toggleFavorite);

module.exports = router;
