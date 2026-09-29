import React, { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Info,
  PieChart,
  PiggyBank,
  Plus,
  Wallet,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import {
  ActiveTab,
  Budget,
  CurrencyCode,
  FinancialHealthScore,
  Goal,
  SmartInsight,
  Subscription,
  Transaction,
  UserProfile,
} from '../types';
import {
  CATEGORY_ICONS,
  formatCurrency,
  formatTimelineDate,
} from '../utils/formatters';
import {
  convertCurrency,
  formatCurrencyInCode,
  getSavedDisplayCurrency,
  saveDisplayCurrency,
} from '../utils/currency';
import { DailyBudgetCard } from './DailyBudgetCard';
import { FinancialHealthCard } from './FinancialHealthCard';

interface DashboardViewProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  subscriptions: Subscription[];
  health: FinancialHealthScore;
  insights: SmartInsight[];
  userProfile: UserProfile;
  onNavigateTab: (tab: ActiveTab) => void;
  onQuickAdd: (tab?: 'expense' | 'income' | 'goal' | 'budget') => void;
  onOpenHealthModal: () => void;
  onSelectHeatmapDate: (dateStr: string) => void;
  currencySymbol?: string;
  onAddTransaction?: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction?: (id: string) => void;
  displayCurrency?: CurrencyCode;
  onSelectDisplayCurrency?: (currency: CurrencyCode) => void;
  onOpenAltCurrenciesModal?: () => void;
}

// Lightweight isolated clock to prevent re-rendering the entire dashboard every second
const LiveClock: React.FC<{ dateLocale: string }> = React.memo(({ dateLocale }) => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="tabular-nums font-mono text-[11px] text-slate-300">
      {time.toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short' })}
      {' • '}
      {time.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
});

LiveClock.displayName = 'LiveClock';

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  budgets,
  goals,
  subscriptions,
  health,
  insights,
  userProfile,
  onNavigateTab,
  onQuickAdd,
  onOpenHealthModal,
  onSelectHeatmapDate,
  currencySymbol = '₹',
  onAddTransaction,
  onDeleteTransaction,
  displayCurrency,
  onSelectDisplayCurrency,
  onOpenAltCurrenciesModal,
}) => {
  const { t, translateCategory, translatePaymentMethod, language } = useLanguage();

  const baseCurrency: CurrencyCode = (userProfile?.currency as CurrencyCode) || 'INR';

  // State for active display currency (supports external prop or local fallback synced with storage)
  const [localDisplayCurrency, setLocalDisplayCurrency] = useState<CurrencyCode>(() => {
    return displayCurrency || getSavedDisplayCurrency() || baseCurrency;
  });

  const activeCurrency: CurrencyCode = displayCurrency || localDisplayCurrency;
  const isAltCurrencyActive = activeCurrency.toUpperCase() !== baseCurrency.toUpperCase();

  const handleOpenModal = () => {
    if (onOpenAltCurrenciesModal) {
      onOpenAltCurrenciesModal();
    }
  };

  // Compute monthly calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTxs = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = currentMonthTxs
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = currentMonthTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Overall Balance calculation across all transactions
  const lifetimeIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const lifetimeExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalBalance = lifetimeIncome - lifetimeExpense;
  const currentMonthSavings = totalIncome - totalExpense;

  // Monthly Budget calculations
  const overallBudget = budgets.find((b) => b.category === 'Overall');
  const monthlyBudgetLimit = overallBudget ? overallBudget.amount : 30000;
  const budgetRemaining = Math.max(0, monthlyBudgetLimit - totalExpense);
  const budgetUsedPct = Math.round((totalExpense / monthlyBudgetLimit) * 100);

  // Alternative Currency Converted Totals
  const displayTotalBalance = isAltCurrencyActive
    ? convertCurrency(totalBalance, baseCurrency, activeCurrency)
    : totalBalance;
  const displayTotalIncome = isAltCurrencyActive
    ? convertCurrency(totalIncome, baseCurrency, activeCurrency)
    : totalIncome;
  const displayTotalExpense = isAltCurrencyActive
    ? convertCurrency(totalExpense, baseCurrency, activeCurrency)
    : totalExpense;
  const displaySavings = isAltCurrencyActive
    ? convertCurrency(currentMonthSavings, baseCurrency, activeCurrency)
    : currentMonthSavings;
  const displayBudgetLimit = isAltCurrencyActive
    ? convertCurrency(monthlyBudgetLimit, baseCurrency, activeCurrency)
    : monthlyBudgetLimit;
  const displayBudgetRemaining = isAltCurrencyActive
    ? convertCurrency(budgetRemaining, baseCurrency, activeCurrency)
    : budgetRemaining;

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  const dateLocale = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Quick Actions */}
      <div
        className="flex flex-col justify-between gap-4 rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-md sm:flex-row sm:items-center dark:border-slate-800"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
              {t('command_center')}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-emerald-400/80" />
              <LiveClock dateLocale={dateLocale} />
            </span>
          </div>
          <h1 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">
            {t('welcome_back')}, {userProfile?.name || 'Friend'}
          </h1>
          <p className="mt-0.5 text-xs text-slate-300">
            {t('tagline')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => onQuickAdd('expense')}
            className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            <span>{t('record_transaction')}</span>
          </motion.button>
        </div>
      </div>

      {/* KPI Metric Cards Grid: Total Balance, Total Income, Total Expenses, Savings, Monthly Budget, Budget Remaining */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total Balance */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="relative min-h-[108px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('total_net_balance')}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleOpenModal}
                className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500"
                title={t('view_alt_currencies')}
              >
                <ArrowLeftRight className="h-2.5 w-2.5 text-emerald-500" />
                <span>FX</span>
              </button>
              <Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 tabular-nums text-lg font-black tracking-tight text-slate-900 dark:text-white">
            {formatCurrencyInCode(displayTotalBalance, activeCurrency)}
          </div>
          {isAltCurrencyActive ? (
            <div className="mt-0.5 flex items-center gap-1 tabular-nums text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Base: {formatCurrency(totalBalance, currencySymbol)}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400">{t('cumulative_net')}</span>
          )}
        </motion.div>

        {/* Total Income */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="relative min-h-[108px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('monthly_income')}
            </span>
            <ArrowDownRight className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 tabular-nums text-lg font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatCurrencyInCode(displayTotalIncome, activeCurrency)}
          </div>
          {isAltCurrencyActive ? (
            <div className="mt-0.5 flex items-center gap-1 tabular-nums text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Base: {formatCurrency(totalIncome, currencySymbol)}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400">{t('current_inflow')}</span>
          )}
        </motion.div>

        {/* Total Expenses */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="relative min-h-[108px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('monthly_expenses')}
            </span>
            <ArrowUpRight className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 tabular-nums text-lg font-black tracking-tight text-rose-600 dark:text-rose-400">
            {formatCurrencyInCode(displayTotalExpense, activeCurrency)}
          </div>
          {isAltCurrencyActive ? (
            <div className="mt-0.5 flex items-center gap-1 tabular-nums text-[10px] font-semibold text-rose-600 dark:text-rose-400">
              <span>Base: {formatCurrency(totalExpense, currencySymbol)}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400">{t('expenses_logged')}</span>
          )}
        </motion.div>

        {/* Savings */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="relative min-h-[108px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('net_savings')}
            </span>
            <PiggyBank className="h-4 w-4 text-sky-500" />
          </div>
          <div
            className={`mt-2 tabular-nums text-lg font-black tracking-tight ${
              displaySavings >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrencyInCode(displaySavings, activeCurrency)}
          </div>
          {isAltCurrencyActive ? (
            <div className="mt-0.5 flex items-center gap-1 tabular-nums text-[10px] font-semibold text-sky-600 dark:text-sky-400">
              <span>Base: {formatCurrency(currentMonthSavings, currencySymbol)}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-400">{t('this_month')}</span>
          )}
        </motion.div>

        {/* Monthly Budget */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="relative min-h-[108px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('monthly_budget')}
            </span>
            <PieChart className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 tabular-nums text-lg font-black tracking-tight text-slate-900 dark:text-white">
            {formatCurrencyInCode(displayBudgetLimit, activeCurrency)}
          </div>
          <span className="text-[10px] text-slate-400">{budgetUsedPct}% {t('allocated')}</span>
        </motion.div>

        {/* Budget Remaining */}
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="relative min-h-[108px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t('budget_buffer')}
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                budgetRemaining > 0 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>
          <div
            className={`mt-2 tabular-nums text-lg font-black tracking-tight ${
              budgetRemaining > 0
                ? 'text-slate-900 dark:text-white'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrencyInCode(displayBudgetRemaining, activeCurrency)}
          </div>
          <span className="text-[10px] text-slate-400">{t('left_to_spend')}</span>
        </motion.div>
      </div>

      {/* Row: Financial Health Score & Daily Budget */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <FinancialHealthCard health={health} onOpenDetails={onOpenHealthModal} />
        </div>
        <div>
          <DailyBudgetCard
            transactions={transactions}
            monthlyBudget={monthlyBudgetLimit}
            currencySymbol={currencySymbol}
            onOpenQuickAdd={onQuickAdd}
            onNavigateTab={onNavigateTab}
            onAddTransaction={onAddTransaction}
            onDeleteTransaction={onDeleteTransaction}
          />
        </div>
      </div>

      {/* Two Column Layout: Recent Transactions Timeline Preview & Budget Allocation Snapshot */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions Timeline Preview */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('recent_transaction_stream')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('latest_cash_inflows')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('transactions')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <span>{t('view_all')}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            {recentTransactions.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">{t('no_transactions_yet')}</p>
            ) : (
              recentTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <motion.div
                    whileHover={{ x: 2 }}
                    key={tx.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-slate-100/50 dark:border-slate-800/60 dark:bg-slate-800/30 dark:hover:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-base shadow-2xs dark:bg-slate-800">
                        {CATEGORY_ICONS[tx.category] || '🧾'}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          {tx.title}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatTimelineDate(tx.date)} • {translatePaymentMethod(tx.paymentMethod)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-extrabold ${
                          isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(tx.amount, currencySymbol)}
                      </span>
                      <div className="text-[10px] text-slate-400">{translateCategory(tx.category)}</div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Active Budgets Snapshot */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('monthly_budget_pacing')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('guardrails_categories')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('budgets')}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              <span>{t('manage')}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3.5">
            {budgets.slice(0, 4).map((b) => {
              const spent = currentMonthTxs
                .filter((tx) => tx.type === 'expense' && (b.category === 'Overall' || tx.category === b.category))
                .reduce((sum, tx) => sum + tx.amount, 0);
              const pct = Math.round((spent / b.amount) * 100);
              const isOver = pct >= 100;
              const isWarning = pct >= 80 && pct < 100;

              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {translateCategory(b.category)}
                    </span>
                    <span className="text-slate-500">
                      <strong>{formatCurrency(spent, currencySymbol)}</strong> /{' '}
                      {formatCurrency(b.amount, currencySymbol)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, pct)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${
                        isOver
                          ? 'bg-rose-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Savings Goals Highlight Mini Card */}
          {goals.length > 0 && (
            <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50/50 p-3 dark:border-sky-900/30 dark:bg-sky-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{goals[0].icon}</span>
                  <div>
                    <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300">
                      {t('active_priority_goal')}
                    </span>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {goals[0].title}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab('goals')}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400"
                >
                  {t('view_goals')}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {formatCurrency(goals[0].currentSaved, currencySymbol)} of{' '}
                  {formatCurrency(goals[0].targetAmount, currencySymbol)}
                </span>
                <span className="font-bold text-sky-700 dark:text-sky-300">
                  {Math.round((goals[0].currentSaved / goals[0].targetAmount) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
