import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Pause,
  Play,
  Plus,
  Repeat,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PaymentMethod, Subscription } from '../types';
import { formatCurrency, PAYMENT_METHOD_BADGES } from '../utils/formatters';

interface SubscriptionTrackerProps {
  subscriptions: Subscription[];
  onAddSubscription: (sub: Omit<Subscription, 'id'>) => void;
  onDeleteSubscription: (id: string) => void;
  onToggleSubscription: (id: string) => void;
  currencySymbol?: string;
}

const PRESET_SUBS = [
  { name: 'Netflix', amount: 649, category: 'Entertainment', icon: '🎬' },
  { name: 'Spotify', amount: 149, category: 'Entertainment', icon: '🎵' },
  { name: 'YouTube Premium', amount: 129, category: 'Entertainment', icon: '▶️' },
  { name: 'Gym Membership', amount: 1500, category: 'Healthcare', icon: '🏋️' },
  { name: 'Google One / iCloud', amount: 130, category: 'Bills', icon: '☁️' },
  { name: 'Amazon Prime', amount: 299, category: 'Shopping', icon: '📦' },
];

export const SubscriptionTracker: React.FC<SubscriptionTrackerProps> = ({
  subscriptions,
  onAddSubscription,
  onDeleteSubscription,
  onToggleSubscription,
  currencySymbol = '₹',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  // Calculations
  const activeSubs = subscriptions.filter((s) => s.active);
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    return sum + (s.billingCycle === 'monthly' ? s.amount : s.amount / 12);
  }, 0);
  const yearlyTotal = monthlyTotal * 12;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !name.trim() || !nextPaymentDate) return;

    onAddSubscription({
      name: name.trim(),
      amount: num,
      billingCycle,
      nextPaymentDate,
      category,
      paymentMethod,
      active: true,
    });

    setName('');
    setAmount('');
    setNextPaymentDate('');
    setShowAddModal(false);
  };

  const applyPreset = (preset: typeof PRESET_SUBS[0]) => {
    setName(preset.name);
    setAmount(preset.amount.toString());
    setCategory(preset.category);
    const today = new Date();
    today.setDate(today.getDate() + 15);
    setNextPaymentDate(today.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white md:text-xl">
            Recurring Subscriptions Audit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit your silent recurring cash outflows and manage ongoing plans
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subscription</span>
        </motion.button>
      </div>

      {/* Smart Financial Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 via-orange-50/50 to-amber-50/70 p-5 shadow-xs dark:border-amber-900/40 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20"
      >
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/20">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Annual Subscription Impact
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white md:text-base">
                You are spending {formatCurrency(yearlyTotal, currencySymbol)}/year on active subscriptions.
              </h3>
              <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                That equates to roughly {formatCurrency(monthlyTotal, currencySymbol)} every single month across {activeSubs.length} recurring accounts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-200/80 bg-white/90 px-4 py-2 text-center dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-bold text-slate-400 block">Monthly Run-rate</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {formatCurrency(monthlyTotal, currencySymbol)}
              </span>
            </div>
            <div className="rounded-xl border border-amber-200/80 bg-white/90 px-4 py-2 text-center dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] font-bold text-slate-400 block">Yearly Total</span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400">
                {formatCurrency(yearlyTotal, currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {subscriptions.map((sub, idx) => {
            const nextDate = new Date(sub.nextPaymentDate);
            const today = new Date();
            const diffDays = Math.ceil(
              (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            const pBadge = PAYMENT_METHOD_BADGES[sub.paymentMethod];

            return (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.22, delay: Math.min(idx * 0.03, 0.2) }}
                whileHover={{ y: -2 }}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 shadow-2xs transition-all ${
                  sub.active
                    ? 'border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900'
                    : 'border-slate-200/50 bg-slate-50/50 opacity-60 dark:border-slate-800/40 dark:bg-slate-900/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-xl dark:bg-violet-950/50">
                        {sub.name.toLowerCase().includes('netflix') && '🎬'}
                        {sub.name.toLowerCase().includes('spotify') && '🎵'}
                        {sub.name.toLowerCase().includes('youtube') && '▶️'}
                        {sub.name.toLowerCase().includes('gym') && '🏋️'}
                        {sub.name.toLowerCase().includes('cloud') || sub.name.toLowerCase().includes('google') ? '☁️' : ''}
                        {!['netflix', 'spotify', 'youtube', 'gym', 'cloud', 'google'].some((k) =>
                          sub.name.toLowerCase().includes(k)
                        ) && '📱'}
                      </span>
                      <div>
                        <h4 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-white">
                          {sub.name}
                        </h4>
                        <span className="text-[11px] text-slate-400">{sub.category}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center justify-center whitespace-nowrap shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        sub.active
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {sub.active ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(sub.amount, currencySymbol)}
                      <span className="text-xs font-normal text-slate-400">
                        {' '}
                        /{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {sub.billingCycle === 'monthly'
                        ? `${formatCurrency(sub.amount * 12, currencySymbol)}/yr`
                        : `${formatCurrency(sub.amount / 12, currencySymbol)}/mo`}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2 text-xs dark:bg-slate-800/50">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>Next Due: {sub.nextPaymentDate}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        diffDays <= 3
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {diffDays <= 0
                        ? 'Due today'
                        : diffDays === 1
                        ? 'Tomorrow'
                        : `In ${diffDays} days`}
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onToggleSubscription(sub.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    {sub.active ? (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        <span>Pause Plan</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    aria-label="Remove subscription"
                    onClick={() => onDeleteSubscription(sub.id)}
                    className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    title="Remove Subscription"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Subscription Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Add Recurring Subscription
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Close dialog"
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

            {/* Quick Preset Buttons */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Popular Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SUBS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {p.icon} {p.name}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Subscription Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix Premium, Spotify, Gym"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 649"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="sub-billing-cycle" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Billing Cycle
                  </label>
                  <select
                    id="sub-billing-cycle"
                    aria-label="Billing Cycle"
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Next Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="sub-payment-method" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Payment Method
                  </label>
                  <select
                    id="sub-payment-method"
                    aria-label="Payment Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700"
                >
                  Save Subscription
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </div>
  );
};
