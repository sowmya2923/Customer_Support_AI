const express = require('express');
const router = express.Router();
const { getMessages, createMessage } = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/ticket/:ticketId', protect, getMessages);
router.post('/', protect, upload.single('file'), createMessage);

module.exports = router;
