import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  MinusCircle,
  Plus,
  PlusCircle,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SavingsGoalsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  onUpdateGoalSavings: (id: string, delta: number) => void;
  onDeleteGoal: (id: string) => void;
  currencySymbol?: string;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  goals,
  onAddGoal,
  onUpdateGoalSavings,
  onDeleteGoal,
  currencySymbol = '₹',
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isWithdraw, setIsWithdraw] = useState(false);

  // New goal state
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSaved, setCurrentSaved] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('🎯');

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId) return;
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) return;

    const delta = isWithdraw ? -num : num;
    const targetGoal = goals.find((g) => g.id === depositGoalId);

    onUpdateGoalSavings(depositGoalId, delta);

    // If depositing and goal is now completed (or crossing 100%), trigger confetti!
    if (!isWithdraw && targetGoal && targetGoal.currentSaved + delta >= targetGoal.targetAmount) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error('Confetti error', err);
      }
    }

    setDepositGoalId(null);
    setDepositAmount('');
  };

  const handleNewGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tAmt = parseFloat(targetAmount);
    const sAmt = parseFloat(currentSaved) || 0;
    if (isNaN(tAmt) || tAmt <= 0 || !title.trim() || !deadline) return;

    onAddGoal({
      title: title.trim(),
      targetAmount: tAmt,
      currentSaved: sAmt,
      deadline,
      icon,
      category: 'General',
    });

    setTitle('');
    setTargetAmount('');
    setCurrentSaved('0');
    setDeadline('');
    setShowAddModal(false);
  };

  const totalSavedAcrossGoals = goals.reduce((sum, g) => sum + g.currentSaved, 0);
  const totalTargetAcrossGoals = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallGoalsProgress =
    totalTargetAcrossGoals > 0 ? (totalSavedAcrossGoals / totalTargetAcrossGoals) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white md:text-xl">
            Savings Goals Tracker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Envision your dream purchases and build steady financial momentum
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
        >
          <Plus className="h-4 w-4" />
          <span>New Savings Goal</span>
        </motion.button>
      </div>

      {/* Aggregate Goal Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50/70 to-indigo-50/70 p-5 dark:border-sky-900/40 dark:from-sky-950/20 dark:to-indigo-950/20"
      >
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/20">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                Portfolio Savings Target
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(totalSavedAcrossGoals, currencySymbol)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  saved of {formatCurrency(totalTargetAcrossGoals, currencySymbol)} across{' '}
                  {goals.length} targets
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-sm font-extrabold text-sky-700 dark:text-sky-300">
              {overallGoalsProgress.toFixed(1)}% Complete
            </span>
            <div className="mt-1 h-2.5 w-full min-w-44 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, overallGoalsProgress)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-sky-500"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Goals Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <span className="text-4xl">🎯</span>
            <h4 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              No savings goals created yet
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Start by creating your first milestone, like a new gadget, travel trip, or emergency cushion.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-4 rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700"
            >
              Add First Goal
            </motion.button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {goals.map((goal, idx) => {
              const percentage =
                goal.targetAmount > 0
                  ? Math.min(100, (goal.currentSaved / goal.targetAmount) * 100)
                  : 0;
              const isCompleted = percentage >= 100;

              // Days remaining
              const targetDate = new Date(goal.deadline);
              const today = new Date();
              const diffTime = targetDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.22, delay: Math.min(idx * 0.03, 0.2) }}
                  whileHover={{ y: -2 }}
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 shadow-2xs transition-shadow hover:shadow-md ${
                    isCompleted
                      ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20'
                      : 'border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900'
                  }`}
                >
                  <div>
                    {/* Top Bar: Icon + Title + Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl dark:bg-slate-800">
                          {goal.icon || '🎯'}
                        </span>
                        <div>
                          <h3 className="line-clamp-1 text-sm font-bold text-slate-900 dark:text-white">
                            {goal.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {diffDays > 0 ? `${diffDays} days left` : 'Target reached/due'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        aria-label="Delete Goal"
                        onClick={() => onDeleteGoal(goal.id)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        title="Delete Goal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Saved vs Target */}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                          {formatCurrency(goal.currentSaved, currencySymbol)}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          Target: {formatCurrency(goal.targetAmount, currencySymbol)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            isCompleted ? 'bg-emerald-500' : 'bg-sky-500'
                          }`}
                        />
                      </div>

                      <div className="mt-1.5 flex items-center justify-between text-xs font-bold">
                        <span className={isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-sky-600 dark:text-sky-400'}>
                          {percentage.toFixed(1)}% complete
                        </span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Goal Achieved!</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Add / Withdraw Actions */}
                  <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setDepositGoalId(goal.id);
                        setIsWithdraw(false);
                        setDepositAmount('');
                      }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/40"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Deposit</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        setDepositGoalId(goal.id);
                        setIsWithdraw(true);
                        setDepositAmount('');
                      }}
                      className="flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      title="Withdraw funds from goal"
                    >
                      <MinusCircle className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Deposit / Withdraw Modal */}
      <AnimatePresence>
        {depositGoalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDepositGoalId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isWithdraw ? 'Withdraw from Goal' : 'Deposit into Goal'}
                </h4>
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={() => setDepositGoalId(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleDepositSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 500"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base font-bold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-sky-400"
                    autoFocus
                  />
                </div>

                {/* Quick Suggestion Pills */}
                <div className="flex items-center gap-1.5">
                  {[200, 500, 1000, 2000].map((amt) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt.toString())}
                      className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      +{currencySymbol}{amt}
                    </motion.button>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setDepositGoalId(null)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={`rounded-xl px-4 py-1.5 text-xs font-bold text-white shadow-xs ${
                      isWithdraw
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {isWithdraw ? 'Confirm Withdrawal' : 'Confirm Deposit'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add New Goal Modal */}
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
                  Create New Savings Goal
                </h4>
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleNewGoalSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Buy Sony Headphones, Goa Trip, New Bike"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Target Amount ({currencySymbol}) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 12000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Already Saved ({currencySymbol})
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="0"
                      value={currentSaved}
                      onChange={(e) => setCurrentSaved(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Target Deadline *
                    </label>
                    <input
                      type="date"
                      required
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="goal-icon-select" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Select Visual Icon
                    </label>
                    <select
                      id="goal-icon-select"
                      aria-label="Select Visual Icon"
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="🎧">🎧 Headphones / Audio</option>
                      <option value="🏍️">🏍️ Motorbike / Scooter</option>
                      <option value="✈️">✈️ Travel / Flight</option>
                      <option value="💻">💻 Laptop / PC</option>
                      <option value="📱">📱 Smartphone</option>
                      <option value="🏠">🏠 House / Rent Deposit</option>
                      <option value="🎓">🎓 Education / Cert</option>
                      <option value="🛡️">🛡️ Emergency Buffer</option>
                      <option value="🎯">🎯 Other Milestone</option>
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
                    className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-700"
                  >
                    Create Goal
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
