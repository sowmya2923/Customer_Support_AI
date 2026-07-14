import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, HelpCircle, Crown, Zap, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const tier = user?.tier === 'premium' ? { label: 'Premium', icon: Crown, cls: 'bg-amber-100 text-amber-800 border-amber-200' }
    : user?.tier === 'membership' ? { label: 'Member', icon: Zap, cls: 'bg-sky-100 text-sky-800 border-sky-200' }
    : { label: user?.role === 'admin' ? 'Manager' : user?.role === 'agent' ? 'Support agent' : 'Customer', icon: ShieldCheck, cls: 'bg-slate-100 text-slate-700 border-slate-200' };
  const TierIcon = tier.icon;
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur-xl">
      <div className="flex h-[72px] items-center justify-between px-5 sm:px-7">
        <Link to="/" className="flex items-center gap-3"><span className="brand-mark brand-mark-xs">SD</span><span className="text-xl font-extrabold tracking-tight text-slate-900">SupportDesk<span className="text-sky-600">.ai</span></span><span className="hidden rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-700 sm:inline">AI support operations</span></Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 md:flex"><Sparkles className="h-3.5 w-3.5" />AI triage active</div>
          <Link to="/kb" className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900" title="Knowledge Hub"><HelpCircle className="h-5 w-5" /></Link>
          {user && <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:pl-4"><div className="hidden text-right sm:block"><p className="text-sm font-bold text-slate-900">{user.name}</p><span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${tier.cls}`}><TierIcon className="h-3 w-3" />{tier.label}</span></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold text-white shadow-sm">{user.name?.[0]?.toUpperCase()}</div><button onClick={logout} className="rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600" title="Sign out"><LogOut className="h-5 w-5" /></button></div>}
        </div>
      </div>
    </nav>
  );
}
