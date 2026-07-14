import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authImage from '../assets/supportdesk-agent-login.png';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, Sparkles, Zap, Shield, Loader2, Key, CheckCircle2, ArrowLeft, Star, Crown } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [tier, setTier] = useState('free');
  const [otp, setOtp] = useState('');

  // OTP register steps
  const [regStep, setRegStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpDeliveryMode, setOtpDeliveryMode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { sendRegisterOTP, verifyRegisterOTP } = useAuth();
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !email || !password) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    const result = await sendRegisterOTP(email);
    setIsSubmitting(false);

    if (result.success) {
      const deliveryMode = result.deliveryMode || 'smtp';
      setOtpDeliveryMode(deliveryMode);

      if (deliveryMode === 'sandbox') {
        setSuccessMsg('Verification code created in sandbox email. Open the Ethereal preview URL from the backend terminal.');
      } else if (deliveryMode === 'terminal') {
        setSuccessMsg('Verification code generated in terminal fallback mode.');
      } else {
        setSuccessMsg('Verification code sent through Gmail. Check Inbox, Spam, Promotions, and Updates tabs.');
      }

      setRegStep(2);
    } else {
      setOtpDeliveryMode('');
      setErrorMsg(result.message);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otp) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    const result = await verifyRegisterOTP(name, email, password, role, tier, otp);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="auth-page flex min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans relative">
      
      {/* LEFT PANEL: High impact visual panel (spacious layout) */}
      <div className="auth-visual hidden lg:relative lg:flex lg:w-1/2 flex-col justify-between p-16 bg-slate-900 border-r border-slate-950 text-white overflow-hidden professional-photo" style={{ backgroundImage: `linear-gradient(rgba(2,6,23,0.80), rgba(2,6,23,0.94)), url(${authImage})` }}>
        {/* Glow blur slots */}
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />

        {/* Branding header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <span className="brand-mark brand-mark-sm">SD</span>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 via-indigo-400 to-brand-400 bg-clip-text text-transparent">
            SupportDesk<span className="text-white font-medium">.ai</span>
          </span>
        </div>

        {/* Info Mockup */}
        <div className="relative z-10 max-w-lg my-auto space-y-10 animate-fade-in-up">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sm font-extrabold text-indigo-400 uppercase tracking-widest">
              <Sparkles className="h-5 w-5" />
              <span>Multi-Role Sandbox Environment</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Create Your Sandbox Profile Instantly
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Explore three different operational roles. Test the Customer Dashboard, reply as a Support Agent, or monitor SLA performance logs in the Manager Analytics desk.
            </p>
          </div>

          {/* Core highlights */}
          <div className="space-y-6 pt-8 border-t border-slate-800">
            <div className="flex items-start gap-4">
              <div className="bg-brand-500/15 p-2.5 rounded-xl border border-brand-500/20 text-brand-400">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">Membership Tiers</h4>
                <p className="text-xs text-slate-400 mt-1">Define premium priority levels for support queues automatically.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-indigo-500/15 p-2.5 rounded-xl border border-indigo-500/20 text-indigo-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">Instant AI Classification</h4>
                <p className="text-xs text-slate-400 mt-1">Predict ticket sentiment emotions, categories, and routing departments in real-time.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 uppercase tracking-widest font-bold">
          Powered by SupportDesk AI Ã¢â‚¬Â¢ Secure Verification
        </div>
      </div>

      {/* RIGHT PANEL: Elegant Registration Form Section (Dark Mode) */}
      <div className="auth-form-side w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 md:px-16 bg-slate-950 relative overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="w-full max-w-xl z-10 space-y-6 my-auto">
          
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <span className="brand-mark mb-2">SD</span>
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
              SupportDesk<span className="text-white font-medium">.ai</span>
            </span>
          </div>

          <div className="bg-slate-900 p-10 sm:p-12 rounded-2xl border border-slate-800 shadow-premium-lg space-y-6">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                Create Account
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Join our sandbox portal and test dynamic workflows and role desks.
              </p>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 animate-fade-in">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400 animate-fade-in">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {regStep === 1 ? (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                
                {/* Full name input */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-4 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email address input */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-4 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Security Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950 py-4 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm"
                      placeholder="Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢"
                    />
                  </div>
                </div>

                {/* Selection: Sandbox Role */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Sandbox Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-4 px-4 text-sm text-slate-300 focus:border-brand-500 focus:outline-none transition-all shadow-sm font-bold"
                  >
                    <option value="customer">Customer Client</option>
                    <option value="agent">Support Agent</option>
                    <option value="admin">Manager Admin</option>
                  </select>
                </div>

                {/* ELEGANT MEMBERSHIP TIER CARD RADIO SELECTORS (visible only if customer role is active) */}
                {role === 'customer' && (
                  <div className="border-t border-slate-800 pt-5 space-y-3">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Choose Customer SLA Level
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setTier('free')}
                        className={`flex flex-col items-center justify-center rounded-xl p-4 border text-center transition-all cursor-pointer shadow-sm ${
                          tier === 'free'
                            ? 'bg-slate-950 border-slate-950 text-white shadow-md'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold">Free</span>
                        <span className="text-[9px] opacity-60 mt-0.5">Standard SLA</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTier('membership')}
                        className={`flex flex-col items-center justify-center rounded-xl p-4 border text-center transition-all cursor-pointer shadow-sm ${
                          tier === 'membership'
                            ? 'bg-gradient-to-tr from-brand-600 to-brand-700 border-brand-600 text-white shadow-md'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-brand-500/20'
                        }`}
                      >
                        <Zap className="h-4.5 w-4.5 mb-1 text-yellow-300 animate-pulse" />
                        <span className="text-xs font-bold">Membership</span>
                        <span className="text-[9px] opacity-80 mt-0.5">Escalated</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTier('premium')}
                        className={`flex flex-col items-center justify-center rounded-xl p-4 border text-center transition-all cursor-pointer shadow-sm ${
                          tier === 'premium'
                            ? 'bg-gradient-to-tr from-amber-500 to-orange-600 border-amber-500 text-white shadow-md'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-amber-500/20'
                        }`}
                      >
                        <Crown className="h-4.5 w-4.5 mb-1 text-yellow-300" />
                        <span className="text-xs font-bold">Premium</span>
                        <span className="text-[9px] opacity-80 mt-0.5">Critical SLA</span>
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 inline-flex justify-center items-center gap-3 rounded-xl bg-slate-950 hover:bg-slate-800 px-6 text-sm sm:text-base font-extrabold uppercase tracking-wide text-white shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      <span className="leading-none text-center">Send Verification Code</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <button
                  onClick={() => {
                    setRegStep(1);
                    setErrorMsg('');
                    setSuccessMsg('');
                    setOtpDeliveryMode('');
                  }}
                  className="flex items-center gap-2 text-xs uppercase font-bold text-slate-400 hover:text-slate-200 tracking-widest transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Modify Registration Details
                </button>

                <div className="space-y-3">
                  <label htmlFor="otp" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Enter Verification OTP
                  </label>
                  {otpDeliveryMode !== 'smtp' && (
                    <div className="bg-brand-500/10 border border-brand-500/20 p-4 rounded-2xl text-brand-400 space-y-1">
                      <p className="font-extrabold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-brand-400 animate-pulse" />
                        <span>{otpDeliveryMode === 'terminal' ? 'Terminal Fallback Active' : 'Sandbox Email Preview'}</span>
                      </p>
                      <p className="text-xs leading-relaxed text-slate-300">
                        {otpDeliveryMode === 'terminal' ? (
                          <>
                            Database fallback is active. Use <strong>123456</strong> as the verification code.
                          </>
                        ) : (
                          <>
                            Ethereal is a test mailbox, so this email will not reach your personal inbox. Open the preview URL printed in the backend terminal to read the OTP.
                          </>
                        )}
                      </p>
                    </div>
                  )}
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                      <Key className="h-5 w-5" />
                    </div>
                    <input
                      id="otp"
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-4 pl-12 pr-4 text-sm font-mono tracking-widest text-center focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm text-white"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 inline-flex justify-center items-center gap-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 px-6 text-sm sm:text-base font-extrabold uppercase tracking-wide text-white shadow-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <span className="leading-none text-center">Verify OTP & Create Account</span>
                  )}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-slate-400 pt-3">
              Already have an account?{' '}
              <Link to="/login" className="font-extrabold text-brand-400 hover:text-brand-300 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}








