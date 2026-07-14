const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  rateTicketCSAT,
} = require('../controllers/ticketController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.post('/', protect, upload.single('file'), createTicket);
router.get('/', protect, getTickets);
router.get('/:id', protect, getTicketById);
router.put('/:id', protect, authorize('agent', 'admin'), updateTicket);
router.post('/:id/rate', protect, rateTicketCSAT); // Customer rates ticket CSAT

module.exports = router;
