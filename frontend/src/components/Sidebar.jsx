import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Inbox, BookOpen, BarChart3, Sparkles, Activity, CircleHelp } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const isAgent = user?.role === 'agent' || user?.role === 'admin';
  const base = 'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200';
  const navStyle = ({ isActive }) => isActive
    ? `${base} bg-white text-slate-900 shadow-sm`
    : `${base} text-slate-300 hover:bg-white/10 hover:text-white`;

  return (
    <aside className="w-72 shrink-0 border-r border-slate-800 bg-[#0a1630] px-4 py-5 text-white">
      <div className="flex h-full flex-col">
        <div className="mb-7 rounded-2xl border border-white/10 bg-gradient-to-br from-sky-400/15 to-indigo-400/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-sky-200"><Sparkles className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-[0.16em]">AI workspace</span></div>
          <p className="text-sm font-semibold leading-5 text-white">Every request is assessed for urgency, sentiment and SLA risk.</p>
        </div>

        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
        <div className="space-y-1">
          <NavLink to="/" end className={navStyle}>
            <Inbox className="h-5 w-5" /><span>{isAgent ? 'Resolution desk' : 'My support requests'}</span>
          </NavLink>
          <NavLink to="/kb" className={navStyle}>
            <BookOpen className="h-5 w-5" /><span>Knowledge hub</span>
          </NavLink>
        </div>

        {isAgent && <>
          <p className="mb-2 mt-7 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Leadership</p>
          <NavLink to="/manager" className={navStyle}>
            <BarChart3 className="h-5 w-5" /><span>Command center</span>
          </NavLink>
        </>}

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white"><Activity className="h-4 w-4 text-emerald-400" />All systems operational</div>
          <p className="mt-1 text-xs leading-5 text-slate-400">AI triage and secure ticket workflows are online.</p>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-sky-300"><CircleHelp className="h-4 w-4" />Need help? Open Knowledge Hub</div>
        </div>
      </div>
    </aside>
  );
}
