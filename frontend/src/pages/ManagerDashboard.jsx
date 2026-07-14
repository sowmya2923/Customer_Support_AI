import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Star, 
  Loader2, 
  Activity, 
  Flame, 
  AlertCircle,
  RefreshCw,
  Zap,
  Crown,
  Layers,
  Bot,
  Trophy,
  CheckCircle,
  BrainCircuit,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

export default function ManagerDashboard() {
  
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['managerAnalytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics');
      return data;
    },
    refetchInterval: 30000,
  });

  const getSentimentEmoji = (sentiment) => {
    const emojis = {
      'positive': '\uD83D\uDE0A',
      'neutral': '\uD83D\uDE10',
      'frustrated': '\uD83D\uDE1E',
      'angry': '\uD83D\uDE20'
    };
    return emojis[sentiment] || '\uD83D\uDE10';
  };

  const getSentimentColor = (sentiment) => {
    const colors = {
      'positive': 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
      'neutral': 'bg-slate-500 shadow-sm',
      'frustrated': 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
      'angry': 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse'
    };
    return colors[sentiment] || 'bg-slate-400';
  };

  const getTierColor = (tier) => {
    const colors = {
      'premium': 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
      'membership': 'bg-gradient-to-r from-brand-500 to-indigo-500 shadow-[0_0_10px_rgba(12,141,231,0.2)]',
      'free': 'bg-slate-600 shadow-sm'
    };
    return colors[tier] || 'bg-slate-400';
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-slate-950 h-[calc(100vh-4rem)] flex items-center justify-center flex-col">
        <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
        <h3 className="text-white font-extrabold uppercase tracking-wider">Failed to sync stats</h3>
        <p className="text-slate-500 text-xs mt-1">Please ensure your database connection is active and try again.</p>
        <button 
          onClick={() => refetch()} 
          className="mt-4 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { metrics, auditLogs } = data;
  const topAgents = metrics.topAgents || [];

  // Safe fallback if tierDistribution doesn't exist
  const tierDistribution = metrics.tierDistribution || { free: 0, membership: 0, premium: 0 };

  const getPercentage = (count, total) => {
    if (!total) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <div className="dashboard-readable flex-grow p-6 bg-slate-950 text-slate-300 overflow-y-auto h-[calc(100vh-4rem)] select-none">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-base font-extrabold text-white uppercase tracking-wider">Performance Analytics Desk</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            SLA parameters monitoring, average CSAT logs, and platform activity timelines.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Sync Desk</span>
        </button>
      </div>

      {/* Resolution Radar: turns support data into a clear, interview-ready priority story. */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-slate-900 p-5 shadow-premium animate-fade-in-up">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300"><BrainCircuit className="h-5 w-5" /></div>
            <div>
              <div className="flex items-center gap-2"><h2 className="text-sm font-extrabold text-white">AI Resolution Radar</h2><span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-cyan-300">Live intelligence</span></div>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400">SupportDesk scores urgency, customer sentiment, account tier and SLA exposure togetherÃ¢â‚¬â€then makes the routing reason visible to agents and managers.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 px-4 py-2"><p className="text-lg font-black text-white">{metrics.openTickets || 0}</p><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Needs focus</p></div>
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 px-4 py-2"><p className="text-lg font-black text-emerald-400">{metrics.customerSatisfactionPct || 0}%</p><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Trust signal</p></div>
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 px-4 py-2"><p className="text-lg font-black text-cyan-300">{metrics.aiUsageCount || 0}</p><p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">AI assists</p></div>
          </div>
        </div>
      </section>
      {/* 1. METRIC TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
        
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-premium">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Total Workload</span>
            <span className="text-2xl font-black text-white leading-none block">{metrics.totalTickets}</span>
            <span className="text-[10px] text-slate-500 font-bold block">{metrics.openTickets} UNRESOLVED</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center shrink-0 shadow-sm">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-premium">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">CSAT Rating</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white leading-none">{metrics.averageCsat || '0.0'}</span>
              <span className="text-[10px] text-slate-500 font-bold">/ 5.0</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold block">FROM {metrics.totalRatingsCount} RATINGS</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-sm">
            <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-premium">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Avg SLA Resolution</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white leading-none">{metrics.averageSlaHours}</span>
              <span className="text-[10px] text-slate-500 font-bold">hours</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold block"> WITHIN SLA TARGETS</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 shadow-sm">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-premium">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Resolved Volume</span>
            <span className="text-2xl font-black text-white leading-none block">{metrics.resolvedTickets + metrics.closedTickets}</span>
            <span className="text-[10px] text-slate-500 font-bold block">ALL-TIME ARCHIVE</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
            <Activity className="h-5 w-5" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-premium flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">AI Usage</span>
            <span className="text-2xl font-black text-white leading-none block">{metrics.aiUsageCount || 0}</span>
            <span className="text-[10px] text-slate-500 font-bold block">CLASSIFIED / DRAFTED TICKETS</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center shrink-0 shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-premium flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Customer Satisfaction</span>
            <span className="text-2xl font-black text-white leading-none block">{metrics.customerSatisfactionPct || 0}%</span>
            <span className="text-[10px] text-slate-500 font-bold block">4-5 STAR FEEDBACK RATE</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-premium">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4.5 w-4.5 text-amber-400" />
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Top Agents</span>
          </div>
          <div className="space-y-2">
            {topAgents.length === 0 ? (
              <p className="text-xs text-slate-500">No resolved assigned tickets yet.</p>
            ) : (
              topAgents.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between rounded-xl bg-slate-950 border border-slate-800 px-3 py-2">
                  <span className="text-xs font-bold text-slate-200">{agent.name}</span>
                  <span className="text-[10px] font-bold text-slate-500">{agent.resolvedCount} resolved Ã‚Â· {agent.avgCsat || 0}/5</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {/* 2. SENTIMENT, DEPARTMENTS & MEMBER TIER CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
        
        {/* Sentiment Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-premium space-y-6">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Flame className="h-4.5 w-4.5 text-orange-400" />
            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Customer Sentiment
            </h3>
          </div>

          <div className="space-y-4">
            {Object.keys(metrics.sentimentDistribution).map((sent) => {
              const count = metrics.sentimentDistribution[sent];
              const pct = getPercentage(count, metrics.totalTickets);
              
              return (
                <div key={sent} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold capitalize text-slate-200 flex items-center gap-1.5">
                      <span>{getSentimentEmoji(sent)}</span>
                      <span>{sent}</span>
                    </span>
                    <span className="text-slate-500 font-bold font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${getSentimentColor(sent)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Department load breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-premium space-y-6">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Users className="h-4.5 w-4.5 text-brand-400" />
            <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              Department Load Share
            </h3>
          </div>

          <div className="space-y-4">
            {Object.keys(metrics.departmentDistribution).map((dept) => {
              const count = metrics.departmentDistribution[dept];
              const pct = getPercentage(count, metrics.totalTickets);

              return (
                <div key={dept} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold capitalize text-slate-200">
                      {dept} Unit
                    </span>
                    <span className="text-slate-500 font-bold font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                    <div 
                      className="h-full bg-brand-500 shadow-[0_0_10px_rgba(12,141,231,0.2)] rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workload by Customer Tier */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-premium space-y-6">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Layers className="h-4.5 w-4.5 text-indigo-400" />
            <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
              Workload by Customer Tier
            </h3>
          </div>

          <div className="space-y-4">
            {Object.keys(tierDistribution).map((tierKey) => {
              const count = tierDistribution[tierKey];
              const pct = getPercentage(count, metrics.totalTickets);
              const displayName = tierKey === 'free' ? 'Free Tier' : tierKey === 'membership' ? 'Member' : 'Premium';

              return (
                <div key={tierKey} className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold capitalize text-slate-200 flex items-center gap-1.5">
                      {tierKey === 'premium' && <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                      {tierKey === 'membership' && <Zap className="h-3.5 w-3.5 text-brand-500 fill-brand-500" />}
                      <span>{displayName}</span>
                    </span>
                    <span className="text-slate-500 font-bold font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${getTierColor(tierKey)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. PLATFORM AUDIT TRAILS */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-premium space-y-5 animate-fade-in-up">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Activity className="h-4.5 w-4.5 text-slate-400" />
          <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
            Global Activity Audit Timeline
          </h3>
        </div>

        <div className="overflow-x-auto select-text">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 uppercase font-extrabold bg-slate-950/40 font-mono text-[9px] tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Target Ticket</th>
                <th className="py-3 px-4">Action details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">No operations recorded yet.</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-950/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[9.5px] text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">{log.user?.name}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center rounded bg-slate-800 border border-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider shadow-sm">
                        {log.user?.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-300 truncate max-w-xs">{log.ticket?.title || 'System'}</td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-indigo-400 font-bold">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}





