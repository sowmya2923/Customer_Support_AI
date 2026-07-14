import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import operationsHero from '../assets/supportdesk-operations-hero.png';
import { 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  Clock, 
  Bot, 
  CheckCircle, 
  Cpu, 
  BookOpen,
  Zap,
  Layers,
  ChevronRight,
  Shield,
  Star,
  Users,
  Award,
  Terminal,
  Activity,
  ArrowUpRight
} from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);

  const simulationSteps = [
    {
      title: "1. Customer Submits Request",
      desc: "A customer opens a support query requesting attention.",
      badge: "TRIGGER",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      content: {
        from: "Arjun Customer (customer@example.com) ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢ PREMIUM MEMBER",
        subject: "Can't access subscription features after paying",
        body: "Hello, I upgraded to the Premium Plan 10 minutes ago and was charged on my card. But my account is still showing the free tier. Please fix this billing problem asap."
      }
    },
    {
      title: "2. AI Emotion & Category Analyzer",
      desc: "AI classifies query type, prioritizes according to membership level, and detects customer emotion.",
      badge: "AI ROUTING",
      badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      content: {
        status: "AUTO-ROUTED",
        category: "Billing Query",
        priority: "CRITICAL (Auto-Escalated)",
        sentiment: "Frustrated / Angry ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¹Ã…â€œÃƒâ€šÃ‚Â ",
        reason: "Customer is a PREMIUM tier user with frustrated sentiment regarding billing transaction failure."
      }
    },
    {
      title: "3. RAG Knowledge Fetching",
      desc: "AI automatically pulls matching documents from internal knowledge base archives.",
      badge: "KNOWLEDGE MATCH",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      content: {
        query: "billing subscription features premium activate",
        matchedDoc: "Article: Resolving Subscription Upgrade Verification Failures",
        docExcerpt: "...For premium members, verify billing status and manually execute the billing refresh action inside the agent panel to push feature updates instantly..."
      }
    },
    {
      title: "4. AI Multi-Draft Composer",
      desc: "AI writes three tailored responses (Direct, Empathetic, Technical) in real-time.",
      badge: "RESPONSE COMPOSE",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      content: {
        agentAction: "Select & Apply Draft",
        aiDraft: "Dear Arjun,\n\nThank you for being a valued Premium Member. We sincerely apologize for the frustration. I have run the Billing verification system and manually activated your Premium desk features. Please log out and log back in.\n\nBest regards,\nSupportDesk AI Assistant"
      }
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex flex-col font-sans select-none relative overflow-x-hidden">
      
      {/* Dark Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Soft background accents */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-brand-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="landing-header sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="brand-mark brand-mark-sm">SD</span>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-400 via-indigo-400 to-brand-400 bg-clip-text text-transparent">
              SupportDesk<span className="text-white font-medium">.ai</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-slate-200 transition-colors">Features</a>
            <a href="#preview" className="hover:text-slate-200 transition-colors">Workflow Demo</a>
            <a href="#testimonials" className="hover:text-slate-200 transition-colors">Reviews</a>
            <Link to="/kb" className="hover:text-slate-200 transition-colors flex items-center gap-1.5 normal-case tracking-normal font-semibold">
              <BookOpen className="h-4 w-4 text-brand-400" />
              <span>Help Center</span>
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link 
                to="/" 
                className="flex items-center gap-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md hover:shadow-brand-500/25 transition-all"
              >
                <span>Console Desk</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors px-3 py-2">
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[720px] flex flex-col items-center justify-center px-6 pt-20 pb-24 text-center overflow-hidden professional-photo" style={{ backgroundImage: `linear-gradient(rgba(2,6,23,0.78), rgba(2,6,23,0.94)), url(${operationsHero})` }}>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-xl sm:rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[11px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider mb-6 animate-fade-in-up">
          <Sparkles className="h-3.5 w-3.5 text-brand-400 animate-pulse" />
          <span className="leading-snug text-center">Next-Gen Helpdesk Engine Powered by SupportDesk AI</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-white max-w-5xl leading-[1.1] mb-6 animate-fade-in-up">
          Automate Support with <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Contextual Intelligence</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-3xl leading-relaxed mb-10 animate-fade-in-up">
          Deliver instant resolutions. Automatically classify ticket categories, extract customer emotions, apply membership priority escalations, and draft custom drafts instantly.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md animate-fade-in-up">
          <Link 
            to="/register" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 transition-all hover:scale-[1.02]"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a 
            href="#preview" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold text-xs uppercase tracking-widest px-8 py-4 rounded-xl transition-all"
          >
            <span>Live Interactive Demo</span>
          </a>
        </div>

        {/* Social Proof / Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 mt-12 border-t border-slate-900 w-full max-w-4xl text-center">
          <div className="space-y-1">
            <span className="text-3xl font-extrabold text-white">99.8%</span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Accuracy rate</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-extrabold text-white">&lt; 3 Min</span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Avg SLA resolution</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-extrabold text-white">4.9 / 5.0</span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Customer CSAT</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-extrabold text-white">80%</span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Reduction in overhead</p>
          </div>
        </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="bg-slate-950 border-t border-b border-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest text-brand-400 uppercase">Core Capabilities</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Everything You Need for Elite Customer Operations</h2>
            <p className="text-slate-500 text-xs sm:text-sm">A comprehensive ecosystem of intelligent ticketing tools, responsive layouts, and auto-routing workflows.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-brand-500/35 transition-all hover:shadow-premium group">
              <div className="h-12 w-12 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-all">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Emotion & Sentiment Classification</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Automatically read between the lines. Our AI detects if a customer is positive, neutral, frustrated, or angry, allowing you to prioritize and route communication appropriately.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-indigo-500/35 transition-all hover:shadow-premium group">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Membership Tier Routing</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Define distinct SLAs for Free, Membership, and Premium users. Premium tier user requests auto-escalate directly to critical queues when frustration triggers are detected.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl space-y-4 hover:border-purple-500/35 transition-all hover:shadow-premium group">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Multi-Draft AI Suggestions</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Generate tailored response drafts instantly. Agents can toggle and review Direct, Empathetic, or highly Technical answers with integrated knowledge references.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Simulation */}
      <section id="preview" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">Live Walkthrough</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Experience SupportDesk AI in Action</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Click through the steps below to see how a query is ingested, classified, referenced, and resolved.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Steps */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {simulationSteps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  activeStep === idx 
                    ? 'bg-slate-900 border-indigo-500/40 shadow-premium' 
                    : 'bg-transparent border-slate-800 hover:bg-slate-900/35 hover:border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{step.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
              </button>
            ))}
          </div>

          {/* Interactive Screen Preview */}
          <div className="lg:col-span-8 bg-slate-900 text-slate-100 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
            {/* Top window dots */}
            <div className="flex gap-1.5 mb-6">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-600 font-bold uppercase ml-3 tracking-widest">SUPPORTDESK CORE SIMULATOR v1.5</span>
            </div>

            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 min-h-[300px] flex flex-col justify-between font-mono text-xs overflow-x-auto">
              {activeStep === 0 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="border-b border-slate-900 pb-3">
                    <p className="text-slate-500">FROM: <span className="text-slate-300">{simulationSteps[0].content.from}</span></p>
                    <p className="text-slate-500">SUBJ: <span className="text-white font-semibold">{simulationSteps[0].content.subject}</span></p>
                  </div>
                  <p className="text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-900/60">
                    "{simulationSteps[0].content.body}"
                  </p>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <Bot className="h-4.5 w-4.5 animate-pulse" />
                    <span>AI ANALYSIS COMPLETED</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 space-y-1">
                      <p className="text-slate-500 text-[10px] uppercase">Category</p>
                      <p className="text-white font-bold">{simulationSteps[1].content.category}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 space-y-1">
                      <p className="text-slate-500 text-[10px] uppercase">Assigned Priority</p>
                      <p className="text-red-400 font-bold">{simulationSteps[1].content.priority}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 space-y-1">
                      <p className="text-slate-500 text-[10px] uppercase">Detected Emotion</p>
                      <p className="text-amber-400 font-bold">{simulationSteps[1].content.sentiment}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 space-y-1">
                      <p className="text-slate-500 text-[10px] uppercase">Status</p>
                      <p className="text-emerald-400 font-bold">{simulationSteps[1].content.status}</p>
                    </div>
                  </div>
                  <div className="bg-indigo-950/20 border border-indigo-900/45 p-4 rounded-xl text-indigo-300">
                    <p className="text-[10px] uppercase font-bold text-indigo-400">AI Routing Decision</p>
                    <p className="mt-1 leading-relaxed text-[11px]">{simulationSteps[1].content.reason}</p>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <Cpu className="h-4.5 w-4.5" />
                    <span>KNOWLEDGE INDEX RETRIEVAL</span>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 space-y-1.5">
                    <p className="text-slate-500 text-[10px] uppercase">Search Query</p>
                    <p className="text-slate-300 font-mono">"{simulationSteps[2].content.query}"</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 space-y-1.5">
                    <p className="text-slate-500 text-[10px] uppercase">Matched Documentation</p>
                    <p className="text-purple-300 font-bold">{simulationSteps[2].content.matchedDoc}</p>
                    <p className="text-slate-400 leading-relaxed text-[11px] border-t border-slate-800 pt-2 mt-2">
                      "{simulationSteps[2].content.docExcerpt}"
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                      <span>AI DRAFT SUGGESTED</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">{simulationSteps[3].content.agentAction}</span>
                  </div>
                  <pre className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-slate-900/60 whitespace-pre-wrap font-mono">
                    {simulationSteps[3].content.aiDraft}
                  </pre>
                  <div className="flex justify-end pt-3">
                    <button className="bg-slate-800 text-slate-400 font-bold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg cursor-not-allowed">
                      Apply Draft Response
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-900 pt-4 flex justify-between items-center text-[10px] text-slate-600">
                <span>SIMULATOR STATUS: ACTIVE</span>
                <span className="font-bold">STEP {activeStep + 1} OF 4</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-slate-900/30 border-t border-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold tracking-widest text-brand-400 uppercase">Customer Success</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Endorsed by Leading Teams</h2>
            <p className="text-slate-500 text-xs sm:text-sm">See how teams are unlocking elite automation with SupportDesk.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-premium relative">
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4.5 w-4.5 fill-current animate-pulse" />)}
              </div>
              <p className="text-slate-400 text-xs leading-relaxed italic mb-6">
                "The emotion analysis is incredible. It flags angry customers immediately, allowing our team to route premium billing queries to finance and resolve refunds in minutes. An absolute game-changer!"
              </p>
              <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-950 text-white font-bold flex items-center justify-center text-xs border border-slate-800">
                  JD
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">John Doe</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">VP of Support, SaaSify</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-premium relative">
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4.5 w-4.5 fill-current animate-pulse" />)}
              </div>
              <p className="text-slate-400 text-xs leading-relaxed italic mb-6">
                "SupportDesk has completely transformed our engineering support line. Bug logs and setup API queries are categorized instantly. The automated drafts reduce writing time by 75%."
              </p>
              <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-950 text-white font-bold flex items-center justify-center text-xs border border-slate-800">
                  AS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Arjun Sharma</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Engineering Manager, CloudTech</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-premium relative">
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4.5 w-4.5 fill-current animate-pulse" />)}
              </div>
              <p className="text-slate-400 text-xs leading-relaxed italic mb-6">
                "We set up our entire help center database here. The system fetches appropriate links and inserts them as drafts automatically. Our customer SLA rating has soared to 4.9."
              </p>
              <div className="flex items-center gap-3 border-t border-slate-800 pt-4">
                <div className="h-10 w-10 rounded-full bg-slate-950 text-white font-bold flex items-center justify-center text-xs border border-slate-800">
                  KW
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Krista Wells</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">Operations Director, FinFlow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer bg-slate-950 text-slate-500 py-12 mt-auto border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <span className="brand-mark brand-mark-xs bg-slate-900 border border-slate-800">SD</span>
            <span className="text-lg font-bold tracking-tight text-white">
              SupportDesk<span className="text-slate-500 font-medium">.ai</span>
            </span>
          </div>

          <p className="text-xs">
            &copy; {new Date().getFullYear()} SupportDesk.ai Inc. All rights reserved. Powered by SupportDesk AI.
          </p>
        </div>
      </footer>
    </div>
  );
}





