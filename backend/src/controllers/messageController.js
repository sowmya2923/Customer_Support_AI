const Message = require('../models/Message');
const Ticket = require('../models/Ticket');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');
const { isDbConnected, demoTickets, demoMessages, createDemoMessage } = require('../utils/demoData');

/**
 * @desc    Get all messages for a ticket (filters private notes for customers)
 * @route   GET /api/messages/ticket/:ticketId
 * @access  Private
 */
const getMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;

    if (!isDbConnected()) {
      const ticket = demoTickets().find((item) => item._id === ticketId);
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
      if (req.user.role === 'customer' && ticket.customer?._id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to view messages on this ticket' });
      }
      const messages = demoMessages().filter((message) => message.ticket === ticketId && (req.user.role !== 'customer' || !message.isInternal));
      return res.json({ success: true, count: messages.length, messages });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Authorization: customer can only view their own ticket's messages
    if (req.user.role === 'customer' && ticket.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view messages on this ticket' });
    }

    // Build message query
    const messageQuery = { ticket: ticketId };

    // Hide internal agent notes from customer role
    if (req.user.role === 'customer') {
      messageQuery.isInternal = false;
    }

    const messages = await Message.find(messageQuery)
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 }); // Sort chronologically

    return res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error('Get Messages Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Add a message/response to a ticket (supports attachments & internal notes)
 * @route   POST /api/messages
 * @access  Private
 */
const createMessage = async (req, res) => {
  try {
    const { ticketId, message, isInternal } = req.body;

    if (!ticketId || !message) {
      return res.status(400).json({ success: false, message: 'Please provide ticketId and message content' });
    }

    if (!isDbConnected()) {
      const ticket = demoTickets().find((item) => item._id === ticketId);
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
      if (req.user.role === 'customer') {
        if (ticket.customer?._id !== req.user.id) {
          return res.status(403).json({ success: false, message: 'Not authorized to message this ticket' });
        }
        if (isInternal === 'true' || isInternal === true) {
          return res.status(403).json({ success: false, message: 'Customers cannot write internal notes' });
        }
      }
      const data = createDemoMessage({ ticketId, message, user: req.user, isInternal });
      return res.status(201).json({ success: true, message: 'Demo message sent while MongoDB is offline', data });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Authorization: customer can only message their own ticket
    if (req.user.role === 'customer') {
      if (ticket.customer.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to message this ticket' });
      }
      if (isInternal === 'true' || isInternal === true) {
        return res.status(403).json({ success: false, message: 'Customers cannot write internal notes' });
      }
    }

    // Process file attachment
    let attachments = [];
    if (req.file) {
      const uploadUrl = await uploadToCloudinary(req.file.path);
      attachments.push(uploadUrl);
    }

    const messageDoc = await Message.create({
      ticket: ticketId,
      sender: req.user.id,
      message,
      isInternal: req.user.role !== 'customer' ? (isInternal === 'true' || isInternal === true) : false,
      attachments,
    });

    // Populate sender details for immediate frontend UI insertion
    const populatedMessage = await Message.findById(messageDoc._id).populate('sender', 'name email role');

    // Update ticket's updatedAt timestamp to reflect new activity
    ticket.updatedAt = Date.now();

    // Auto move ticket from 'open' to 'in-progress' if agent replies
    if (req.user.role !== 'customer' && ticket.status === 'open' && !isInternal) {
      ticket.status = 'in-progress';
    }

    await ticket.save();

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: populatedMessage,
    });
  } catch (error) {
    console.error('Create Message Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMessages,
  createMessage,
};
