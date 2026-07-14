const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Please add a message content'],
    },
    isInternal: {
      type: Boolean,
      default: false, // true if it is a private note for support agents/admins, hidden from customer
    },
    attachments: [
      {
        type: String, // URLs to attachment uploads
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index to fetch message threads quickly in chronological order
messageSchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
