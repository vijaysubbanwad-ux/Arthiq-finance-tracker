import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Edit2,
  PieChart,
  PiggyBank,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Budget, ExpenseCategory, Transaction } from '../types';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  formatCurrency,
} from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface BudgetSystemProps {
  budgets: Budget[];
  transactions: Transaction[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onUpdateBudget: (id: string, amount: number) => void;
  onDeleteBudget: (id: string) => void;
  currencySymbol?: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Rent',
  'Subscriptions',
  'Other',
];

export const BudgetSystem: React.FC<BudgetSystemProps> = ({
  budgets,
  transactions,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
  currencySymbol = '₹',
}) => {
  const { t, translateCategory } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [newCategory, setNewCategory] = useState<ExpenseCategory | 'Overall'>('Food');
  const [newAmount, setNewAmount] = useState('');

  // Calculate current month's expenses
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpentAll = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

  const categorySpentMap: Record<string, number> = {};
  currentMonthExpenses.forEach((t) => {
    categorySpentMap[t.category] = (categorySpentMap[t.category] || 0) + t.amount;
  });

  // Overall Budget
  const overallBudget = budgets.find((b) => b.category === 'Overall');
  const overallLimit = overallBudget ? overallBudget.amount : 30000;
  const overallPercent = Math.round((totalSpentAll / overallLimit) * 100);
  const overallRemaining = overallLimit - totalSpentAll;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(newAmount);
    if (isNaN(num) || num <= 0) return;

    onAddBudget({
      category: newCategory,
      amount: num,
      period: 'monthly',
    });
    setNewAmount('');
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;
    const num = parseFloat(newAmount);
    if (isNaN(num) || num <= 0) return;

    onUpdateBudget(editingBudget.id, num);
    setEditingBudget(null);
    setNewAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white md:text-xl">
            Smart Budget Control
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set spending guardrails and stay notified before limits are breached
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => {
            setNewAmount('');
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4" />
          <span>New Budget Limit</span>
        </motion.button>
      </div>

      {/* Overall Monthly Master Budget Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                <PiggyBank className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Monthly Total Budget
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(totalSpentAll, currencySymbol)}
              </span>
              <span className="text-xs text-slate-400">
                used of {formatCurrency(overallLimit, currencySymbol)} limit
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <span
              className={`inline-flex items-center justify-center whitespace-nowrap shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                overallPercent >= 100
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  : overallPercent >= 80
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {overallPercent >= 100
                ? `🔴 ${t('over_budget')}`
                : overallPercent >= 80
                ? `🟡 ${t('near_limit')}`
                : `🟢 ${t('safe_pace')}`}
            </span>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Remaining buffer:{' '}
              <strong className={overallRemaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}>
                {formatCurrency(Math.max(0, overallRemaining), currencySymbol)}
              </strong>
            </div>
          </div>
        </div>

        {/* Master Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
            <span>Progress ({overallPercent}%)</span>
            <span>{Math.max(0, 30 - now.getDate())} days remaining</span>
          </div>
          <div className="mt-1.5 h-3.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, overallPercent)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                overallPercent >= 100
                  ? 'bg-rose-500'
                  : overallPercent >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>
        </div>
      </motion.div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {budgets
            .filter((b) => b.category !== 'Overall')
            .map((budget, idx) => {
              const spent = categorySpentMap[budget.category] || 0;
              const percent = Math.round((spent / budget.amount) * 100);
              const remaining = budget.amount - spent;
              const icon = CATEGORY_ICONS[budget.category as any] || '🧾';

              const isOver = percent >= 100;
              const isWarning = percent >= 80 && percent < 100;

              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.22, delay: Math.min(idx * 0.03, 0.2) }}
                  whileHover={{ y: -2 }}
                  className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-shadow hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800">
                        {icon}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {budget.category === 'Overall' ? t('overall_label') : translateCategory(budget.category)}
                        </h4>
                        <span className="text-[11px] text-slate-400">Monthly Budget</span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center justify-center whitespace-nowrap shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        isOver
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {isOver ? `🔴 ${t('over_budget')}` : isWarning ? `🟡 ${t('near_limit')}` : `🟢 ${t('safe_status')}`}
                    </span>
                  </div>

                  {/* Numbers */}
                  <div className="mt-3 flex items-baseline justify-between text-xs">
                    <div>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(spent, currencySymbol)}
                      </span>
                      <span className="text-slate-400">
                        {' '}
                        / {formatCurrency(budget.amount, currencySymbol)}
                      </span>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {percent}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, percent)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isOver
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>

                  {/* Smart Alert Message if Near or Over */}
                  {isOver && (
                    <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        🚨 {budget.category} budget exceeded by {formatCurrency(spent - budget.amount, currencySymbol)}.
                      </span>
                    </div>
                  )}
                  {isWarning && (
                    <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        ⚠️ You have used {percent}% of your {budget.category} budget.
                      </span>
                    </div>
                  )}

                  {/* Footer Edit / Delete */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
                    <span className="text-[11px] text-slate-400">
                      {remaining > 0
                        ? `${formatCurrency(remaining, currencySymbol)} left`
                        : '0 buffer'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="Edit budget limit"
                        onClick={() => {
                          setEditingBudget(budget);
                          setNewAmount(budget.amount.toString());
                        }}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                        title="Edit Limit"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete budget"
                        onClick={() => onDeleteBudget(budget.id)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                        title="Delete Budget"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>

      {/* Add / Edit Budget Modal */}
      <AnimatePresence>
        {(showAddModal || editingBudget) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddModal(false);
                setEditingBudget(null);
              }}
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
                  {editingBudget ? `Edit ${editingBudget.category} Budget` : 'New Category Budget'}
                </h4>
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBudget(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form
                onSubmit={editingBudget ? handleEditSubmit : handleAddSubmit}
                className="mt-4 space-y-3"
              >
                {!editingBudget && (
                  <div>
                    <label htmlFor="budget-form-category" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Category
                    </label>
                    <select
                      id="budget-form-category"
                      aria-label="Category"
                      value={newCategory}
                      onChange={(e) =>
                        setNewCategory(e.target.value as ExpenseCategory | 'Overall')
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="Overall">🌟 Overall Monthly Limit</option>
                      {EXPENSE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {CATEGORY_ICONS[c]} {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Monthly Budget Limit ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 5000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
                    autoFocus
                  />
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingBudget(null);
                    }}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  >
                    Save Budget
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
