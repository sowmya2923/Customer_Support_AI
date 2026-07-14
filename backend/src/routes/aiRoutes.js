const express = require('express');
const router = express.Router();
const { getSuggestedReply } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

router.post('/suggest/:ticketId', protect, authorize('agent', 'admin'), getSuggestedReply);

module.exports = router;
