const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const KBArticle = require('../models/KBArticle');
const Message = require('../models/Message');
const AuditLog = require('../models/AuditLog');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_customer_support';
    await mongoose.connect(uri);
    console.log('Seed connection established.');
  } catch (error) {
    console.error('Seed DB Connection Error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('Cleaning old database records...');
    await User.deleteMany({});
    await Ticket.deleteMany({});
    await KBArticle.deleteMany({});
    await Message.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Seeding fresh enterprise records...');

    // 1. Create Core Users
    const customer = await User.create({
      name: 'Arjun Customer',
      email: 'customer@example.com',
      password: 'password123',
      role: 'customer',
    });

    const agent = await User.create({
      name: 'Jane Support Agent',
      email: 'agent@example.com',
      password: 'password123',
      role: 'agent',
    });

    const admin = await User.create({
      name: 'Super Admin Manager',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    console.log('Users seeded: Customer, Agent, Admin.');

    // 2. Seed FAQ Help Articles
    await KBArticle.create({
      title: 'How to request a billing invoice or subscription refund',
      content: `Our refund policy allows you to request a full refund within 14 days of purchase.
      1. Go to Settings > Billing History.
      2. Click on the invoice transaction.
      3. Select "Request Refund". Refunds are credited back to your bank account within 5-10 business days.`,
      category: 'billing',
      tags: ['refund', 'billing', 'invoice'],
      createdBy: admin._id,
    });

    await KBArticle.create({
      title: 'Integrating the Support Desk REST API into website',
      content: `Integrate ticket workflows using our Developer API keys:
      1. Navigate to Settings > Developer Keys.
      2. Click "Generate secret API Token".
      3. Add header: "Authorization: Bearer <API_KEY>" and send POST payloads.`,
      category: 'technical',
      tags: ['setup', 'api', 'integration'],
      createdBy: admin._id,
    });

    console.log('Knowledge Base FAQs seeded.');

    // 3. Seed Support Tickets with different departments, sentiments, and CSATs
    
    // Ticket 1: Angry Billing Ticket (resolved & rated CSAT)
    const t1 = await Ticket.create({
      title: 'Charged twice on my credit card invoice',
      description: 'URGENT! I was billed $29.00 twice on my credit card yesterday for a single Pro plan subscription. Please refund the double charge immediately!',
      status: 'resolved',
      priority: 'high',
      category: 'billing',
      department: 'finance',
      sentiment: 'angry',
      customer: customer._id,
      assignedAgent: agent._id,
      csatRating: 5,
      csatFeedback: 'Agent refunded the double charge within an hour. Excellent response!',
      resolvedAt: new Date(Date.now() - 3600000 * 2), // Resolved 2 hours ago
      createdAt: new Date(Date.now() - 3600000 * 4), // Created 4 hours ago
    });

    // Create Audit logs for Ticket 1
    await AuditLog.create({
      ticket: t1._id,
      user: customer._id,
      action: 'ticket_created',
      details: 'Ticket submitted. AI auto-analyzed: category=billing, priority=high, sentiment=angry, department=finance.',
      createdAt: t1.createdAt
    });
    await AuditLog.create({
      ticket: t1._id,
      user: agent._id,
      action: 'ticket_updated',
      details: "Updated attributes: status changed from 'open' to 'resolved', assigned ticket to agent 'Jane Support Agent'.",
      createdAt: t1.resolvedAt
    });
    await AuditLog.create({
      ticket: t1._id,
      user: customer._id,
      action: 'rated_csat',
      details: 'Customer submitted CSAT score: 5/5 stars. Feedback: "Agent refunded the double charge within an hour. Excellent response!"',
      createdAt: new Date(Date.now() - 3600000)
    });

    // Ticket 2: Frustrated Technical Ticket (In-Progress)
    const t2 = await Ticket.create({
      title: 'Database connection fails with timeout during API post',
      description: 'I keep getting ECONNREFUSED when trying to hit the ticket registration API. Please check if the port gateway is open.',
      status: 'in-progress',
      priority: 'critical',
      category: 'technical',
      department: 'engineering',
      sentiment: 'frustrated',
      customer: customer._id,
      assignedAgent: agent._id,
      aiSuggestedDrafts: {
        direct: "Hello, we are investigating the database port gateway.",
        empathetic: "Hello, we sincerely apologize for the connection block. I have escalated this as a critical priority to engineering.",
        technical: "Hello, please verify your firewall settings and try curling the endpoint using port 5000."
      },
      createdAt: new Date(Date.now() - 3600000 * 6), // Created 6 hours ago
    });

    await AuditLog.create({
      ticket: t2._id,
      user: customer._id,
      action: 'ticket_created',
      details: 'Ticket submitted. AI auto-analyzed: category=technical, priority=critical, sentiment=frustrated, department=engineering.',
      createdAt: t2.createdAt
    });
    await AuditLog.create({
      ticket: t2._id,
      user: agent._id,
      action: 'ticket_updated',
      details: "Updated attributes: status changed from 'open' to 'in-progress', assigned ticket to agent 'Jane Support Agent'.",
      createdAt: new Date(Date.now() - 3600000 * 5)
    });

    // Ticket 3: Neutral Feature Request (Open)
    const t3 = await Ticket.create({
      title: 'Add custom emoji themes in chat boxes',
      description: 'It would be nice to have customizable emoji shortcuts in the chat interface.',
      status: 'open',
      priority: 'low',
      category: 'feature_request',
      department: 'product',
      sentiment: 'neutral',
      customer: customer._id,
      createdAt: new Date(Date.now() - 3600000 * 12),
    });

    await AuditLog.create({
      ticket: t3._id,
      user: customer._id,
      action: 'ticket_created',
      details: 'Ticket submitted. AI auto-analyzed: category=feature_request, priority=low, sentiment=neutral, department=product.',
      createdAt: t3.createdAt
    });

    // 4. Seed Messages thread for Ticket 2
    await Message.create({
      ticket: t2._id,
      sender: customer._id,
      message: 'I checked my curl logs, it returns ECONNREFUSED 127.0.0.1:5000',
    });

    await Message.create({
      ticket: t2._id,
      sender: agent._id,
      message: 'Can you confirm if your backend environment service is running locally on port 5000?',
    });

    await Message.create({
      ticket: t2._id,
      sender: agent._id,
      message: 'System note: Checked client logs. They are posting to local loopback instead of cluster.',
      isInternal: true, // Agent note
    });

    console.log('Tickets, Messages and Audit logs seeded successfully!');
    console.log('Seeding process completed. You can now login.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

connectDB().then(seedData);
