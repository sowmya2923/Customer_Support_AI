import React, { useState, useEffect } from 'react';
import { useTickets } from '../hooks/useTickets';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  FileText, 
  Loader2, 
  Sparkles, 
  ArrowRight,
  UserCheck,
  Clock,
  HelpCircle,
  AlertCircle,
  Building,
  User,
  Heart,
  Zap,
  Crown,
  Play,
  RotateCcw,
  CheckCircle,
  BookOpen,
  Terminal,
  Paperclip,
  CheckCheck,
  Radio,
  Bell
} from 'lucide-react';
import api from '../utils/api';

export default function AgentWorkspace() {
  const { user } = useAuth();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [statusFilter, setStatusFilter] = useState(''); // blank = active queue across workflow statuses
  const [deptFilter, setDeptFilter] = useState('');

  // Chat message editor state
  const [msgText, setMsgText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [msgAttachment, setMsgAttachment] = useState(null);

  // AI suggestion drafts state
  const [aiDrafts, setAiDrafts] = useState(null); // { direct, empathetic, technical }
  const [activeDraftTab, setActiveDraftTab] = useState('direct'); // direct, empathetic, technical
  const [referencedArticles, setReferencedArticles] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Real-time timeline details
  const [ticketDetails, setTicketDetails] = useState(null);
  const [ticketAuditLogs, setTicketAuditLogs] = useState([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Simulated Department Action Center states
  const [isActionExecuting, setIsActionExecuting] = useState(false);
  const [actionLogs, setActionLogs] = useState([]);
  const [actionSuccess, setActionSuccess] = useState(false);

  // Fetch Tickets
  const ticketFilters = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(deptFilter ? { department: deptFilter } : {})
  };

  const { tickets, isLoadingTickets, updateTicket } = useTickets(null, ticketFilters);

  // Fetch Messages
  const { messages, isLoadingMessages, sendMessage } = useMessages(selectedTicketId);

  // Reset action center on ticket change
  useEffect(() => {
    setActionLogs([]);
    setActionSuccess(false);
    setIsActionExecuting(false);
  }, [selectedTicketId]);

  // Load ticket details on selection
  useEffect(() => {
    if (!selectedTicketId) {
      setTicketDetails(null);
      setTicketAuditLogs([]);
      return;
    }

    const fetchTicketDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const { data } = await api.get(`/tickets/${selectedTicketId}`);
        if (data.success) {
          setTicketDetails(data.ticket);
          setTicketAuditLogs(data.auditLogs || []);
          
          if (data.ticket.aiSuggestedDrafts?.direct) {
            setAiDrafts(data.ticket.aiSuggestedDrafts);
          } else {
            setAiDrafts(null);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchTicketDetails();
  }, [selectedTicketId]);

  const visibleTickets = statusFilter ? tickets : tickets.filter((ticket) => !['resolved', 'closed'].includes(ticket.status));
  const activeTicket = visibleTickets.find((t) => t._id === selectedTicketId) || ticketDetails;

  const handleSendMessage = async (e, customMsg = null, isCustomInternal = false) => {
    if (e) e.preventDefault();
    const textToSend = customMsg || msgText;
    if (!textToSend.trim() && !msgAttachment) return;

    const formData = new FormData();
    formData.append('ticketId', selectedTicketId);
    formData.append('message', textToSend);
    formData.append('isInternal', customMsg ? isCustomInternal : isInternal);
    if (!customMsg && msgAttachment) {
      formData.append('file', msgAttachment);
    }

    try {
      await sendMessage(formData);
      if (!customMsg) {
        setMsgText('');
        setIsInternal(false);
        setMsgAttachment(null);
      }
      
      const { data } = await api.get(`/tickets/${selectedTicketId}`);
      if (data.success) {
        setTicketAuditLogs(data.auditLogs || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAttributeChange = async (field, value) => {
    if (!activeTicket) return;
    try {
      const payload = { id: activeTicket._id };
      payload[field] = value;
      await updateTicket(payload);

      const { data } = await api.get(`/tickets/${activeTicket._id}`);
      if (data.success) {
        setTicketDetails(data.ticket);
        setTicketAuditLogs(data.auditLogs || []);
      }

      if (field === 'status' && value !== statusFilter) {
        setSelectedTicketId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignToMe = async () => {
    if (!activeTicket) return;
    await handleAttributeChange('assignedAgentId', user.id);
  };

  const triggerAISuggestions = async () => {
    if (!activeTicket) return;
    setIsAiLoading(true);
    setAiDrafts(null);
    setReferencedArticles([]);
    
    try {
      const { data } = await api.post(`/ai/suggest/${activeTicket._id}`);
      if (data.success) {
        setAiDrafts(data.suggestedReply);
        setReferencedArticles(data.referencedArticles || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyActiveDraft = () => {
    if (!aiDrafts) return;
    setMsgText(aiDrafts[activeDraftTab]);
  };

  // Run Simulated Department Action to Resolve
  const executeDeptAction = async () => {
    if (!activeTicket || isActionExecuting) return;
    setIsActionExecuting(true);
    setActionLogs([]);
    setActionSuccess(false);

    const logs = [];
    const dept = activeTicket.department;

    const addLog = (text) => {
      logs.push(text);
      setActionLogs([...logs]);
    };

    // Auto-assignment if unassigned
    if (!activeTicket.assignedAgent) {
      await handleAssignToMe();
    }

    if (dept === 'finance') {
      setTimeout(() => addLog("⚡ Stripe Gateway initialized..."), 300);
      setTimeout(() => addLog("🔍 Matching invoice duplicate ID #INV-8832..."), 805);
      setTimeout(() => addLog("💵 Billing Transaction verified ($29.00 billing error)."), 1300);
      setTimeout(() => addLog("✅ Refund successfully posted via Stripe. Ref: REF_STRIPE_98321"), 1800);
      setTimeout(async () => {
        setActionSuccess(true);
        setIsActionExecuting(false);
        // Post message in chat
        await handleSendMessage(null, "[FINANCE BOT] Refund of $29.00 has been verified and processed back to the card. Ref: REF_STRIPE_98321. Status set to resolved.", false);
        // Resolve ticket
        await handleAttributeChange('status', 'resolved');
      }, 2300);
    } 
    else if (dept === 'engineering') {
      setTimeout(() => addLog("🚀 Connecting to AWS EC2 Cluster..."), 300);
      setTimeout(() => addLog("🔌 Flushing Active Connection socket pool (port 5005)..."), 805);
      setTimeout(() => addLog("🧹 Invaliding Redis Auth Tokens Cache..."), 1300);
      setTimeout(() => addLog("🟢 Node restarted successfully. Server State: 200 OK (Healthy)."), 1800);
      setTimeout(async () => {
        setActionSuccess(true);
        setIsActionExecuting(false);
        await handleSendMessage(null, "[ENGINEERING BOT] Flushed connection logs and recycled database server node on port 5005. System fully operational.", false);
        await handleAttributeChange('status', 'resolved');
      }, 2300);
    }
    else if (dept === 'qa') {
      setTimeout(() => addLog("🤖 Initializing Headless QA Chrome Instance..."), 300);
      setTimeout(() => addLog("🧪 Running E2E User Authentication Specs... (PASSED)"), 805);
      setTimeout(() => addLog("🧪 Running E2E API Ticket Creation Specs... (PASSED)"), 1300);
      setTimeout(() => addLog("🧪 Running CSAT rating post-validation specs... (PASSED)"), 1800);
      setTimeout(async () => {
        setActionSuccess(true);
        setIsActionExecuting(false);
        await handleSendMessage(null, "[QA BOT] Headless E2E Integration suite completed. All 4 target authentication specs passed with 0 errors.", false);
        await handleAttributeChange('status', 'resolved');
      }, 2300);
    }
    else if (dept === 'product') {
      setTimeout(() => addLog("🔗 Initiating Atlassian Jira Cloud Integration..."), 300);
      setTimeout(() => addLog("✍️ Compiling feature request criteria & sentiment..."), 805);
      setTimeout(() => addLog("📂 Jira Backlog issue registered: Issue Key: CD-89201"), 1300);
      setTimeout(() => addLog("✅ Priority queue initialized to high-priority sprint backlog."), 1850);
      setTimeout(async () => {
        setActionSuccess(true);
        setIsActionExecuting(false);
        await handleSendMessage(null, "[PRODUCT BOT] Registered ticket in Jira product backlog (Issue: CD-89201) for the next development sprint. Thank you for your feedback!", false);
        await handleAttributeChange('status', 'resolved');
      }, 2300);
    }
    else {
      // support/general
      setTimeout(() => addLog("✍️ Formatting support closure summary..."), 500);
      setTimeout(() => addLog("✅ Support SLA criteria achieved. Dispatching CSAT poll..."), 1200);
      setTimeout(async () => {
        setActionSuccess(true);
        setIsActionExecuting(false);
        await handleSendMessage(null, "[SUPPORT BOT] Support ticket resolved. Dispatched standard customer feedback poll. Thank you!", false);
        await handleAttributeChange('status', 'resolved');
      }, 1800);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'open': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'ai-reviewed': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'assigned': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'in-progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'waiting-for-customer': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'resolved': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'closed': 'bg-slate-800 text-slate-400 border-slate-700',
    };
    return (
      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${styles[status] || 'bg-slate-800'}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      'low': 'bg-slate-800 text-slate-400 border-slate-700',
      'medium': 'bg-brand-500/10 text-brand-400 border-brand-500/20',
      'high': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'critical': 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse',
    };
    return (
      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const getTierIndicator = (tier) => {
    if (tier === 'premium') {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-400 uppercase tracking-wide">
          <Crown className="h-3 w-3 text-amber-500 fill-amber-500" />
          <span>Premium</span>
        </span>
      );
    }
    if (tier === 'membership') {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-brand-500/10 border border-brand-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-brand-400 uppercase tracking-wide">
          <Zap className="h-3 w-3 text-brand-500 fill-brand-500" />
          <span>Member</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
        Free
      </span>
    );
  };

  const getSentimentBadge = (sentiment) => {
    const badges = {
      positive: '\uD83D\uDE0A Positive',
      neutral: '\uD83D\uDE10 Neutral',
      frustrated: '\uD83D\uDE1E Frustrated',
      angry: '\uD83D\uDE20 Urgent/Angry'
    };
    const styles = {
      positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      neutral: 'bg-slate-800 text-slate-400 border-slate-700',
      frustrated: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      angry: 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
    };
    return (
      <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${styles[sentiment] || 'bg-slate-800'}`}>
        {badges[sentiment] || '\uD83D\uDE10 Neutral'}
      </span>
    );
  };

  return (
    <div className="dashboard-readable flex h-[calc(100vh-4rem)] bg-slate-950 text-slate-200 overflow-hidden font-sans select-none">
      
      {/* 1. LEFT PANEL: Queue Desk */}
      <div className="w-80 border-r border-slate-900 bg-slate-950 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-900 bg-slate-950/85 space-y-3">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wide">Agent Workspace Queue</h2>
          
          <div className="flex flex-wrap gap-1.5 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
            {['', 'ai-reviewed', 'assigned', 'in-progress', 'resolved'].map((status) => (
              <button
                key={status ? status.replace('-', ' ') : 'active'}
                onClick={() => {
                  setStatusFilter(status);
                  setSelectedTicketId(null);
                }}
                className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded-lg cursor-pointer transition-all ${
                  statusFilter === status
                    ? 'bg-slate-800 text-brand-400 border border-slate-700 shadow-sm'
                    : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {status ? status.replace('-', ' ') : 'active'}
              </button>
            ))}
          </div>

          <select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setSelectedTicketId(null);
            }}
            className="w-full text-xs rounded-xl border border-slate-800 bg-slate-900 p-2.5 outline-none font-bold text-slate-400 focus:border-brand-500 shadow-sm"
          >
            <option value="">All Departments</option>
            <option value="finance">Finance Department</option>
            <option value="engineering">Engineering Department</option>
            <option value="qa">QA Department</option>
            <option value="product">Product Department</option>
            <option value="support">General Support</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-950/60">
          {isLoadingTickets ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
            </div>
          ) : visibleTickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No tickets found in '{statusFilter || 'active'}'.
            </div>
          ) : (
            visibleTickets.map((t) => (
              <div
                key={t._id}
                onClick={() => setSelectedTicketId(t._id)}
                className={`p-4 cursor-pointer transition-all border-l-4 ${
                  selectedTicketId === t._id ? 'bg-slate-900/50 border-brand-500 shadow-sm' : 'border-transparent hover:bg-slate-900/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>ID: {t._id.substring(t._id.length - 8)}</span>
                  <span>{t.department?.toUpperCase()}</span>
                </div>
                <h3 className={`text-xs font-bold line-clamp-1 mb-1.5 leading-snug ${selectedTicketId === t._id ? 'text-brand-400' : 'text-slate-200'}`}>{t.title}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">{t.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getPriorityBadge(t.priority)}
                    {getTierIndicator(t.customerTier)}
                  </div>
                  {t.assignedAgent ? (
                    <span className="text-[9px] text-brand-400 font-extrabold uppercase">
                       {t.assignedAgent.name}
                    </span>
                  ) : (
                    <span className="text-[9px] text-red-400 font-extrabold uppercase animate-pulse">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. MIDDLE PANEL: Active Ticket Support Desk */}
      <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden border-r border-slate-900">
        {activeTicket ? (
          <>
            {/* Horizontal Header */}
            <div className="p-4 border-b border-slate-900 bg-slate-950 flex items-center justify-between shrink-0 shadow-sm">
              <div>
                <h2 className="text-xs font-extrabold text-white leading-tight">{activeTicket.title}</h2>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span>Customer: <strong className="text-white">{activeTicket.customer?.name}</strong> ({activeTicket.customer?.email})</span>
                  <span>•</span>
                  {getTierIndicator(activeTicket.customerTier)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!activeTicket.assignedAgent ? (
                  <button
                    onClick={handleAssignToMe}
                    className="flex items-center gap-1 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 text-brand-400 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Assign to Me
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1 shadow-sm">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Assigned: {activeTicket.assignedAgent.name === user.name ? 'Me' : activeTicket.assignedAgent.name}
                  </span>
                )}
              </div>
            </div>

            {/* Chat message logs */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Customer original submit card */}
              <div className="flex gap-3 bg-slate-900/30 p-5 rounded-2xl border border-slate-900 shadow-inner">
                <div className="h-8.5 w-8.5 rounded-xl bg-indigo-500 text-white font-extrabold flex items-center justify-center shrink-0 shadow-md">
                  {activeTicket.customer?.name ? activeTicket.customer.name[0].toUpperCase() : 'C'}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-slate-200">{activeTicket.customer?.name}</span>
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase">Ticket Submitter</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 whitespace-pre-line leading-relaxed">{activeTicket.description}</p>
                  
                  {activeTicket.attachments && activeTicket.attachments.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {activeTicket.attachments.map((url, i) => (
                        <a
                          key={i}
                          href={url.startsWith('/') ? `http://localhost:5005${url}` : url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded px-2.5 py-1 hover:bg-brand-500/20 transition-colors"
                        >
                          <FileText className="h-4 w-4" />
                          <span>View attachment {i + 1}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat replies */}
              {isLoadingMessages ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
                </div>
              ) : (
                messages.map((m) => {
                  const isAgentSender = ['agent', 'admin'].includes(m.sender?.role);
                  return (
                    <div key={m._id} className={`flex gap-3 max-w-3xl ${isAgentSender ? 'ml-auto flex-row-reverse animate-fade-in' : ''}`}>
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0 shadow-sm ${isAgentSender ? 'bg-brand-600' : 'bg-indigo-500'}`}>
                        {m.sender?.name ? m.sender.name[0].toUpperCase() : 'U'}
                      </div>

                      <div className={`p-4 rounded-2xl shadow-premium border ${
                        m.isInternal
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-sm'
                          : isAgentSender 
                            ? 'bg-brand-600 text-white border-brand-700' 
                            : 'bg-slate-900/50 border border-slate-900 text-slate-300'
                      }`}>
                        <div className="flex items-baseline gap-4 mb-1 justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">{m.sender?.name}</span>
                            {m.isInternal && (
                              <span className="text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500 px-1 py-0.5 rounded">
                                Internal Private Note
                              </span>
                            )}
                          </div>
                          <span className={`text-[9px] font-mono ${isAgentSender && !m.isInternal ? 'text-brand-200' : 'text-slate-500'}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                                                <p className="text-xs leading-relaxed whitespace-pre-line">{m.message}</p>
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {m.attachments.map((url, idx) => (
                              <a
                                key={idx}
                                href={url.startsWith('/') ? `http://localhost:5005${url}` : url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded bg-slate-950/40 border border-slate-700/60 px-2 py-1 text-[9px] font-bold uppercase tracking-wide"
                              >
                                <Paperclip className="h-3 w-3" />
                                Attachment {idx + 1}
                              </a>
                            ))}
                          </div>
                        )}
                        {isAgentSender && !m.isInternal && (
                          <div className="mt-2 flex items-center justify-end gap-1 text-[9px] font-bold text-brand-100/80 uppercase tracking-wide">
                            <CheckCheck className="h-3.5 w-3.5" />
                            Seen by customer
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Send Console */}
            <div className="p-4 border-t border-slate-900 bg-slate-950 shrink-0 shadow-sm">
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  value={msgText}
                  onChange={(e) => setMsgText(e.target.value)}
                  rows={2}
                  placeholder={isInternal ? "Write internal private note (visible to agents only)..." : "Type response to customer..."}
                  className={`w-full rounded-xl border px-3.5 py-3 text-xs focus:outline-none transition-all shadow-inner ${
                    isInternal 
                      ? 'border-amber-500/20 bg-amber-500/5 text-amber-400 focus:border-amber-500' 
                      : 'border-slate-800 bg-slate-900/40 text-slate-200 focus:border-brand-500'
                  }`}
                />

                <div className="flex items-center justify-between rounded-xl border border-slate-900 bg-slate-900/30 px-3 py-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    <Radio className={`h-3.5 w-3.5 ${msgText ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
                    <span>{msgText ? 'Agent typing indicator active' : 'Live agent ready'}</span>
                  </div>
                  <label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-bold text-brand-400 uppercase tracking-wide">
                    <input type="file" className="hidden" onChange={(e) => setMsgAttachment(e.target.files[0])} />
                    <Paperclip className="h-3.5 w-3.5" />
                    {msgAttachment ? msgAttachment.name : 'Attach file'}
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <span className={isInternal ? 'text-amber-500 font-bold' : ''}>
                      Send as Private Agent Note
                    </span>
                  </label>

                  <button
                    type="submit"
                    className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer ${
                      isInternal ? 'bg-amber-600 hover:bg-amber-600 shadow-amber-500/20' : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/20'
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
            <HelpCircle className="h-16 w-16 text-slate-900 mb-3" />
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Support desk ready</h3>
            <p className="text-slate-600 text-xs max-w-xs mt-1.5 leading-relaxed">
              Select an incoming ticket from the left panel queue to review attributes, audit logging histories or activate AI drafts.
            </p>
          </div>
        )}
      </div>

      {/* 3. RIGHT PANEL: Controls, AI drafts, Department resolutions & Timelines */}
      <div className="w-80 border-l border-slate-900 bg-slate-950 flex flex-col h-full shrink-0 overflow-hidden">
        {activeTicket ? (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-900 h-full scrollbar-hide">
            
            <div className="p-4 space-y-3 bg-slate-950">
              <div className="flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-brand-400" />
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Support Journey Map
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['Customer', 'Live Agent', 'AI Suggestions', 'Chat History', 'Typing Indicator', 'Read Receipts', 'File Sharing', 'Feedback'].map((item) => (
                  <div key={item} className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Metadata Controls */}
            <div className="p-4 space-y-4">
              <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                Ticket Controls
              </h3>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Workflow Status
                </label>
                <select
                  value={activeTicket.status}
                  onChange={(e) => handleAttributeChange('status', e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-800 py-2 px-2.5 bg-slate-900 text-slate-300 outline-none focus:border-brand-500 shadow-sm"
                >
                  <option value="open">Open</option>
                  <option value="ai-reviewed">AI Reviewed</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="waiting-for-customer">Waiting for Customer</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  SLA Priority
                </label>
                <select
                  value={activeTicket.priority}
                  onChange={(e) => handleAttributeChange('priority', e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-800 py-2 px-2.5 bg-slate-900 text-slate-300 outline-none focus:border-brand-500 shadow-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Department Route
                </label>
                <select
                  value={activeTicket.department}
                  onChange={(e) => handleAttributeChange('department', e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-800 py-2 px-2.5 bg-slate-900 text-slate-300 outline-none focus:border-brand-500 shadow-sm"
                >
                  <option value="finance">Finance Department</option>
                  <option value="engineering">Engineering Department</option>
                  <option value="qa">QA Department</option>
                  <option value="product">Product Department</option>
                  <option value="support">General Support</option>
                </select>
              </div>

              {/* Sentiment */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Emotion Sentiment
                </label>
                <div className="w-full py-2 px-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
                  {getSentimentBadge(activeTicket.sentiment)}
                </div>
              </div>
            </div>

            {/* INTERACTIVE DEPARTMENT RESOLUTION CENTER */}
            <div className="p-4 space-y-3 bg-slate-950">
              <div className="flex items-center gap-1.5">
                <Building className="h-4 w-4 text-indigo-400" />
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Department Resolution Desk
                </h3>
              </div>

              <p className="text-[10px] text-slate-500 leading-normal">
                Trigger simulated backend tasks for {activeTicket.department.toUpperCase()} to automatically fix & resolve this issue.
              </p>

              {activeTicket.status === 'resolved' || activeTicket.status === 'closed' ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-center text-xs text-emerald-400 font-bold space-y-1">
                  <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                  <span>Issue Resolved successfully</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={executeDeptAction}
                    disabled={isActionExecuting}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] uppercase tracking-widest font-bold py-2.5 px-3 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isActionExecuting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                        <span>Running Diagnostics...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>
                          {activeTicket.department === 'finance' && "Execute Stripe Refund"}
                          {activeTicket.department === 'engineering' && "Restart AWS Gateway Port"}
                          {activeTicket.department === 'qa' && "Run Automation Tests"}
                          {activeTicket.department === 'product' && "Link Jira Feature Issue"}
                          {activeTicket.department === 'support' && "Resolve with Closed Notes"}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Terminal Console log Output */}
                  {actionLogs.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1 font-mono text-[9px] text-slate-300 shadow-inner max-h-36 overflow-y-auto">
                      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1 mb-1.5 text-slate-500 font-extrabold uppercase text-[8px]">
                        <Terminal className="h-3.5 w-3.5" />
                        <span>Diagnostic Console logs</span>
                      </div>
                      {actionLogs.map((log, idx) => (
                        <p key={idx} className="leading-relaxed animate-fade-in text-emerald-400">
                          {log}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Response Generator */}
            <div className="p-4 space-y-4 bg-slate-950">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-brand-400 animate-pulse" />
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  AI Response Drafting
                </h3>
              </div>

              <button
                type="button"
                onClick={triggerAISuggestions}
                disabled={isAiLoading}
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-lg hover:shadow-brand-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Ingesting Context...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-brand-200 animate-bounce" />
                    <span>Generate AI Suggestions</span>
                  </>
                )}
              </button>

              {aiDrafts && (
                <div className="rounded-xl bg-slate-900 border border-slate-800 p-3 space-y-3 shadow-inner">
                  {/* Tabs selector */}
                  <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                    {['direct', 'empathetic', 'technical'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveDraftTab(tab)}
                        className={`flex-1 py-1 text-[9px] font-extrabold uppercase rounded-md cursor-pointer transition-all ${
                          activeDraftTab === tab 
                            ? 'bg-slate-900 text-brand-400 shadow-sm font-extrabold' 
                            : 'text-slate-500 hover:text-slate-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Draft content */}
                  <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 border border-slate-900 rounded-lg p-3 max-h-36 overflow-y-auto whitespace-pre-wrap select-text font-sans">
                    {aiDrafts[activeDraftTab]}
                  </p>

                  <button
                    onClick={applyActiveDraft}
                    className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-brand-400 hover:text-brand-300 bg-slate-950 border border-slate-900 py-2 rounded-xl transition-all cursor-pointer shadow-sm hover:border-brand-500/20"
                  >
                    <span>Use Suggested Draft</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Audit Logs */}
            <div className="p-4 space-y-4 bg-slate-950">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-500" />
                <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Audit History logs
                </h3>
              </div>

              {isLoadingDetails ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                </div>
              ) : ticketAuditLogs.length === 0 ? (
                <p className="text-[10px] text-slate-500 italic">No logs recorded.</p>
              ) : (
                <div className="relative border-l border-slate-900 pl-4 ml-1.5 space-y-4 text-left">
                  {ticketAuditLogs.map((log) => (
                    <div key={log._id} className="relative">
                      <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-slate-800 border border-slate-950 shadow-sm" />
                      
                      <div className="flex items-center gap-1 font-mono text-[9px] font-bold text-slate-500 uppercase">
                        <span>{log.user?.name}</span>
                        <span>•</span>
                        <span>{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                        {log.details}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-slate-600 text-xs flex items-center justify-center h-full">
            No ticket metadata loaded.
          </div>
        )}
      </div>

    </div>
  );
}















