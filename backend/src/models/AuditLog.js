const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Actor (agent, admin, or customer)
    },
    action: {
      type: String,
      required: true, // e.g. 'created', 'assigned', 'status_changed', 'department_transferred', 'rated_csat'
    },
    details: {
      type: String,
      required: true, // Human readable log text (e.g. "Changed status from open to in-progress")
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // timestamps not needed since we have custom createdAt
  }
);

// Index to retrieve a ticket's audit logs chronologically
auditLogSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
