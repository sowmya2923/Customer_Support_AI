const nodemailer = require('nodemailer');

const cleanEnv = (value) => String(value || '').trim().replace(/^[ '\"]|[ '\"]$/g, '');
const isTruthy = (value) => ['1', 'true', 'yes', 'on'].includes(cleanEnv(value).toLowerCase());

let cachedTransporter = null;
let cachedConfigKey = '';

const normalizeAddress = (value) => cleanEnv(value).toLowerCase();
const normalizeAddressList = (value) => (Array.isArray(value) ? value : [value]).map(normalizeAddress).filter(Boolean);

const getSmtpConfig = () => {
  const host = cleanEnv(process.env.SMTP_HOST);
  const port = Number(cleanEnv(process.env.SMTP_PORT) || 587);
  const user = cleanEnv(process.env.SMTP_USER);
  const pass = cleanEnv(process.env.SMTP_PASS);

  if (!host || !user || !pass) {
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    requireTLS: port === 587,
    tls: {
      servername: host,
    },
    auth: {
      user,
      pass,
    },
  };
};

const getTransporter = (smtpConfig) => {
  const configKey = `${smtpConfig.host}:${smtpConfig.port}:${smtpConfig.auth.user}`;
  if (!cachedTransporter || cachedConfigKey !== configKey) {
    cachedTransporter = nodemailer.createTransport(smtpConfig);
    cachedConfigKey = configKey;
  }
  return cachedTransporter;
};

/**
 * Sends email through real SMTP credentials from backend/.env.
 * SMTP success means Gmail accepted the message for the recipient; inbox placement can still be affected by Gmail tabs, spam, filters, or delay.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const smtpConfig = getSmtpConfig();
    let transporter;
    let deliveryMode = 'smtp';

    if (smtpConfig) {
      transporter = getTransporter(smtpConfig);
      console.log(`\n[SMTP] Sending real email to: ${to} via ${smtpConfig.host}...`);
    } else if (isTruthy(process.env.ALLOW_ETHEREAL_SANDBOX)) {
      deliveryMode = 'sandbox';
      console.log('\n[SMTP] Real SMTP credentials missing. ALLOW_ETHEREAL_SANDBOX=true, so using Ethereal preview only.');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[SMTP - Sandbox] Temp sandbox user generated: ${testAccount.user}`);
    } else {
      return {
        success: false,
        deliveryMode: 'missing-config',
        error: 'Real SMTP credentials are missing in backend/.env. Add SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS, then restart the backend server.',
      };
    }

    const fromAddress = smtpConfig?.auth?.user || cleanEnv(process.env.SMTP_FROM) || 'support@supportdesk.ai';
    const plainText = text || html.replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const mailOptions = {
      from: `SupportDesk Support <${fromAddress}>`,
      sender: fromAddress,
      replyTo: fromAddress,
      to,
      subject,
      text: plainText,
      html,
      priority: 'high',
      envelope: {
        from: fromAddress,
        to,
      },
      headers: {
        'X-SupportDesk-Message': 'otp-verification',
        'X-Priority': '1',
        Importance: 'high',
      },
    };

    const info = await transporter.sendMail(mailOptions);
    const accepted = normalizeAddressList(info.accepted || []);
    const rejected = normalizeAddressList(info.rejected || []);
    const pending = normalizeAddressList(info.pending || []);
    const recipients = normalizeAddressList(to);
    const missingAccepted = deliveryMode === 'smtp'
      ? recipients.filter((recipient) => !accepted.includes(recipient))
      : [];

    console.log(`[SMTP] Message sent successfully. Message ID: ${info.messageId}`);
    if (accepted.length) console.log(`[SMTP] Accepted by server: ${accepted.join(', ')}`);
    if (rejected.length) console.log(`[SMTP] Rejected by server: ${rejected.join(', ')}`);
    if (pending.length) console.log(`[SMTP] Pending recipients: ${pending.join(', ')}`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[SMTP - Ethereal Preview URL]: ${previewUrl}`);
    }

    if (rejected.some((recipient) => recipients.includes(recipient))) {
      return {
        success: false,
        deliveryMode: 'rejected',
        error: `SMTP server rejected recipient: ${to}`,
        messageId: info.messageId,
        accepted,
        rejected,
        pending,
      };
    }

    if (missingAccepted.length) {
      return {
        success: false,
        deliveryMode: 'not-accepted',
        error: `SMTP server did not confirm acceptance for recipient: ${missingAccepted.join(', ')}`,
        messageId: info.messageId,
        accepted,
        rejected,
        pending,
      };
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
      deliveryMode,
      accepted,
      rejected,
      pending,
    };
  } catch (error) {
    const isAuthError = error.code === 'EAUTH' || error.responseCode === 535;
    if (isAuthError) {
      console.error('[SMTP Auth Error] Gmail rejected the SMTP username/password.');
    } else {
      console.error('[SMTP Error] Failed to send email:', error);
    }

    return {
      success: false,
      deliveryMode: isAuthError ? 'auth-failed' : 'error',
      error: isAuthError
        ? 'SMTP login failed. Gmail rejected the username/password. The code sent SMTP_PASS as provided, but Gmail does not accept this credential for SMTP.'
        : error.message,
    };
  }
};

module.exports = sendEmail;
