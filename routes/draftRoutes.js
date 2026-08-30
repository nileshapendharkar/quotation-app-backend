const express = require('express');
const router = express.Router();
const draftController = require('../controllers/draftController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/save', authenticateToken, draftController.saveDraft);
router.get('/my-drafts', authenticateToken, draftController.getMyDrafts);
router.get('/:id', authenticateToken, draftController.getDraftById);
router.delete('/:id', authenticateToken, draftController.deleteDraft);

module.exports = router;
