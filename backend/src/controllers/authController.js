const User = require('../models/User');
const OTPTemp = require('../models/OTPTemp');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { isDbConnected, getDemoUserByEmail, getDemoUserById, userPublic } = require('../utils/demoData');
const sendEmail = require('../utils/sendEmail');

// Helper to sign JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey123', {
    expiresIn: '30d',
  });
};

// Helper to generate 6-digit numeric OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const saveOTP = (email, otp) => {
  return OTPTemp.replaceOne(
    { email },
    { email, otp, createdAt: new Date() },
    { upsert: true }
  );
};

const buildOtpText = ({ purpose, otp }) => {
  return `Your SupportDesk ${purpose} OTP is ${otp}. This code is valid for 5 minutes. Do not share this OTP with anyone.`;
};

const buildOtpEmailHtml = ({ title, intro, otp, note }) => `
  <div style="margin:0; padding:24px; background:#f4f7fb; font-family:Arial, Helvetica, sans-serif;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #dbe5ef; border-radius:14px; overflow:hidden;">
      <div style="background:#0f766e; padding:22px 24px; color:#ffffff;">
        <div style="font-size:12px; font-weight:700; letter-spacing:1.8px; text-transform:uppercase; opacity:.9;">SupportDesk.ai</div>
        <h1 style="margin:8px 0 0; font-size:22px; line-height:1.3;">${title}</h1>
      </div>
      <div style="padding:26px 24px 22px;">
        <p style="margin:0 0 14px; font-size:15px; line-height:1.6; color:#243044;">Hello,</p>
        <p style="margin:0; font-size:15px; line-height:1.6; color:#243044;">${intro}</p>
        <div style="margin:24px 0; padding:18px; text-align:center; background:#eef9f7; border:1px dashed #5bb8ad; border-radius:12px;">
          <div style="font-size:12px; font-weight:700; color:#0f766e; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:8px;">Your OTP Code</div>
          <div style="font-size:32px; font-weight:800; letter-spacing:7px; color:#14313d;">${otp}</div>
        </div>
        <p style="margin:0; font-size:13px; line-height:1.6; color:#526173;">${note}</p>
      </div>
      <div style="padding:18px 24px; background:#f8fafc; border-top:1px solid #e5edf5;">
        <p style="margin:0 0 6px; font-size:12px; color:#526173; line-height:1.5;">SupportDesk Support Team</p>
        <p style="margin:0; font-size:11px; color:#7a8797; line-height:1.5;">This is an automated security email. Please do not share this OTP with anyone. If this was not requested by you, ignore this message.</p>
      </div>
    </div>
  </div>
`;

/**
 * @desc    Send OTP to email for registration verification
 * @route   POST /api/auth/register/send-otp
 * @access  Public
 */
const sendRegisterOTP = async (req, res) => {
  try {
    const normalizedEmail = req.body.email?.trim().toLowerCase();
    const email = normalizedEmail;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    // Fallback if Database connection is offline
    if (!isDbConnected()) {
      console.log('\n==================================================================');
      console.log(`[SMTP SIMULATOR - DEMO FALLBACK] >>> Verification Email Sent to: ${email} <<<`);
      console.log(`[SMTP SIMULATOR - DEMO FALLBACK] >>> OTP VERIFICATION CODE: 123456 (Valid for 5 mins) <<<`);
      console.log('==================================================================\n');

      return res.status(200).json({
        success: true,
        message: 'Verification OTP generated. Code is 123456 (Terminal fallback active)',
        deliveryMode: 'terminal',
      });
    }

    // Check if user already registered
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const otp = generateOTP();
    await saveOTP(email, otp);

    const emailResult = await sendEmail({
      to: email,
      subject: `SupportDesk OTP ${otp} - Account Verification`,
      text: buildOtpText({ purpose: 'account verification', otp }),
      html: buildOtpEmailHtml({
        title: 'Account Verification',
        intro: 'Use the following 6-digit verification code to complete your SupportDesk account registration.',
        otp,
        note: 'This verification code is valid for 5 minutes.',
      }),
    });

    if (!emailResult.success) {
      await OTPTemp.deleteMany({ email });
      const statusCode = ['missing-config', 'auth-failed'].includes(emailResult.deliveryMode) ? 200 : 500;
      return res.status(statusCode).json({
        success: false,
        message: `Failed to send verification email: ${emailResult.error}`,
        deliveryMode: emailResult.deliveryMode,
      });
    }
    let extraMsg = '';
    if (emailResult.previewUrl) {
      extraMsg = ` (Demo sandbox preview: ${emailResult.previewUrl})`;
    }

    const responseMessage = emailResult.deliveryMode === 'sandbox'
      ? `Verification OTP created in Ethereal sandbox${extraMsg}`
      : 'Verification OTP sent to your email address';

    return res.status(200).json({
      success: true,
      message: responseMessage,
      deliveryMode: emailResult.deliveryMode,
      previewUrl: emailResult.previewUrl,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Verify OTP and register new user
 * @route   POST /api/auth/register/verify-otp
 * @access  Public
 */
const verifyRegisterOTPAndCreateUser = async (req, res) => {
  try {
    const { name, password, role, tier, otp } = req.body;
    const email = req.body.email?.trim().toLowerCase();

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields and provide OTP' });
    }

    const userRole = role && ['customer', 'agent', 'admin'].includes(role) ? role : 'customer';
    const userTier = tier && ['free', 'membership', 'premium'].includes(tier) ? tier : 'free';

    // Fallback if Database connection is offline
    if (!isDbConnected()) {
      if (otp !== '123456') {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP verification code' });
      }

      const tempId = `demo-user-${Date.now()}`;
      return res.status(201).json({
        success: true,
        message: 'Account verified and created successfully (Demo Mode)',
        _id: tempId,
        name,
        email,
        role: userRole,
        tier: userTier,
        token: generateToken(tempId),
      });
    }

    const otpRecord = await OTPTemp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP verification code' });
    }

    await OTPTemp.deleteMany({ email });

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      tier: userTier,
    });

    return res.status(201).json({
      success: true,
      message: 'Account verified and created successfully',
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tier: user.tier,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Verify OTP & Create User Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Send OTP to email for password reset
 * @route   POST /api/auth/forgot-password/send-otp
 * @access  Public
 */
const sendForgotPasswordOTP = async (req, res) => {
  try {
    const normalizedEmail = req.body.email?.trim().toLowerCase();
    const email = normalizedEmail;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address' });
    }

    const otp = generateOTP();
    await saveOTP(email, otp);

    const emailResult = await sendEmail({
      to: email,
      subject: `SupportDesk OTP ${otp} - Password Reset`,
      text: buildOtpText({ purpose: 'password reset', otp }),
      html: buildOtpEmailHtml({
        title: 'Password Reset',
        intro: 'Use the following 6-digit verification code to reset your SupportDesk password.',
        otp,
        note: 'This reset code is valid for 5 minutes.',
      }),
    });

    if (!emailResult.success) {
      await OTPTemp.deleteMany({ email });
      const statusCode = ['missing-config', 'auth-failed'].includes(emailResult.deliveryMode) ? 200 : 500;
      return res.status(statusCode).json({
        success: false,
        message: `Failed to send password reset email: ${emailResult.error}`,
        deliveryMode: emailResult.deliveryMode,
      });
    }
    let extraMsg = '';
    if (emailResult.previewUrl) {
      extraMsg = ` (Demo sandbox preview: ${emailResult.previewUrl})`;
    }

    const responseMessage = emailResult.deliveryMode === 'sandbox'
      ? `Password reset OTP created in Ethereal sandbox${extraMsg}`
      : 'Password reset OTP sent to your email address';

    return res.status(200).json({
      success: true,
      message: responseMessage,
      deliveryMode: emailResult.deliveryMode,
      previewUrl: emailResult.previewUrl,
    });
  } catch (error) {
    console.error('Send Forgot OTP Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Reset password with OTP verification
 * @route   POST /api/auth/forgot-password/reset
 * @access  Public
 */
const resetPasswordWithOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email, OTP code, and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Verify OTP
    const otpRecord = await OTPTemp.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset code' });
    }

    // Delete OTP record
    await OTPTemp.deleteMany({ email });

    // Update password
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Re-save user will hash the password inside the Mongoose hook
    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset completed successfully. You can now login.',
    });
  } catch (error) {
    console.error('Reset Password OTP Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Authenticate user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (!isDbConnected()) {
      const demoUser = getDemoUserByEmail(normalizedEmail);
      if (demoUser && demoUser.password === password) {
        return res.json({
          success: true,
          ...userPublic(demoUser),
          token: generateToken(demoUser._id),
          demoMode: true,
        });
      }

      return res.status(503).json({
        success: false,
        message: 'Database is currently unavailable. Demo login works with customer@example.com, agent@example.com, or admin@example.com using password123.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (user && (await user.comparePassword(password))) {
      return res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const demoUser = getDemoUserById(req.user.id);
      if (demoUser) {
        return res.json({ success: true, ...userPublic(demoUser), demoMode: true });
      }
    }

    const user = await User.findById(req.user.id);
    if (user) {
      return res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  sendRegisterOTP,
  verifyRegisterOTPAndCreateUser,
  sendForgotPasswordOTP,
  resetPasswordWithOTP,
  authUser,
  getMe,
};
