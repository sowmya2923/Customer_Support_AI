const Ticket = require('../models/Ticket');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { uploadToCloudinary } = require('../utils/cloudinaryHelper');
const { analyzeTicket } = require('../utils/aiHelper');
const { isDbConnected, demoTickets, createDemoTicket, updateDemoTicket, rateDemoTicket } = require('../utils/demoData');

const analyzeFeedbackSentiment = (rating, feedback = '') => {
  const text = String(feedback || '').toLowerCase();
  if (Number(rating) >= 4 && !text.includes('bad') && !text.includes('slow') && !text.includes('poor')) return 'positive';
  if (text.includes('bad') || text.includes('slow') || text.includes('poor') || text.includes('not solved') || Number(rating) <= 2) return 'frustrated';
  return 'neutral';
};

/**
 * @desc    Create a new support ticket (with complete AI categorization, routing & auditing)
 * @route   POST /api/tickets
 * @access  Private
 */
const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please add a title and description' });
    }

    if (!isDbConnected()) {
      const ticket = createDemoTicket({ title, description, user: req.user });
      return res.status(201).json({ success: true, message: 'Demo ticket created while MongoDB is offline', ticket });
    }

    // Handle attachments
    let attachments = [];
    if (req.file) {
      const uploadUrl = await uploadToCloudinary(req.file.path);
      attachments.push(uploadUrl);
    }

    // Call advanced AI analysis to get full parameters (Category, Priority, Sentiment, Department, and 3 suggested drafts)
    const aiPrediction = await analyzeTicket(title, description, [], req.user.tier || 'free');

    // Create ticket
    const ticket = await Ticket.create({
      title,
      description,
      customer: req.user.id,
      customerTier: req.user.tier || 'free',
      category: aiPrediction.category,
      priority: aiPrediction.priority,
      sentiment: aiPrediction.sentiment,
      department: aiPrediction.department,
      status: 'ai-reviewed', // Initial auto-reviewed status
      attachments,
      aiSuggestedDrafts: aiPrediction.drafts, // Store the three AI drafts
    });

    // Create Initial Audit Log entry
    await AuditLog.create({
      ticket: ticket._id,
      user: req.user.id,
      action: 'ticket_created',
      details: `Ticket submitted. AI auto-analyzed: category=${aiPrediction.category}, priority=${aiPrediction.priority}, sentiment=${aiPrediction.sentiment}, department=${aiPrediction.department}.`,
    });

    return res.status(201).json({
      success: true,
      message: 'Ticket created and analyzed by AI successfully',
      ticket,
    });
  } catch (error) {
    console.error('Create Ticket Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get all tickets with filters (enforces ACL: customers see their own, agents/admins see all)
 * @route   GET /api/tickets
 * @access  Private
 */
const getTickets = async (req, res) => {
  try {
    if (!isDbConnected()) {
      let tickets = demoTickets();
      if (req.user.role === 'customer') tickets = tickets.filter((ticket) => ticket.customer?._id === req.user.id);
      ['status', 'priority', 'department', 'category'].forEach((key) => {
        if (req.query[key]) tickets = tickets.filter((ticket) => ticket[key] === req.query[key]);
      });
      return res.json({ success: true, count: tickets.length, tickets });
    }

    let query = {};

    // Customer security filter
    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    }

    // Metadata filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    if (req.query.department) {
      query.department = req.query.department;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    const tickets = await Ticket.find(query)
      .populate('customer', 'name email')
      .populate('assignedAgent', 'name email')
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    console.error('Get Tickets Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get a single ticket + populated details
 * @route   GET /api/tickets/:id
 * @access  Private
 */
const getTicketById = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const ticket = demoTickets().find((item) => item._id === req.params.id);
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
      if (req.user.role === 'customer' && ticket.customer?._id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
      }
      return res.json({ success: true, ticket, auditLogs: [] });
    }

    const ticket = await Ticket.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('assignedAgent', 'name email');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Customer security filter
    if (req.user.role === 'customer' && ticket.customer._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }

    // Fetch audit logs for this ticket to build timeline
    const auditLogs = await AuditLog.find({ ticket: req.params.id })
      .populate('user', 'name role')
      .sort({ createdAt: 1 });

    return res.json({ success: true, ticket, auditLogs });
  } catch (error) {
    console.error('Get Ticket ID Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update ticket attributes & record audit log trails (Agent/Admin only)
 * @route   PUT /api/tickets/:id
 * @access  Private (Agent/Admin only)
 */
const updateTicket = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const ticket = updateDemoTicket(req.params.id, req.body);
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
      return res.json({ success: true, message: 'Demo ticket attributes updated while MongoDB is offline', ticket });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const { status, priority, category, department, assignedAgentId } = req.body;
    let auditDetails = [];

    // Track status change
    if (status && status !== ticket.status) {
      auditDetails.push(`status changed from '${ticket.status}' to '${status}'`);
      ticket.status = status;
      if (status === 'resolved') {
        ticket.resolvedAt = Date.now();
      }
    }

    // Track priority change
    if (priority && priority !== ticket.priority) {
      auditDetails.push(`priority updated from '${ticket.priority}' to '${priority}'`);
      ticket.priority = priority;
    }

    // Track category change
    if (category && category !== ticket.category) {
      auditDetails.push(`category updated from '${ticket.category}' to '${category}'`);
      ticket.category = category;
    }

    // Track department re-routing
    if (department && department !== ticket.department) {
      auditDetails.push(`transferred from department '${ticket.department}' to '${department}'`);
      ticket.department = department;
    }

    // Track agent assignment change
    if (assignedAgentId !== undefined) {
      if (assignedAgentId === null) {
        if (ticket.assignedAgent) {
          auditDetails.push('unassigned agent from ticket');
          ticket.assignedAgent = null;
        }
      } else {
        const agent = await User.findById(assignedAgentId);
        if (!agent || !['agent', 'admin'].includes(agent.role)) {
          return res.status(400).json({ success: false, message: 'Invalid agent ID assigned' });
        }
        if (!ticket.assignedAgent || ticket.assignedAgent.toString() !== assignedAgentId) {
          auditDetails.push(`assigned ticket to agent '${agent.name}'`);
          ticket.assignedAgent = assignedAgentId;
          // Auto move status to assigned if still in open/ai-reviewed
          if (['open', 'ai-reviewed'].includes(ticket.status)) {
            ticket.status = 'assigned';
            auditDetails.push("status automatically moved to 'assigned'");
          }
        }
      }
    }

    // Save ticket if there were edits
    if (auditDetails.length > 0) {
      await ticket.save();

      // Create Audit Log record for all changes
      await AuditLog.create({
        ticket: ticket._id,
        user: req.user.id,
        action: 'ticket_updated',
        details: `Updated attributes: ${auditDetails.join(', ')}.`,
      });
    }

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('customer', 'name email')
      .populate('assignedAgent', 'name email');

    return res.json({
      success: true,
      message: 'Ticket attributes updated successfully',
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('Update Ticket Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Submit CSAT rating and review comment for a resolved ticket
 * @route   POST /api/tickets/:id/rate
 * @access  Private (Customer/Owner only)
 */
const rateTicketCSAT = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Please provide a valid rating score between 1 and 5' });
    }

    if (!isDbConnected()) {
      const original = demoTickets().find((item) => item._id === req.params.id);
      if (!original) return res.status(404).json({ success: false, message: 'Ticket not found' });
      if (original.customer?._id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to rate this ticket' });
      }
      if (original.status !== 'resolved' && original.status !== 'closed') {
        return res.status(400).json({ success: false, message: 'Only resolved or closed tickets can be rated' });
      }
      const ticket = rateDemoTicket(req.params.id, rating, feedback);
      return res.status(200).json({ success: true, message: 'Thank you for your feedback! Rating submitted successfully.', ticket });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Ensure customer owns the ticket
    if (ticket.customer.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to rate this ticket' });
    }

    // Ensure ticket is resolved/closed
    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      return res.status(400).json({ success: false, message: 'Only resolved or closed tickets can be rated' });
    }

    ticket.csatRating = rating;
    ticket.csatFeedback = feedback || null;
    ticket.csatFeedbackSentiment = analyzeFeedbackSentiment(rating, feedback);
    await ticket.save();

    // Create Audit Log
    await AuditLog.create({
      ticket: ticket._id,
      user: req.user.id,
      action: 'rated_csat',
      details: `Customer submitted CSAT score: ${rating}/5 stars. Feedback: "${feedback || 'None'}"`,
    });

    return res.status(200).json({
      success: true,
      message: 'Thank you for your feedback! Rating submitted successfully.',
      ticket,
    });
  } catch (error) {
    console.error('Rate CSAT Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  rateTicketCSAT,
};

