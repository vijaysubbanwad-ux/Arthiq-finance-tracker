import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Flame,
  Info,
  Maximize2,
  Plus,
  RotateCcw,
  Sliders,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { ActiveTab, ExpenseCategory, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getLocalDateString } from '../utils/storage';

interface DailyBudgetCardProps {
  transactions: Transaction[];
  monthlyBudget: number;
  currencySymbol?: string;
  onOpenQuickAdd?: (tab?: 'expense' | 'income') => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  onAddTransaction?: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const DailyBudgetCard: React.FC<DailyBudgetCardProps> = ({
  transactions,
  monthlyBudget,
  currencySymbol = '₹',
  onOpenQuickAdd,
  onNavigateTab,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const { t, translateCategory } = useLanguage();

  // Local UI States
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isInlineExpanded, setIsInlineExpanded] = useState(false);
  const [isQuickSpendOpen, setIsQuickSpendOpen] = useState(false);
  const [quickAmount, setQuickAmount] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState<ExpenseCategory>('Food');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Custom Daily Limit Override (Optional user-adjusted daily limit stored in localStorage)
  const [customDailyLimit, setCustomDailyLimit] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('spendly_custom_daily_limit');
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });

  // Live real-time clock ticker (updates every minute to prevent main thread CPU thrashing)
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = useMemo(() => getLocalDateString(now), [now]);

  // Days in current month
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Default auto-calculated daily allocation = monthly budget / days in month
  const autoDailyBudget = Math.max(100, Math.round(monthlyBudget / daysInMonth));
  const dailyBudget = customDailyLimit && customDailyLimit > 0 ? customDailyLimit : autoDailyBudget;

  // Today's total expenses
  const todayExpenses = useMemo(() => {
    return transactions.filter(
      (t) => t.type === 'expense' && (t.date === todayStr || t.date.startsWith(todayStr))
    );
  }, [transactions, todayStr]);

  const todaySpent = useMemo(() => {
    return todayExpenses.reduce((sum, t) => sum + t.amount, 0);
  }, [todayExpenses]);

  const remaining = dailyBudget - todaySpent;
  const spentPct = dailyBudget > 0 ? Math.round((todaySpent / dailyBudget) * 100) : 0;

  // Time remaining in current 24-hour cycle
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();
  const hoursLeftToday = Math.max(0, 23 - currentHour);
  const minutesLeftToday = Math.max(0, 59 - currentMinute);
  const secondsLeftToday = Math.max(0, 59 - currentSecond);

  // Hourly safe spending rate for remainder of today
  const hoursFraction = Math.max(0.5, hoursLeftToday + minutesLeftToday / 60);
  const safeHourlyRate = remaining > 0 ? Math.round(remaining / hoursFraction) : 0;

  // Status calculation: Green (< 75%), Yellow (75-99%), Red (>= 100%)
  const isOver = spentPct >= 100;
  const isClose = spentPct >= 75 && spentPct < 100;

  const statusLabel = isOver
    ? t('over_budget')
    : isClose
    ? t('close_to_limit')
    : t('normal_status');

  const statusColor = isOver
    ? 'text-rose-700 dark:text-rose-300 bg-rose-50 border-rose-200 dark:bg-rose-950/60 dark:border-rose-900/50'
    : isClose
    ? 'text-amber-700 dark:text-amber-300 bg-amber-50 border-amber-200 dark:bg-amber-950/60 dark:border-amber-900/50'
    : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-900/50';

  const barColor = isOver
    ? 'bg-rose-500'
    : isClose
    ? 'bg-amber-500'
    : 'bg-emerald-500';

  // Quick Preset Logger
  const handleLogQuickExpense = (amount: number, title: string, category: ExpenseCategory = 'Food') => {
    if (onAddTransaction) {
      onAddTransaction({
        title,
        amount,
        type: 'expense',
        category,
        date: todayStr,
        paymentMethod: 'UPI',
        description: 'Logged via Daily Budget Quick Presets',
      });
      showFeedback(`Added ${formatCurrency(amount, currencySymbol)} for ${title}!`);
    } else if (onOpenQuickAdd) {
      onOpenQuickAdd('expense');
    }
  };

  // Custom Inline Quick Spend Submit
  const handleCustomSpendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickAmount);
    if (isNaN(val) || val <= 0) return;
    const finalTitle = quickTitle.trim() || 'Daily Expense';

    if (onAddTransaction) {
      onAddTransaction({
        title: finalTitle,
        amount: val,
        type: 'expense',
        category: quickCategory,
        date: todayStr,
        paymentMethod: 'UPI',
      });
      showFeedback(`Logged ${formatCurrency(val, currencySymbol)}!`);
      setQuickAmount('');
      setQuickTitle('');
      setIsQuickSpendOpen(false);
    } else if (onOpenQuickAdd) {
      onOpenQuickAdd('expense');
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleUpdateCustomLimit = (newLimit: number | null) => {
    setCustomDailyLimit(newLimit);
    if (newLimit !== null) {
      localStorage.setItem('spendly_custom_daily_limit', String(newLimit));
      showFeedback(`Daily limit updated to ${formatCurrency(newLimit, currencySymbol)}!`);
    } else {
      localStorage.removeItem('spendly_custom_daily_limit');
      showFeedback(`Reset to Auto (${formatCurrency(autoDailyBudget, currencySymbol)}/day)!`);
    }
  };

  return (
    <>
      <div
        className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900"
      >
        {/* Toast Feedback */}
        <AnimatePresence>
          {feedbackMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="absolute -top-3 right-5 z-20 flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-md"
            >
              <Check className="h-3.5 w-3.5" />
              <span>{feedbackMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header with Clock Button & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* Interactive Clock Trigger Button with Spring Animation */}
            <motion.button
              id="daily-budget-clock-btn"
              type="button"
              whileHover={{ scale: 1.08, rotate: 12 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={() => setIsInlineExpanded((prev) => !prev)}
              title="Click to toggle daily pacing drawer & activity"
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200/90 bg-emerald-50 text-emerald-700 shadow-2xs dark:border-emerald-800/80 dark:bg-emerald-950/80 dark:text-emerald-300"
              aria-label="Toggle Daily Budget Details"
            >
              <Clock className="h-4.5 w-4.5 stroke-[2.3]" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
              </span>
            </motion.button>

            <div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsInlineExpanded((prev) => !prev)}
                  className="group flex items-center gap-1 text-left text-xs font-extrabold uppercase tracking-wider text-slate-700 transition-colors hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
                >
                  <span>{t('daily_budget_tracker')}</span>
                  <motion.div
                    animate={{ rotate: isInlineExpanded ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                  >
                    <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-emerald-500" />
                  </motion.div>
                </button>
                <span className="text-[10px] text-slate-400">•</span>
                <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {String(hoursLeftToday).padStart(2, '0')}h {String(minutesLeftToday).padStart(2, '0')}m left
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                {t('todays_pacing_limit')}
              </p>
            </div>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-2">
            {/* Status Pill with Modal View Trigger */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDetailsOpen(true)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-2xs transition-colors ${statusColor}`}
              title="Click for full pacing analysis modal"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isOver ? 'bg-rose-500 animate-pulse' : isClose ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              {statusLabel}
            </motion.button>

            {/* Quick Spend Toggle Button */}
            <motion.button
              id="daily-budget-quick-spend-btn"
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsQuickSpendOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold shadow-xs transition-colors ${
                isQuickSpendOpen
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
              title="Quickly record an expense for today"
            >
              {isQuickSpendOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5 stroke-[2.5]" />}
              <span>{isQuickSpendOpen ? 'Close' : 'Quick Spend'}</span>
            </motion.button>
          </div>
        </div>

        {/* 3 Metric Figures */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-center dark:border-slate-800">
          {/* Daily Limit */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsInlineExpanded(true)}
            className="group rounded-xl p-1 text-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            title="Click to adjust daily limit"
          >
            <span className="block text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
              {t('daily_limit')} {customDailyLimit ? '★' : ''}
            </span>
            <div className="text-sm font-black text-slate-900 dark:text-white sm:text-base">
              {formatCurrency(dailyBudget, currencySymbol)}
            </div>
          </motion.button>

          {/* Today's Spent */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsInlineExpanded((prev) => !prev)}
            className="group rounded-xl p-1 text-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            title="Click to view today's transactions"
          >
            <span className="block text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
              {t('todays_spent')}
            </span>
            <div
              className={`text-sm font-black sm:text-base ${
                isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
              }`}
            >
              {formatCurrency(todaySpent, currencySymbol)}
            </div>
          </motion.button>

          {/* Remaining */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsDetailsOpen(true)}
            className="group rounded-xl p-1 text-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
            title="Click for full breakdown"
          >
            <span className="block text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
              {t('remaining_label')}
            </span>
            <div
              className={`text-sm font-black sm:text-base ${
                remaining >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(Math.max(0, remaining), currencySymbol)}
            </div>
          </motion.button>
        </div>

        {/* Animated Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => setIsInlineExpanded((prev) => !prev)}
              className="group inline-flex items-center gap-1 font-semibold text-slate-500 transition-colors hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              <span>
                {todayExpenses.length} {t('recorded_today')}
              </span>
              <motion.div
                animate={{ rotate: isInlineExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-emerald-500" />
              </motion.div>
            </button>
            <motion.span
              key={spentPct}
              initial={{ scale: 1.15 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="font-mono font-extrabold text-slate-700 dark:text-slate-300"
            >
              {spentPct}% {t('spent_label')}
            </motion.span>
          </div>

          <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              className={`h-full rounded-full ${barColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, spentPct)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* 1-Click Instant Quick Spend Presets Row with Spring Hover Animations */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quick Log:
          </span>
          <motion.button
            type="button"
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleLogQuickExpense(20, 'Tea / Chai', 'Food')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 shadow-2xs transition-colors hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300"
          >
            +₹20 Chai
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleLogQuickExpense(50, 'Snack / Coffee', 'Food')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 shadow-2xs transition-colors hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300"
          >
            +₹50 Snack
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleLogQuickExpense(120, 'Lunch Meal', 'Food')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 shadow-2xs transition-colors hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300"
          >
            +₹120 Meal
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleLogQuickExpense(40, 'Metro / Bus Commute', 'Travel')}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-700 shadow-2xs transition-colors hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300"
          >
            +₹40 Ride
          </motion.button>
        </div>

        {/* Inline Quick Spend Form (Collapsible with smooth slide/fade) */}
        <AnimatePresence>
          {isQuickSpendOpen && (
            <motion.form
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onSubmit={handleCustomSpendSubmit}
              className="mt-3.5 overflow-hidden rounded-2xl border border-emerald-200/90 bg-emerald-50/60 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/40"
            >
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <span>Record Today's Spend</span>
                <span className="text-[10px] font-normal text-emerald-700 dark:text-emerald-300">
                  Updates budget gauge instantly
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Amount"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pr-2.5 pl-7 text-xs font-bold text-slate-900 shadow-2xs outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Expense description (e.g. Lunch)"
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 shadow-2xs outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <div className="flex gap-1.5">
                  <select
                    id="daily-budget-quick-category"
                    aria-label="Expense Category"
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value as ExpenseCategory)}
                    className="w-1/2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="Food">Food</option>
                    <option value="Travel">Travel</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Bills">Bills</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-500"
                  >
                    + Add
                  </motion.button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Inline Expandable Drawer (Activity + Limit Adjustment) */}
        <AnimatePresence>
          {isInlineExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="mt-3.5 overflow-hidden border-t border-slate-100 pt-3 dark:border-slate-800"
            >
              {/* Hourly Pacing Hint */}
              <div className="mb-2.5 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/60">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  <span>
                    Safe spend rate: <strong>{formatCurrency(safeHourlyRate, currencySymbol)}/hr</strong> for remaining {hoursLeftToday}h
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  <Maximize2 className="h-3 w-3" />
                  <span>Full Screen</span>
                </button>
              </div>

              {/* Today's Transactions List */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Today's Outflows ({todayExpenses.length})</span>
                  {customDailyLimit && (
                    <button
                      type="button"
                      onClick={() => handleUpdateCustomLimit(null)}
                      className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      Reset limit to auto
                    </button>
                  )}
                </div>

                {todayExpenses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400 dark:border-slate-800">
                    No transactions recorded yet today. Click quick log buttons above to record spend!
                  </div>
                ) : (
                  <div className="max-h-44 space-y-1.5 overflow-y-auto pr-0.5">
                    <AnimatePresence>
                      {todayExpenses.map((tx, idx) => (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10, height: 0 }}
                          transition={{ duration: 0.2, delay: idx * 0.03 }}
                          className="group flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs transition-colors hover:bg-slate-100/80 dark:bg-slate-800/50 dark:hover:bg-slate-800"
                        >
                          <div className="min-w-0 flex-1 pr-2">
                            <div className="truncate font-semibold text-slate-800 dark:text-slate-200">
                              {tx.title}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {translateCategory(tx.category)} • {tx.paymentMethod}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                              -{formatCurrency(tx.amount, currencySymbol)}
                            </span>
                            {onDeleteTransaction && (
                              <button
                                type="button"
                                aria-label="Delete transaction"
                                onClick={() => {
                                  onDeleteTransaction(tx.id);
                                  showFeedback('Transaction removed');
                                }}
                                className="opacity-0 transition-opacity group-hover:opacity-100 text-slate-400 hover:text-rose-500"
                                title="Delete transaction"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Full-Screen Pacing & Control Modal Rendered via React Portal */}
      {typeof document !== 'undefined' && (
        <AnimatePresence>
          {isDetailsOpen &&
            createPortal(
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setIsDetailsOpen(false)}
                  className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
                />

                {/* Modal Dialog */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 16 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                  className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 30 }}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400"
                      >
                        <Clock className="h-5 w-5 stroke-[2.5]" />
                      </motion.div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                          Daily Budget Control Center
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Live tracking • Pacing calculation • Real-time spend
                        </p>
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      aria-label="Close dialog"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsDetailsOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>

                  {/* Status & Pacing Box */}
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        Today's Usage ({todayExpenses.length} transactions)
                      </span>
                      <span className={`font-bold ${statusColor.split(' ')[0]}`}>
                        {statusLabel} ({spentPct}%)
                      </span>
                    </div>

                    {/* Main Pacing Bar */}
                    <div className="mt-2.5 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <motion.div
                        className={`h-full rounded-full ${barColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, spentPct)}%` }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                      />
                    </div>

                    <div className="mt-3.5 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-xl bg-white p-2.5 shadow-2xs dark:bg-slate-900">
                        <span className="text-[10px] text-slate-400">Daily Limit</span>
                        <div className="mt-0.5 font-bold text-slate-900 dark:text-white">
                          {formatCurrency(dailyBudget, currencySymbol)}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white p-2.5 shadow-2xs dark:bg-slate-900">
                        <span className="text-[10px] text-slate-400">Spent Today</span>
                        <div className={`mt-0.5 font-bold ${isOver ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                          {formatCurrency(todaySpent, currencySymbol)}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white p-2.5 shadow-2xs dark:bg-slate-900">
                        <span className="text-[10px] text-slate-400">Remaining</span>
                        <div className={`mt-0.5 font-bold ${remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                          {formatCurrency(Math.max(0, remaining), currencySymbol)}
                        </div>
                      </div>
                    </div>

                    {/* Practical Advice Banner */}
                    <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-500/10 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        {remaining > 0 ? (
                          <span>
                            You have <strong>{formatCurrency(remaining, currencySymbol)}</strong> available for the remaining {hoursLeftToday} hours of today (≈ {formatCurrency(safeHourlyRate, currencySymbol)}/hr).
                          </span>
                        ) : (
                          <span>
                            You've exceeded today's budget by <strong>{formatCurrency(Math.abs(remaining), currencySymbol)}</strong>. Tomorrow's allowance will balance automatically.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Adjust Daily Target Section */}
                  <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span className="flex items-center gap-1.5">
                        <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                        Custom Daily Limit
                      </span>
                      <span className="text-[11px] font-normal text-slate-400">
                        Current: {formatCurrency(dailyBudget, currencySymbol)}
                      </span>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {[null, 500, 800, 1200, 1500].map((lim) => (
                        <motion.button
                          key={lim ?? 'auto'}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleUpdateCustomLimit(lim)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                            customDailyLimit === lim
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {lim === null ? `Auto (${formatCurrency(autoDailyBudget, currencySymbol)})` : formatCurrency(lim, currencySymbol)}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Today's Transactions Stream in Modal */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                      <span>Today's Transactions ({todayExpenses.length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDetailsOpen(false);
                          setIsQuickSpendOpen(true);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                      >
                        <Plus className="h-3 w-3" />
                        Quick Add
                      </button>
                    </div>

                    <div className="mt-2 max-h-40 space-y-1.5 overflow-y-auto pr-1">
                      {todayExpenses.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-800">
                          No expenses recorded yet today.
                        </div>
                      ) : (
                        <AnimatePresence>
                          {todayExpenses.map((item, i) => (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.18, delay: i * 0.02 }}
                              className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white p-2.5 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-800/60"
                            >
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {item.title}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {translateCategory(item.category)} • {item.paymentMethod}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="font-mono font-bold text-rose-600 dark:text-rose-400">
                                  -{formatCurrency(item.amount, currencySymbol)}
                                </div>
                                {onDeleteTransaction && (
                                  <button
                                    type="button"
                                    aria-label="Delete transaction"
                                    onClick={() => onDeleteTransaction(item.id)}
                                    className="text-slate-400 hover:text-rose-500"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </div>

                  {/* Modal Actions Footer */}
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                    {onNavigateTab && (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setIsDetailsOpen(false);
                          onNavigateTab('budgets');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <Wallet className="h-3.5 w-3.5" />
                        Manage Budgets
                      </motion.button>
                    )}

                    <div className="flex flex-1 items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsDetailsOpen(false)}
                        className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        Close
                      </button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setIsDetailsOpen(false);
                          setIsQuickSpendOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-500"
                      >
                        <Plus className="h-4 w-4" />
                        Record Expense
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </div>,
              document.body
            )}
        </AnimatePresence>
      )}
    </>
  );
};
