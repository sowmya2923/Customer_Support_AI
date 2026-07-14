import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authImage from '../assets/supportdesk-agent-login.png';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Sparkles, Shield, Zap, Loader2, ArrowLeft, Key, CheckCircle2, Star, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { login, sendForgotPasswordOTP, resetPassword, loading } = useAuth();
  const navigate = useNavigate();

  // Forgot Password States
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleSendResetOTP = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');
    if (!forgotEmail) return;

    setIsForgotLoading(true);
    const result = await sendForgotPasswordOTP(forgotEmail);
    setIsForgotLoading(false);

    if (result.success) {
      setForgotMsg('Reset code generated. Please check server command terminal logs!');
      setForgotStep(2);
    } else {
      setForgotError(result.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMsg('');
    if (!forgotOtp || !newPassword) return;

    setIsForgotLoading(true);
    const result = await resetPassword(forgotEmail, forgotOtp, newPassword);
    setIsForgotLoading(false);

    if (result.success) {
      setForgotMsg('Password reset successfully! Re-routing to login screen...');
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setNewPassword('');
        setForgotMsg('');
      }, 2000);
    } else {
      setForgotError(result.message);
    }
  };

  const fillTestCredentials = (role) => {
    if (role === 'customer') {
      setEmail('customer@example.com');
      setPassword('password123');
    } else if (role === 'agent') {
      setEmail('agent@example.com');
      setPassword('password123');
    } else if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('password123');
    }
  };

  return (
    <div className="auth-page flex min-h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans relative">
      
      {/* LEFT PANEL: High impact visual panel (spacious layout) */}
      <div className="auth-visual hidden lg:relative lg:flex lg:w-[55%] flex-col justify-between p-12 xl:p-16 bg-slate-900 border-r border-slate-950 text-white overflow-hidden professional-photo" style={{ backgroundImage: `linear-gradient(rgba(2,6,23,0.80), rgba(2,6,23,0.94)), url(${authImage})` }}>
        {/* Neon Glow spots */}
        <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[140px] pointer-events-none" />

        {/* Branding header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <span className="brand-mark brand-mark-sm">SD</span>
          <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 via-indigo-400 to-brand-400 bg-clip-text text-transparent">
            SupportDesk<span className="text-white font-medium">.ai</span>
          </span>
        </div>

        {/* Dynamic Mockup Content */}
        <div className="relative z-10 max-w-lg my-auto space-y-10 animate-fade-in-up">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sm font-extrabold text-brand-400 uppercase tracking-widest">
              <ShieldCheck className="h-5 w-5" />
              <span>SLA Escalations Enabled</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Enterprise Customer Support, Redefined
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Log in to access your custom desk. Manage queue routing, inspect real-time user sentiments, and automate resolution suggestions instantly.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
            <div><p className="text-lg font-black text-white">24/7</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coverage</p></div>
            <div><p className="text-lg font-black text-white">3 min</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">First reply</p></div>
            <div><p className="text-lg font-black text-white">99.9%</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SLA health</p></div>
          </div>
          {/* Customer Reviews inside visual panel */}
          <div className="bg-slate-950/40 border border-slate-800/80 p-6 sm:p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              "The automated AI drafts reduce ticket writing time by 75%, and auto-routing assigns tickets to qa, engineering, or support instantly based on the error code."
            </p>
            <p className="text-xs uppercase font-extrabold text-slate-500 tracking-widest">
              Ã¢â‚¬â€ Arjun Customer, SupportDesk Partner
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 uppercase tracking-widest font-bold">
          Powered by SupportDesk AI Ã¢â‚¬Â¢ Secure JWT Auth
        </div>
      </div>

      {/* RIGHT PANEL: Elegant, spacious Access Form Section (Dark Mode) */}
      <div className="auth-form-side w-full lg:w-[45%] flex flex-col justify-center items-center px-6 py-12 md:px-16 bg-slate-950 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="w-full max-w-xl z-10 space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-6">
            <span className="brand-mark mb-2">SD</span>
            <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-indigo-400 bg-clip-text text-transparent">
              SupportDesk<span className="text-white font-medium">.ai</span>
            </span>
          </div>

          {/* Forgot Password Modal style */}
          {showForgot ? (
            <div className="bg-slate-900 p-10 sm:p-12 rounded-3xl border border-slate-800 shadow-premium-lg space-y-8">
              <button
                onClick={() => {
                  setShowForgot(false);
                  setForgotStep(1);
                  setForgotError('');
                  setForgotMsg('');
                }}
                className="flex items-center gap-2 text-xs uppercase font-bold text-slate-400 hover:text-slate-200 tracking-widest transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to Login
              </button>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  Reset Password
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Provide your registered email. We will generate a 6-digit OTP code to verify your action.
                </p>
              </div>

              {forgotError && (
                <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-400 animate-fade-in">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotMsg && (
                <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 animate-fade-in">
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                  <span>{forgotMsg}</span>
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleSendResetOTP} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="forgot-email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-4 pl-12 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm"
                        placeholder="name@company.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full flex justify-center items-center gap-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-4 text-sm uppercase tracking-widest font-bold text-white shadow-md hover:shadow-brand-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isForgotLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span>Request Verification Code</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="reset-otp" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Enter 6-Digit OTP
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                        <Key className="h-5 w-5" />
                      </div>
                      <input
                        id="reset-otp"
                        type="text"
                        required
                        maxLength={6}
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-4 pl-12 pr-4 text-sm font-mono tracking-widest text-center focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm text-white"
                        placeholder="000000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="reset-password" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      New Security Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                        <Lock className="h-5 w-5" />
                      </div>
                      <input
                        id="reset-password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-4 pl-12 pr-4 text-sm text-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none transition-all shadow-sm"
                        placeholder="Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="w-full flex justify-center items-center gap-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-4 text-sm uppercase tracking-widest font-bold text-white shadow-md hover:shadow-brand-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isForgotLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <span>Reset Account Password</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            
            /* ELEGANT SIGN IN CARD */
            <div className="bg-slate-900 p-10 sm:p-12 rounded-2xl border border-slate-800 shadow-premium-lg space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-tight">
                  System Login
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Provide credentials or load one-click demo presets to launch.
                </p>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 animate-fade-in">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
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

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgot(true);
                        setForgotError('');
                        setForgotMsg('');
                      }}
                      className="text-xs uppercase font-extrabold text-brand-400 hover:text-brand-300 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 inline-flex justify-center items-center gap-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 px-6 text-sm sm:text-base font-extrabold uppercase tracking-wide text-white shadow-lg shadow-brand-600/20 hover:shadow-brand-500/30 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span className="leading-none whitespace-nowrap">Access Platform</span>
                    </>
                  )}
                </button>
              </form>

              {/* Presets Grid */}
              <div className="border-t border-slate-800 pt-6 space-y-3">
                <span className="block text-center text-xs font-extrabold uppercase tracking-widest text-slate-500">
                  Demo Fast Logins Presets
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => fillTestCredentials('customer')}
                    className="flex flex-col items-center justify-center rounded-xl bg-slate-950/50 border border-slate-800 hover:border-brand-500 hover:bg-brand-500/10 py-3 px-2 text-xs font-bold text-slate-300 hover:text-brand-400 transition-all cursor-pointer shadow-sm"
                  >
                    <span className="text-[10px] text-slate-600 font-normal uppercase mb-0.5">Role</span>
                    <span>Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCredentials('agent')}
                    className="flex flex-col items-center justify-center rounded-xl bg-slate-950/50 border border-slate-800 hover:border-brand-500 hover:bg-brand-500/10 py-3 px-2 text-xs font-bold text-slate-300 hover:text-brand-400 transition-all cursor-pointer shadow-sm"
                  >
                    <span className="text-[10px] text-slate-600 font-normal uppercase mb-0.5">Role</span>
                    <span>Agent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillTestCredentials('admin')}
                    className="flex flex-col items-center justify-center rounded-xl bg-slate-950/50 border border-slate-800 hover:border-brand-500 hover:bg-brand-500/10 py-3 px-2 text-xs font-bold text-slate-300 hover:text-brand-400 transition-all cursor-pointer shadow-sm"
                  >
                    <span className="text-[10px] text-slate-600 font-normal uppercase mb-0.5">Role</span>
                    <span>Manager</span>
                  </button>
                </div>
              </div>

              <p className="text-center text-sm text-slate-400 pt-3">
                Need a new account?{' '}
                <RouterLink to="/register" className="font-extrabold text-brand-400 hover:text-brand-300 transition-colors">
                  Sign Up
                </RouterLink>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





