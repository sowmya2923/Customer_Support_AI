const express = require('express');
const router = express.Router();
const { 
  sendRegisterOTP,
  verifyRegisterOTPAndCreateUser,
  sendForgotPasswordOTP,
  resetPasswordWithOTP,
  authUser, 
  getMe 
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// OTP Registration flows
router.post('/register/send-otp', sendRegisterOTP);
router.post('/register/verify-otp', verifyRegisterOTPAndCreateUser);

// OTP Forgot Password reset flows
router.post('/forgot-password/send-otp', sendForgotPasswordOTP);
router.post('/forgot-password/reset', resetPasswordWithOTP);

// Standard auth routes
router.post('/login', authUser);
router.get('/me', protect, getMe);

module.exports = router;
