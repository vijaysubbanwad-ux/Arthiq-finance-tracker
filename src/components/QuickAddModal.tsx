import React, { useState } from 'react';
import {
  Check,
  Plus,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import {
  Budget,
  ExpenseCategory,
  Goal,
  IncomeSource,
  PaymentMethod,
  Transaction,
} from '../types';
import { CATEGORY_ICONS } from '../utils/formatters';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onAddGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  initialTab?: 'expense' | 'income' | 'goal' | 'budget';
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

const INCOME_SOURCES: IncomeSource[] = [
  'Salary',
  'Pocket Money',
  'Freelance',
  'Scholarship',
  'Business',
  'Other',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
];

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  onAddGoal,
  onAddBudget,
  initialTab = 'expense',
  currencySymbol = '₹',
}) => {
  const { t, translateCategory, translatePaymentMethod } = useLanguage();
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'goal' | 'budget'>(
    initialTab
  );

  const prevIsOpenRef = React.useRef(isOpen);
  React.useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setActiveTab(initialTab);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, initialTab]);

  // Common Form State
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  // Specific state
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Food');
  const [incomeSource, setIncomeSource] = useState<IncomeSource>('Salary');

  // Goal state
  const [goalTargetAmount, setGoalTargetAmount] = useState('');
  const [goalSavedAmount, setGoalSavedAmount] = useState('0');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalIcon, setGoalIcon] = useState('🎯');

  // Budget state
  const [budgetCategory, setBudgetCategory] = useState<ExpenseCategory | 'Overall'>('Food');
  const [budgetAmount, setBudgetAmount] = useState('');

  const resetForms = () => {
    setAmount('');
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setGoalTargetAmount('');
    setGoalSavedAmount('0');
    setBudgetAmount('');
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !title.trim()) return;

    onAddTransaction({
      title: title.trim(),
      amount: num,
      type: 'expense',
      category: expenseCategory,
      date,
      paymentMethod,
      description: description.trim() || undefined,
    });
    resetForms();
    onClose();
  };

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0 || !title.trim()) return;

    onAddTransaction({
      title: title.trim(),
      amount: num,
      type: 'income',
      category: incomeSource,
      date,
      paymentMethod,
      description: description.trim() || undefined,
    });
    resetForms();
    onClose();
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(goalTargetAmount);
    const savedNum = parseFloat(goalSavedAmount) || 0;
    if (isNaN(targetNum) || targetNum <= 0 || !title.trim() || !goalDeadline) return;

    onAddGoal({
      title: title.trim(),
      targetAmount: targetNum,
      currentSaved: savedNum,
      deadline: goalDeadline,
      icon: goalIcon,
      category: 'General',
    });
    resetForms();
    onClose();
  };

  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bNum = parseFloat(budgetAmount);
    if (isNaN(bNum) || bNum <= 0) return;

    onAddBudget({
      category: budgetCategory,
      amount: bNum,
      period: 'monthly',
    });
    resetForms();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          {/* Smooth Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs"
            aria-hidden="true"
          />

          {/* Smooth Modal Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4.5 sm:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('record_transaction')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('tagline')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="mt-4 flex overflow-x-auto sm:grid sm:grid-cols-4 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 sm:px-1.5 text-xs font-semibold whitespace-nowrap shrink-0 sm:shrink flex-1 transition ${
              activeTab === 'expense'
                ? 'bg-white text-rose-600 shadow-xs dark:bg-slate-900 dark:text-rose-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>➕</span>
            <span className="whitespace-nowrap">{t('filter_expenses')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 sm:px-1.5 text-xs font-semibold whitespace-nowrap shrink-0 sm:shrink flex-1 transition ${
              activeTab === 'income'
                ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>💰</span>
            <span className="whitespace-nowrap">{t('filter_income')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('goal')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 sm:px-1.5 text-xs font-semibold whitespace-nowrap shrink-0 sm:shrink flex-1 transition ${
              activeTab === 'goal'
                ? 'bg-white text-sky-600 shadow-xs dark:bg-slate-900 dark:text-sky-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>🎯</span>
            <span className="whitespace-nowrap">{t('action_add_goal')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('budget')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-3 sm:px-1.5 text-xs font-semibold whitespace-nowrap shrink-0 sm:shrink flex-1 transition ${
              activeTab === 'budget'
                ? 'bg-white text-amber-600 shadow-xs dark:bg-slate-900 dark:text-amber-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <span>📊</span>
            <span className="whitespace-nowrap">{t('action_set_budget')}</span>
          </button>
        </div>

        {/* Tab 1: Expense Form */}
        {activeTab === 'expense' && (
          <form onSubmit={handleExpenseSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('amount_label')} ({currencySymbol}) *
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-bold text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-base font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('title_label')} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lunch at Cafe, Uber ride"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="quickadd-expense-category" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t('category_label')} *
                </label>
                <select
                  id="quickadd-expense-category"
                  aria-label={t('category_label')}
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_ICONS[cat]} {translateCategory(cat)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quickadd-expense-payment-method" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t('payment_method_label')} *
                </label>
                <select
                  id="quickadd-expense-payment-method"
                  aria-label={t('payment_method_label')}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {translatePaymentMethod(method)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t('date_label')} *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Split with Aryan"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
            >
              <Check className="h-4 w-4" />
              <span>{t('save')} {t('filter_expenses')}</span>
            </motion.button>
          </form>
        )}

        {/* Tab 2: Income Form */}
        {activeTab === 'income' && (
          <form onSubmit={handleIncomeSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('amount_label')} ({currencySymbol}) *
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-bold text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-base font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
                />
              </div>
            </div>

            <div>
              <label htmlFor="quickadd-income-source" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('category_label')} *
              </label>
              <select
                id="quickadd-income-source"
                aria-label={t('category_label')}
                value={incomeSource}
                onChange={(e) => setIncomeSource(e.target.value as IncomeSource)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
              >
                {INCOME_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {CATEGORY_ICONS[src]} {translateCategory(src)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="quickadd-income-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('title_label')} *
              </label>
              <input
                id="quickadd-income-title"
                type="text"
                required
                placeholder="e.g. Monthly stipend, Freelance client deposit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="quickadd-income-payment-method" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t('payment_method_label')}
                </label>
                <select
                  id="quickadd-income-payment-method"
                  aria-label={t('payment_method_label')}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {translatePaymentMethod(method)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t('date_label')} *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              <Check className="h-4 w-4" />
              <span>{t('save')} {t('filter_income')}</span>
            </motion.button>
          </form>
        )}

        {/* Tab 3: Goal Form */}
        {activeTab === 'goal' && (
          <form onSubmit={handleGoalSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('title_label')} *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Buy Headphones, New Laptop, Trip"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-sky-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t('amount_label')} ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 15000"
                  value={goalTargetAmount}
                  onChange={(e) => setGoalTargetAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Initial Saved ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={goalSavedAmount}
                  onChange={(e) => setGoalSavedAmount(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-sky-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  {t('date_label')} / Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-sky-400"
                />
              </div>

              <div>
                <label htmlFor="quickadd-goal-icon" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Icon
                </label>
                <select
                  id="quickadd-goal-icon"
                  aria-label="Goal Icon"
                  value={goalIcon}
                  onChange={(e) => setGoalIcon(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-sky-400"
                >
                  <option value="🎧">🎧 Headphones</option>
                  <option value="🏍️">🏍️ Bike</option>
                  <option value="✈️">✈️ Trip</option>
                  <option value="💻">💻 Laptop</option>
                  <option value="📱">📱 Phone</option>
                  <option value="🏠">🏠 House/Rent</option>
                  <option value="🎓">🎓 Course</option>
                  <option value="🎯">🎯 Other</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
            >
              <Check className="h-4 w-4" />
              <span>{t('save')} {t('action_add_goal')}</span>
            </motion.button>
          </form>
        )}

        {/* Tab 4: Budget Form */}
        {activeTab === 'budget' && (
          <form onSubmit={handleBudgetSubmit} className="mt-4 space-y-3.5">
            <div>
              <label htmlFor="quickadd-budget-category" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('category_label')} *
              </label>
              <select
                id="quickadd-budget-category"
                aria-label={t('category_label')}
                value={budgetCategory}
                onChange={(e) =>
                  setBudgetCategory(e.target.value as ExpenseCategory | 'Overall')
                }
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-amber-400"
              >
                <option value="Overall">🌟 {t('monthly_budget')}</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_ICONS[cat]} {translateCategory(cat)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                {t('amount_label')} ({currencySymbol}) *
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-bold text-slate-400">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 6000"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-8 pr-3 text-base font-bold text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-amber-400"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Spendly will automatically warn you when spending reaches 80% and alert you immediately if the limit is exceeded.
            </p>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
            >
              <Check className="h-4 w-4" />
              <span>{t('save')} {t('monthly_budget')}</span>
            </motion.button>
          </form>
        )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
