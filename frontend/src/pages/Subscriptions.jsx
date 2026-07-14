import React from 'react';
import { ArrowLeft, Check, CreditCard, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const planDetails = {
  premium: {
    product: 'SupportDesk One',
    plan: 'SupportDesk AI Plus (400 GB)',
    nextPayment: 'Next payment: Rs.100.00 on Aug 8, 2026',
    benefits: [
      'Expanded storage across tickets, attachments, and history',
      'Direct support from SupportDesk experts',
      'Exclusive premium member benefits',
    ],
    accent: 'from-amber-500 to-rose-500',
  },
  membership: {
    product: 'SupportDesk One',
    plan: 'SupportDesk Member Plus',
    nextPayment: 'Next payment: Rs.49.00 on Aug 8, 2026',
    benefits: [
      'Priority support queue routing',
      'Direct support from SupportDesk experts',
      'Exclusive member benefits',
    ],
    accent: 'from-teal-500 to-sky-500',
  },
  free: {
    product: 'SupportDesk One',
    plan: 'SupportDesk Free',
    nextPayment: 'No active paid renewal',
    benefits: [
      'Access to support tickets and replies',
      'Knowledge base support articles',
      'Basic AI ticket classification',
    ],
    accent: 'from-slate-500 to-slate-700',
  },
};

export default function Subscriptions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const activePlan = planDetails[user?.tier || 'free'] || planDetails.free;

  return (
    <div className="min-h-full overflow-y-auto bg-white text-neutral-900">
      <div className="mx-auto w-full max-w-3xl px-6 py-8 sm:px-10 lg:px-14">
        <header className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100"
            aria-label="Go back"
          >
            <ArrowLeft className="h-7 w-7" />
          </button>
          <h1 className="text-4xl font-normal tracking-normal text-neutral-950">Subscriptions</h1>
        </header>

        <section className="mt-12 max-w-2xl">
          <p className="text-2xl leading-snug text-neutral-700">
            SupportDesk may share subscription data that does not personally identify you with support teams to help them offer subscriptions.
          </p>
          <button type="button" className="mt-1 text-left text-2xl leading-snug text-neutral-700 underline underline-offset-2">
            Learn more about subscriptions
          </button>
        </section>

        <section className="mt-20">
          <h2 className="text-4xl font-normal tracking-normal text-neutral-950">Active</h2>

          <div className="mt-12 flex items-start justify-between gap-8">
            <div>
              <h3 className="text-2xl font-semibold text-neutral-950">{activePlan.product}</h3>
              <p className="mt-1 text-2xl leading-snug text-neutral-700">{activePlan.plan}</p>
              <p className="text-2xl leading-snug text-neutral-700">{activePlan.nextPayment}</p>
            </div>

            <div className={`mt-2 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${activePlan.accent} text-white shadow-sm`}>
              <Sparkles className="h-8 w-8" />
            </div>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-3xl font-semibold tracking-normal text-neutral-800">Your plan includes</h2>
          <ul className="mt-5 space-y-5">
            {activePlan.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-4 text-2xl leading-snug text-neutral-700">
                <Check className="mt-1 h-7 w-7 shrink-0 text-neutral-700" strokeWidth={1.8} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 rounded-lg border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex items-center gap-3 text-neutral-800">
            <CreditCard className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">Billing status</span>
          </div>
          <p className="mt-2 text-base leading-7 text-neutral-600">
            This page shows the active subscription linked to {user?.email || 'your account'}.
          </p>
        </section>
      </div>
    </div>
  );
}

