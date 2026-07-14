const express = require('express');
const router = express.Router();
const {
  createKBArticle,
  getKBArticles,
  getKBArticleById,
} = require('../controllers/kbController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/', protect, authorize('agent', 'admin'), createKBArticle);
router.get('/', protect, getKBArticles);
router.get('/:id', protect, getKBArticleById);

module.exports = router;
