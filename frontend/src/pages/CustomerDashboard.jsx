import React, { useState, useEffect } from 'react';
import { useTickets } from '../hooks/useTickets';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Send, 
  FileText, 
  Loader2, 
  Image as ImageIcon, 
  Check, 
  Star, 
  CheckCircle, 
  HelpCircle, 
  AlertCircle,
  Sparkles,
  Zap,
  Crown,
  Paperclip,
  Clock,
  MessageSquare,
  Building,
  User,
  Heart,
  Bot,
  X,
  UserCheck
} from 'lucide-react';
import api from '../utils/api';
import { useQueryClient } from '@tanstack/react-query';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create ticket states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);

  // Send message states
  const [msgText, setMsgText] = useState('');
  const [msgAttachment, setMsgAttachment] = useState(null);

  // CSAT rating states
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isRatingSubmitting, setIsRatingSubmitting] = useState(false);
  const [isRatingDismissed, setIsRatingDismissed] = useState(false);

  // Live AI Reviewer preview state
  const [aiPreview, setAiPreview] = useState(null);

  // Fetch Tickets
  const { tickets, isLoadingTickets, createTicket, isCreatingTicket } = useTickets();

  // Fetch Messages
  const { messages, isLoadingMessages, sendMessage, isSendingMessage } = useMessages(selectedTicketId);

  const activeTicket = tickets.find((t) => t._id === selectedTicketId);

  useEffect(() => {
    setIsRatingDismissed(false);
  }, [selectedTicketId]);

  const getProfileInitials = (name = 'Support Agent') => {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'SA';
  };

  const getAgentBio = (agent, department) => {
    if (!agent) return `Waiting in ${department || 'support'} queue for an available specialist.`;
    const deptLabel = (department || 'support').replace('-', ' ');
    return `${deptLabel.charAt(0).toUpperCase() + deptLabel.slice(1)} specialist focused on fast diagnosis, clear updates, and complete resolution.`;
  };
  // Local helper to simulate AI classification in real time as user types
  useEffect(() => {
    if (!title && !description) {
      setAiPreview(null);
      return;
    }

    const text = `${title} ${description}`.toLowerCase();
    
    // Predict Sentiment (Emotion)
    let sentiment = 'neutral';
    let sentimentEmoji = '\uD83D\uDE10';
    if (text.includes('happy') || text.includes('great') || text.includes('thanks') || text.includes('perfect') || text.includes('love')) {
      sentiment = 'positive';
      sentimentEmoji = '\uD83D\uDE0A';
    } else if (text.includes('angry') || text.includes('worst') || text.includes('useless') || text.includes('scam') || text.includes('double charge') || text.includes('terrible') || text.includes('!!')) {
      sentiment = 'angry';
      sentimentEmoji = '\uD83D\uDE20';
    } else if (text.includes('delay') || text.includes('slow') || text.includes('waiting') || text.includes('crashed') || text.includes('broken') || text.includes('error') || text.includes('stuck')) {
      sentiment = 'frustrated';
      sentimentEmoji = '\uD83D\uDE1E';
    }

    // Predict Category & Department
    let category = 'general';
    let department = 'support';
    if (text.includes('pay') || text.includes('bill') || text.includes('invoice') || text.includes('charge') || text.includes('refund') || text.includes('subscription')) {
      category = 'billing';
      department = 'finance';
    } else if (text.includes('bug') || text.includes('crash') || text.includes('freeze') || text.includes('broken') || text.includes('error')) {
      category = 'bug';
      department = 'qa';
    } else if (text.includes('setup') || text.includes('api') || text.includes('integration') || text.includes('code') || text.includes('server') || text.includes('port')) {
      category = 'technical';
      department = 'engineering';
    } else if (text.includes('feature') || text.includes('suggest') || text.includes('improve') || text.includes('request')) {
      category = 'feature_request';
      department = 'product';
    }

    // Predict Priority and Auto-Escalate based on Tier
    const isUrgent = text.includes('urgent') || text.includes('immediate') || text.includes('critical') || text.includes('down') || text.includes('emergency') || text.includes('deadline');
    let priority = 'medium';
    let escalationMsg = '';

    const activeTier = user?.tier || 'free';
    if (activeTier === 'premium') {
      priority = (sentiment === 'angry' || sentiment === 'frustrated' || isUrgent) ? 'critical' : 'high';
      escalationMsg = "âœ¨ Premium Tier priority auto-escalation triggered!";
    } else if (activeTier === 'membership') {
      priority = (sentiment === 'angry' || sentiment === 'frustrated' || isUrgent) ? 'high' : 'medium';
      escalationMsg = "âš¡ Membership Tier priority boosted!";
    } else {
      priority = (sentiment === 'angry' || isUrgent) ? 'high' : 'medium';
    }

    setAiPreview({
      sentiment,
      sentimentEmoji,
      category,
      department,
      priority,
      escalationMsg
    });
  }, [title, description, user]);

  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (attachment) {
      formData.append('file', attachment);
    }

    try {
      const newTicket = await createTicket(formData);
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setAttachment(null);
      if (newTicket?._id) setSelectedTicketId(newTicket._id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessageSubmit = async (e) => {
    e.preventDefault();
    if (!msgText.trim() && !msgAttachment) return;

    const formData = new FormData();
    formData.append('ticketId', selectedTicketId);
    formData.append('message', msgText);
    if (msgAttachment) {
      formData.append('file', msgAttachment);
    }

    try {
      await sendMessage(formData);
      setMsgText('');
      setMsgAttachment(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCSATSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicketId) return;

    setIsRatingSubmitting(true);
    try {
      const { data } = await api.post(`/tickets/${selectedTicketId}/rate`, {
        rating,
        feedback: feedbackText,
      });
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['ticket', selectedTicketId] });
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
        setFeedbackText('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'open': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      'ai-reviewed': 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
      'assigned': 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      'in-progress': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      'waiting-for-customer': 'bg-pink-500/10 text-pink-400 border border-pink-500/20',
      'resolved': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      'closed': 'bg-slate-800 text-slate-400 border border-slate-700',
    };
    return (
      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${styles[status] || 'bg-slate-800'}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      'low': 'bg-slate-800 text-slate-400 border border-slate-700',
      'medium': 'bg-brand-500/10 text-brand-400 border border-brand-500/20',
      'high': 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      'critical': 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse',
    };
    return (
      <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border ${styles[priority]}`}>
        {priority}
      </span>
    );
  };

  const getSentimentEmoji = (sentiment) => {
    const emojis = {
      positive: '\uD83D\uDE0A Positive',
      neutral: '\uD83D\uDE10 Neutral',
      frustrated: '\uD83D\uDE1E Frustrated',
      angry: '\uD83D\uDE20 Urgent/Angry'
    };
    return emojis[sentiment] || '\uD83D\uDE10 Neutral';
  };


  const getWorkflowGuidance = (ticket) => {
    if (!ticket) return '';
    if (ticket.csatRating) return 'Feedback completed. This request is now fully closed from your side.';
    const guidance = {
      open: 'Request received. AI review is starting.',
      'ai-reviewed': `AI routed this to ${ticket.department?.toUpperCase()} department. An agent will pick it up next.`,
      assigned: `${ticket.assignedAgent?.name || 'Assigned agent'} is reviewing your request. Next step is in-progress work.`,
      'in-progress': `${ticket.assignedAgent?.name || 'Support agent'} is working on the solution now.`,
      'waiting-for-customer': 'Support needs one more detail from you before continuing.',
      resolved: 'Solution is marked resolved. Please submit feedback to complete the flow.',
      closed: 'Ticket is closed. Feedback is still visible if it was submitted.',
    };
    return guidance[ticket.status] || 'Support workflow is being updated.';
  };
  const renderTimeline = (currentStatus) => {
    const steps = [
      { key: 'open', label: 'Active' },
      { key: 'ai-reviewed', label: 'AI Reviewed' },
      { key: 'assigned', label: 'Assigned' },
      { key: 'in-progress', label: 'In Progress' },
      { key: 'resolved', label: 'Resolved' },
      { key: 'feedback', label: 'Feedback' },
    ];
    const currentIdx = activeTicket?.csatRating ? steps.findIndex((step) => step.key === 'feedback') : steps.findIndex((step) => step.key === currentStatus);

    return (
      <div className="border-b border-slate-900 bg-gradient-to-r from-slate-50 via-sky-50 to-teal-50 px-6 py-5 shadow-sm shrink-0">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx || (currentStatus === 'closed' && step.key !== 'feedback');
            const isActive = currentStatus === step.key || (activeTicket?.csatRating && step.key === 'feedback');

            return (
              <div
                key={step.key}
                className={`min-h-[74px] rounded-xl border px-3 py-3 shadow-sm transition-all ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : isActive
                      ? 'border-brand-300 bg-gradient-to-br from-white to-sky-50 text-brand-700 ring-2 ring-brand-100'
                      : 'border-slate-200 bg-white/80 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                    isCompleted ? 'bg-emerald-600 text-white' : isActive ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                  </span>
                  <span className="text-[12px] font-extrabold uppercase leading-tight tracking-wide">
                    {step.label}
                  </span>
                </div>
                <p className="mt-2 text-[11px] font-semibold leading-snug opacity-80">
                  {isCompleted ? 'Completed' : isActive ? 'Current step' : 'Pending'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-readable flex h-[calc(100vh-4rem)] bg-slate-950 text-slate-200 overflow-hidden font-sans select-none">
      
      {/* LEFT COLUMN: Queue List */}
      <div className="w-80 sm:w-96 border-r border-slate-900 bg-slate-950 flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-900 flex justify-between items-center bg-slate-950">
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wide uppercase">My Support Queue</h1>
            <p className="text-[10px] text-slate-500 font-bold mt-0.5">{tickets.length} ACTIVE REQUESTS</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2.5 rounded-xl shadow-md hover:shadow-brand-500/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Raise Ticket
          </button>
        </div>

        {/* Tickets queue list scroll */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60">
          {isLoadingTickets ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-5 w-5 text-brand-500 animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs leading-relaxed space-y-2">
              <MessageSquare className="h-8 w-8 text-slate-700 mx-auto" />
              <p>No tickets raised yet. Click "Raise Ticket" to ask support.</p>
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t._id}
                onClick={() => setSelectedTicketId(t._id)}
                className={`p-4 cursor-pointer transition-all border-l-4 ${
                  selectedTicketId === t._id 
                    ? 'bg-slate-900/50 border-brand-500 shadow-sm' 
                    : 'border-transparent hover:bg-slate-900/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className={`text-xs font-bold line-clamp-1 flex-1 leading-snug ${selectedTicketId === t._id ? 'text-brand-400' : 'text-slate-200'}`}>
                    {t.title}
                  </h3>
                  {getStatusBadge(t.status)}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                  {t.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {getPriorityBadge(t.priority)}
                    <span className="inline-flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      {t.department}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase">
                    {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Ticket Details Workspace */}
      <div className="flex-1 bg-slate-950 flex flex-col h-full overflow-hidden">
        {activeTicket ? (
          <>
            {/* Horizontal Timeline */}
            {renderTimeline(activeTicket.status)}
            <div className="border-b border-slate-900 bg-teal-50 px-6 py-3 text-xs font-bold text-teal-900">
              {getWorkflowGuidance(activeTicket)}
            </div>

            {/* Header info */}
            <div className="px-6 py-4 border-b border-slate-900 bg-slate-950 flex justify-between items-center shrink-0 shadow-sm">
              <div>
                <h2 className="text-sm font-extrabold text-white leading-tight">{activeTicket.title}</h2>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>ID: {activeTicket._id.substring(activeTicket._id.length - 8)}</span>
                  <span>â€¢</span>
                  <span>Category: {activeTicket.category}</span>
                  <span>â€¢</span>
                  <span className="flex items-center gap-1 text-slate-400 font-extrabold">
                    <Building className="h-3 w-3 text-brand-400" />
                    <span>Dept: {activeTicket.department}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wide">Emotion:</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-sm ${
                  activeTicket.sentiment === 'angry' 
                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                    : activeTicket.sentiment === 'frustrated' 
                      ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' 
                      : activeTicket.sentiment === 'positive'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}>
                  {getSentimentEmoji(activeTicket.sentiment)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 border-b border-slate-900 bg-gradient-to-r from-sky-50 via-white to-teal-50 px-6 py-4 lg:grid-cols-2">
              <div className="rounded-xl border border-teal-100 bg-teal-50 p-4">
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-teal-700">
                  <Building className="h-4 w-4" />
                  AI Routing
                </div>
                <p className="mt-2 text-sm font-extrabold text-slate-900">{activeTicket.department?.toUpperCase()} Department</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Category: {activeTicket.category} · Priority: {activeTicket.priority}. Your request is visible in the agent queue for this department.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-teal-500 text-sm font-extrabold text-white shadow-sm">
                    {getProfileInitials(activeTicket.assignedAgent?.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                      <UserCheck className="h-3.5 w-3.5 text-brand-500" />
                      Assigned Agent
                    </div>
                    <p className="mt-1 text-sm font-extrabold text-slate-900">
                      {activeTicket.assignedAgent?.name || 'Waiting for assignment'}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      {getAgentBio(activeTicket.assignedAgent, activeTicket.department)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Conversation History thread */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Customer original ticket submit content */}
              <div className="flex gap-3 bg-slate-900/30 p-5 rounded-2xl border border-slate-900 shadow-inner max-w-3xl">
                <div className="h-8.5 w-8.5 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center shrink-0 shadow-md">
                  {activeTicket.customer?.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-slate-200">{activeTicket.customer?.name}</span>
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase">Ticket Requestor</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 whitespace-pre-line leading-relaxed">{activeTicket.description}</p>
                  
                  {/* Attachments view */}
                  {activeTicket.attachments && activeTicket.attachments.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {activeTicket.attachments.map((url, i) => (
                        <a
                          key={i}
                          href={url.startsWith('/') ? `http://localhost:5005${url}` : url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-lg px-3 py-1.5 hover:bg-brand-500/20 transition-all shadow-sm"
                        >
                          <FileText className="h-3.5 w-3.5" />
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
                  const isUserSender = m.sender?._id === user?.id;
                  const isInternalNote = m.isInternal;

                  // Skip internal notes in customer dashboard for safety/security
                  if (isInternalNote) return null;

                  return (
                    <div key={m._id} className={`flex gap-3 max-w-3xl ${isUserSender ? 'animate-fade-in' : 'ml-auto flex-row-reverse animate-fade-in'}`}>
                      <div className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0 shadow-sm ${
                        isUserSender ? 'bg-indigo-600' : 'bg-brand-600'
                      }`}>
                        {m.sender?.name[0].toUpperCase()}
                      </div>
                      
                      <div className={`p-4 rounded-2xl shadow-premium border ${
                        isUserSender 
                          ? 'bg-slate-900/50 border-slate-900 text-slate-300' 
                          : 'bg-brand-600 text-white border-brand-700'
                      }`}>
                        <div className="flex items-baseline gap-4 mb-1 justify-between">
                          <span className="text-xs font-bold">{m.sender?.name}</span>
                          <span className={`text-[9px] font-mono ${isUserSender ? 'text-slate-500' : 'text-brand-100'}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-line">{m.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input / CSAT Ratings Area */}
            <div className="p-4 border-t border-slate-900 bg-slate-950 shrink-0">
              {['resolved', 'closed'].includes(activeTicket.status) ? (
                <div className="bg-slate-900/20 p-6 rounded-2xl border border-slate-900 text-center space-y-4 max-w-2xl mx-auto shadow-sm">
                  {activeTicket.csatRating ? (
                    <div className="flex flex-col items-center py-4 space-y-2 animate-fade-in">
                      <CheckCircle className="h-10 w-10 text-emerald-500" />
                      <h3 className="text-sm font-bold text-slate-200">Support Satisfaction Feedback Submitted</h3>
                      <div className="flex items-center gap-1.5 my-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-5 w-5 ${s <= activeTicket.csatRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                          />
                        ))}
                      </div>
                      {activeTicket.csatFeedbackSentiment && (
                        <span className="rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-400">
                          AI feedback sentiment: {activeTicket.csatFeedbackSentiment}
                        </span>
                      )}
                      {activeTicket.csatFeedback && (
                        <p className="text-xs text-slate-400 italic bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl shadow-sm">
                          "{activeTicket.csatFeedback}"
                        </p>
                      )}
                    </div>
                  ) : isRatingDismissed ? (
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">Feedback pending</h3>
                        <p className="mt-0.5 text-xs text-slate-600">Your request is resolved. You can submit rating anytime.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsRatingDismissed(false)}
                        className="rounded-lg bg-brand-600 px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm hover:bg-brand-500"
                      >
                        Rate Now
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCSATSubmit} className="relative space-y-4">
                      <button
                        type="button"
                        onClick={() => setIsRatingDismissed(true)}
                        className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                        aria-label="Dismiss rating box"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="pr-10">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Help Us Improve</h3>
                        <p className="text-[11px] text-slate-600 mt-1">Please rate the solution provided for this request.</p>
                      </div>

                      {/* Stars selection */}
                      <div className="flex justify-center items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="cursor-pointer transition-transform duration-100 hover:scale-110"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                star <= (hoverRating || rating)
                                  ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.2)]'
                                  : 'text-slate-700'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      {/* Optional feedback text */}
                      <div className="space-y-3">
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Write a brief comment about the solution (optional)..."
                          rows={2}
                          className="w-full rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-xs text-slate-300 placeholder-slate-500 focus:border-brand-500 focus:outline-none shadow-sm"
                        />
                        <button
                          type="submit"
                          disabled={isRatingSubmitting}
                          className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-xl shadow transition-all cursor-pointer disabled:opacity-60"
                        >
                          {isRatingSubmitting ? 'Submitting...' : 'Submit Rating'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSendMessageSubmit} className="flex items-center gap-3 max-w-4xl mx-auto">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      placeholder="Type your message reply to support..."
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 py-3.5 pl-4 pr-12 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                    />
                    
                    {/* Attachment selection trigger */}
                    <label className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setMsgAttachment(e.target.files[0])}
                      />
                      <Paperclip className={`h-4.5 w-4.5 ${msgAttachment ? 'text-brand-400' : ''}`} />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingMessage || (!msgText.trim() && !msgAttachment)}
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-md hover:shadow-brand-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingMessage ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <Send className="h-4.5 w-4.5" />
                    )}
                  </button>
                </form>
              )}
              {msgAttachment && (
                <div className="flex items-center gap-1.5 max-w-4xl mx-auto mt-2 text-[10px] text-brand-400 font-bold bg-brand-500/10 border border-brand-500/20 rounded-lg px-2 py-1">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Selected Attachment: {msgAttachment.name}</span>
                  <button onClick={() => setMsgAttachment(null)} className="text-red-400 hover:text-red-500 ml-auto cursor-pointer">Remove</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center p-8 text-center text-slate-500 bg-slate-950">
            <Bot className="h-16 w-16 text-slate-800 animate-float mb-4" />
            <h3 className="text-base font-bold text-slate-300">Support Workspace Ready</h3>
            <p className="text-xs text-slate-500 max-w-md mt-1.5 leading-relaxed">
              Select an active ticket from the left panel queue, or click <strong className="text-brand-400">Raise Ticket</strong> to generate a new AI query.
            </p>
          </div>
        )}
      </div>

      {/* CREATE TICKET MODAL WINDOW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-premium-lg w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                  CD
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wide">Raise AI Assisted Ticket</h2>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">SUPPORTDESK AI PRIORITIZES AND PRE-DRAFTS INSTANTLY</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Modal Body: Form (Left) & Real-time AI reviewer (Right) */}
            <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-slate-900">
              
              {/* Form Section */}
              <form onSubmit={handleCreateTicketSubmit} className="lg:col-span-7 space-y-4">
                <div>
                  <label htmlFor="modal-title" className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                    Ticket Subject Title
                  </label>
                  <input
                    id="modal-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Briefly state the support query..."
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 py-3 px-4 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label htmlFor="modal-desc" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    Detailed Support Description
                  </label>
                  <textarea
                    id="modal-desc"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="Provide full context, including account details or any error codes (e.g. EADDRINUSE)..."
                    className="block w-full rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-xs text-slate-200 placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                    Upload Attachment (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 border border-slate-800 hover:bg-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 bg-slate-950/50 cursor-pointer shadow-sm">
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setAttachment(e.target.files[0])}
                      />
                      <Paperclip className="h-4 w-4" />
                      <span>{attachment ? attachment.name : 'Select file'}</span>
                    </label>
                    {attachment && (
                      <button 
                        type="button" 
                        onClick={() => setAttachment(null)}
                        className="text-xs font-bold text-red-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isCreatingTicket || !title || !description}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg hover:shadow-brand-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingTicket ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Submit Ticket</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Real-time AI reviewer panel */}
              <div className="lg:col-span-5 bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Bot className="h-5 w-5 text-indigo-400 animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Live AI Routing Reviewer</span>
                </div>

                {aiPreview ? (
                  <div className="space-y-4 animate-fade-in font-mono text-[11px]">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                        <span className="text-slate-500">Emotion Sentiment</span>
                        <span className={`font-bold uppercase ${
                          aiPreview.sentiment === 'angry' ? 'text-red-400' : aiPreview.sentiment === 'frustrated' ? 'text-orange-400' : 'text-slate-400'
                        }`}>
                          {aiPreview.sentimentEmoji} {aiPreview.sentiment}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                        <span className="text-slate-500">Predicted Category</span>
                        <span className="text-indigo-400 font-bold uppercase">{aiPreview.category}</span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                        <span className="text-slate-500">Target Department</span>
                        <span className="text-brand-400 font-bold uppercase">{aiPreview.department}</span>
                      </div>

                      <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                        <span className="text-slate-500">Priority Level</span>
                        <span className={`font-bold uppercase ${
                          aiPreview.priority === 'critical' ? 'text-red-400 animate-pulse' : aiPreview.priority === 'high' ? 'text-orange-400' : 'text-slate-400'
                        }`}>
                          {aiPreview.priority}
                        </span>
                      </div>
                    </div>

                    {aiPreview.escalationMsg && (
                      <div className="bg-indigo-950/20 border border-indigo-900/50 p-3.5 rounded-xl text-indigo-300 flex items-start gap-2 shadow-inner">
                        <Heart className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="leading-relaxed text-[10px] font-sans font-bold">{aiPreview.escalationMsg}</p>
                      </div>
                    )}

                    <p className="text-[9px] text-slate-500 font-sans leading-relaxed">
                      *This preview updates dynamically. When submitted, our AI agent will route this ticket to the assigned leads.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-700 space-y-2">
                    <HelpCircle className="h-8 w-8 text-slate-800 mx-auto" />
                    <p className="text-xs font-sans">Start typing the ticket details to view real-time AI classifications.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}














