const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a ticket title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a ticket description'],
    },
    status: {
      type: String,
      enum: ['open', 'ai-reviewed', 'assigned', 'in-progress', 'waiting-for-customer', 'resolved', 'closed'],
      default: 'open',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    category: {
      type: String,
      default: 'general', // e.g. technical, billing, account, product_inquiry, feature_request, bug, complaint, general
    },
    department: {
      type: String,
      enum: ['finance', 'engineering', 'qa', 'product', 'support'],
      default: 'support',
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'frustrated', 'angry'],
      default: 'neutral',
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerTier: {
      type: String,
      enum: ['free', 'membership', 'premium'],
      default: 'free',
    },
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    attachments: [
      {
        type: String, // URLs to files
      },
    ],
    // Cache multiple AI generated reply suggestions
    aiSuggestedDrafts: {
      direct: { type: String, default: '' },
      empathetic: { type: String, default: '' },
      technical: { type: String, default: '' },
    },
    // CSAT ratings (collected on resolution)
    csatRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    csatFeedback: {
      type: String,
      default: null,
    },
    csatFeedbackSentiment: {
      type: String,
      enum: ['positive', 'neutral', 'frustrated'],
      default: 'neutral',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast querying
ticketSchema.index({ customer: 1, status: 1 });
ticketSchema.index({ assignedAgent: 1, status: 1 });
ticketSchema.index({ department: 1, status: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);

