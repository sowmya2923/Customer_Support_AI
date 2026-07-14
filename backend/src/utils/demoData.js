const mongoose = require('mongoose');

const isDbConnected = () => mongoose.connection.readyState === 1;

const demoUsers = [
  { _id: 'demo-customer', id: 'demo-customer', name: 'Arjun Customer', email: 'customer@example.com', password: 'password123', role: 'customer', tier: 'premium' },
  { _id: 'demo-agent', id: 'demo-agent', name: 'Jane Support Agent', email: 'agent@example.com', password: 'password123', role: 'agent', tier: 'free' },
  { _id: 'demo-admin', id: 'demo-admin', name: 'Super Admin Manager', email: 'admin@example.com', password: 'password123', role: 'admin', tier: 'free' },
];

const userPublic = (user) => ({ _id: user._id, id: user._id, name: user.name, email: user.email, role: user.role, tier: user.tier || 'free' });
const now = Date.now();

let demoTickets = [
  {
    _id: 'demo-ticket-1',
    title: 'Charged twice on my credit card invoice',
    description: 'URGENT! I was billed $29.00 twice yesterday for a single Pro plan subscription. Please refund the duplicate charge.',
    status: 'resolved', priority: 'high', category: 'billing', department: 'finance', sentiment: 'angry', customerTier: 'premium',
    customer: userPublic(demoUsers[0]), assignedAgent: userPublic(demoUsers[1]), csatRating: 5,
    csatFeedback: 'Agent refunded the double charge within an hour. Excellent response!', attachments: [], aiSuggestedDrafts: {},
    resolvedAt: new Date(now - 2 * 60 * 60 * 1000), createdAt: new Date(now - 4 * 60 * 60 * 1000), updatedAt: new Date(now - 60 * 60 * 1000),
  },
  {
    _id: 'demo-ticket-2',
    title: 'Database connection fails with timeout during API post',
    description: 'I keep getting ECONNREFUSED when trying to hit the ticket registration API. Please check if the port gateway is open.',
    status: 'in-progress', priority: 'critical', category: 'technical', department: 'engineering', sentiment: 'frustrated', customerTier: 'premium',
    customer: userPublic(demoUsers[0]), assignedAgent: userPublic(demoUsers[1]), attachments: [],
    aiSuggestedDrafts: {
      direct: 'Hello, we are investigating the database port gateway.',
      empathetic: 'Hello, we sincerely apologize for the connection block. I have escalated this to engineering.',
      technical: 'Hello, please verify your firewall settings and try curling the endpoint using port 5001.',
    },
    createdAt: new Date(now - 6 * 60 * 60 * 1000), updatedAt: new Date(now - 5 * 60 * 60 * 1000),
  },
  {
    _id: 'demo-ticket-3',
    title: 'Add custom theme options in chat boxes',
    description: 'It would be nice to have customizable shortcuts and visual themes in the chat interface.',
    status: 'open', priority: 'low', category: 'feature_request', department: 'product', sentiment: 'neutral', customerTier: 'free',
    customer: userPublic(demoUsers[0]), assignedAgent: null, attachments: [], aiSuggestedDrafts: {},
    createdAt: new Date(now - 12 * 60 * 60 * 1000), updatedAt: new Date(now - 12 * 60 * 60 * 1000),
  },
];

let demoMessages = [
  { _id: 'demo-msg-1', ticket: 'demo-ticket-2', sender: userPublic(demoUsers[0]), message: 'I checked my curl logs, it returns ECONNREFUSED 127.0.0.1:5000', isInternal: false, attachments: [], createdAt: new Date(now - 5.5 * 60 * 60 * 1000) },
  { _id: 'demo-msg-2', ticket: 'demo-ticket-2', sender: userPublic(demoUsers[1]), message: 'Can you confirm whether your backend service is running locally on port 5001?', isInternal: false, attachments: [], createdAt: new Date(now - 5 * 60 * 60 * 1000) },
];

const demoArticles = [
  { _id: 'demo-kb-1', title: 'How to request a billing invoice or subscription refund', content: 'Refund requests can be raised within 14 days of a billing error. Agents should verify the transaction, confirm the invoice, and resolve or refund the subscription.', category: 'billing', tags: ['refund', 'billing', 'invoice'], createdBy: userPublic(demoUsers[2]), createdAt: new Date(now - 24 * 60 * 60 * 1000) },
  { _id: 'demo-kb-2', title: 'Integrating the Support Desk REST API into a website', content: 'Generate API credentials, pass Authorization: Bearer <token>, and post ticket payloads to the configured backend API.', category: 'technical', tags: ['setup', 'api', 'integration'], createdBy: userPublic(demoUsers[2]), createdAt: new Date(now - 18 * 60 * 60 * 1000) },
];

const getDemoUserByEmail = (email) => demoUsers.find((user) => user.email === email?.trim().toLowerCase());
const getDemoUserById = (id) => demoUsers.find((user) => user._id === id);

const createDemoTicket = ({ title, description, user }) => {
  const lowered = `${title} ${description}`.toLowerCase();
  
  // Predict sentiment
  let sentiment = 'neutral';
  if (lowered.includes('happy') || lowered.includes('great') || lowered.includes('thanks')) {
    sentiment = 'positive';
  } else if (lowered.includes('angry') || lowered.includes('worst') || lowered.includes('scam') || lowered.includes('charge')) {
    sentiment = 'angry';
  } else if (lowered.includes('delay') || lowered.includes('slow') || lowered.includes('crashed') || lowered.includes('broken')) {
    sentiment = 'frustrated';
  }

  // Predict priority and escalate based on tier
  const isUrgent = lowered.includes('urgent') || lowered.includes('immediate') || lowered.includes('critical') || lowered.includes('down');
  let priority = 'medium';
  if (isUrgent) {
    priority = 'high';
  }

  const clientTier = user.tier || 'free';
  if (clientTier === 'premium') {
    priority = sentiment === 'angry' || sentiment === 'frustrated' || isUrgent ? 'critical' : 'high';
  } else if (clientTier === 'membership') {
    priority = sentiment === 'angry' || sentiment === 'frustrated' || isUrgent ? 'high' : 'medium';
  } else {
    if (sentiment === 'angry' || isUrgent) priority = 'high';
  }

  const ticket = {
    _id: `demo-ticket-${Date.now()}`,
    title,
    description,
    status: 'ai-reviewed',
    priority,
    category: lowered.includes('billing') || lowered.includes('pay') ? 'billing' : 'technical',
    department: lowered.includes('billing') || lowered.includes('pay') ? 'finance' : 'engineering',
    sentiment,
    customerTier: clientTier,
    customer: userPublic(user),
    assignedAgent: null,
    attachments: [],
    aiSuggestedDrafts: {
      direct: `Thanks for reporting this. Since you are a valued ${clientTier.toUpperCase()} member, we are reviewing your ticket with priority ${priority.toUpperCase()} and will update you shortly.`,
      empathetic: `Hello, we understand this is critical. I have routed your ticket to our technical leads for priority escalation. We appreciate your patience.`,
      technical: `Ticket ID details captured. Running tests on the server nodes for category ${lowered.includes('billing') ? 'FINANCE' : 'ENGINEERING'}.`,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  demoTickets = [ticket, ...demoTickets];
  return ticket;
};

const createDemoMessage = ({ ticketId, message, user, isInternal }) => {
  const data = { _id: `demo-msg-${Date.now()}`, ticket: ticketId, sender: userPublic(user), message, isInternal: user.role !== 'customer' && (isInternal === true || isInternal === 'true'), attachments: [], createdAt: new Date() };
  demoMessages.push(data);
  return data;
};

const updateDemoTicket = (id, updates) => {
  const ticket = demoTickets.find((item) => item._id === id);
  if (!ticket) return null;
  ['status', 'priority', 'category', 'department'].forEach((key) => {
    if (updates[key]) ticket[key] = updates[key];
  });
  if (updates.assignedAgentId !== undefined) {
    ticket.assignedAgent = updates.assignedAgentId ? userPublic(demoUsers.find((user) => user._id === updates.assignedAgentId) || demoUsers[1]) : null;
    if (ticket.assignedAgent && ['open', 'ai-reviewed'].includes(ticket.status)) ticket.status = 'assigned';
  }
  if (ticket.status === 'resolved' && !ticket.resolvedAt) ticket.resolvedAt = new Date();
  ticket.updatedAt = new Date();
  return ticket;
};

const rateDemoTicket = (id, rating, feedback) => {
  const ticket = demoTickets.find((item) => item._id === id);
  if (!ticket) return null;
  ticket.csatRating = rating;
  ticket.csatFeedback = feedback || null;
  ticket.updatedAt = new Date();
  return ticket;
};

module.exports = { isDbConnected, demoUsers, demoTickets: () => demoTickets, demoMessages: () => demoMessages, demoArticles, getDemoUserByEmail, getDemoUserById, userPublic, createDemoTicket, createDemoMessage, updateDemoTicket, rateDemoTicket };
