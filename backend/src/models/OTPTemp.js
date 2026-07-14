const mongoose = require('mongoose');

const otpTempSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // MongoDB TTL index: automatically deletes document 5 minutes (300 seconds) after creation
    },
  }
);

module.exports = mongoose.model('OTPTemp', otpTempSchema);
