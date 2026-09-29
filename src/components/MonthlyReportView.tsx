import React, { useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Printer,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Budget, FinancialHealthScore, Transaction } from '../types';
import {
  CATEGORY_ICONS,
  formatCurrency,
  formatTimelineDate,
} from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface MonthlyReportViewProps {
  transactions: Transaction[];
  budgets: Budget[];
  health: FinancialHealthScore;
  currencySymbol?: string;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  transactions,
  budgets,
  health,
  currencySymbol = '₹',
}) => {
  const { t, translateCategory } = useLanguage();
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);

  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + selectedMonthOffset, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();

  const monthLabel = targetDate.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  // Filter transactions for this month
  const monthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
  });

  const incomeTxs = monthTransactions.filter((t) => t.type === 'income');
  const expenseTxs = monthTransactions.filter((t) => t.type === 'expense');

  const totalIncome = incomeTxs.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTxs.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

  // Top 3 spending categories
  const catMap: Record<string, number> = {};
  expenseTxs.forEach((t) => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(catMap)
    .map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalExpense > 0 ? (amt / totalExpense) * 100 : 0,
      icon: CATEGORY_ICONS[cat as any] || '🧾',
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header (hidden in print) */}
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white md:text-xl">
            {t('monthly_executive_statement')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('monthly_statement_desc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            id="monthly-report-select-month"
            aria-label="Select statement month"
            value={selectedMonthOffset}
            onChange={(e) => setSelectedMonthOffset(parseInt(e.target.value, 10))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value={0}>Current Month ({now.toLocaleDateString('en-IN', { month: 'short' })})</option>
            <option value={-1}>Last Month</option>
            <option value={-2}>2 Months Ago</option>
            <option value={-3}>3 Months Ago</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            <Printer className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">{t('print_save_pdf')}</span>
          </motion.button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="print-area mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Report Top Branding */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-black text-white">
                S
              </span>
              <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                SPENDLY
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Financial Intelligence & Expense Audit Statement
            </p>
          </div>

          <div className="text-right">
            <span className="inline-block rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              {monthLabel}
            </span>
            <div className="mt-1 text-[11px] text-slate-400">
              Generated on {new Date().toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>

        {/* Executive Summary Statement */}
        <div className="my-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Executive Summary
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            During {monthLabel}, your net savings finished at{' '}
            <strong className="text-slate-900 dark:text-white">
              {formatCurrency(netSavings, currencySymbol)}
            </strong>{' '}
            representing a savings rate of{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">
              {savingsRate.toFixed(1)}%
            </strong>
            . Your overall financial health score stands at{' '}
            <strong>{health.score}/100 ({health.rating})</strong>.
          </p>
        </div>

        {/* Key Metrics 4-Box Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Total Inflow
            </span>
            <div className="mt-1 text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalIncome, currencySymbol)}
            </div>
            <span className="text-[10px] text-slate-400">{incomeTxs.length} deposits</span>
          </div>

          <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Total Outflow
            </span>
            <div className="mt-1 text-base font-extrabold text-rose-600 dark:text-rose-400">
              {formatCurrency(totalExpense, currencySymbol)}
            </div>
            <span className="text-[10px] text-slate-400">{expenseTxs.length} expenses</span>
          </div>

          <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Net Savings
            </span>
            <div
              className={`mt-1 text-base font-extrabold ${
                netSavings >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {formatCurrency(netSavings, currencySymbol)}
            </div>
            <span className="text-[10px] text-slate-400">{savingsRate.toFixed(1)}% saved</span>
          </div>

          <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400">
              Health Score
            </span>
            <div className="mt-1 text-base font-extrabold text-purple-600 dark:text-purple-400">
              {health.score}/100
            </div>
            <span className="text-[10px] text-slate-400">{health.rating} tier</span>
          </div>
        </div>

        {/* Top 3 Spending Categories */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Top 3 Expense Drivers
          </h4>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {sortedCategories.map((item, idx) => (
              <div
                key={item.category}
                className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400">
                      Rank #{idx + 1}
                    </span>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {item.category}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between text-xs">
                  <span className="font-black text-slate-900 dark:text-white">
                    {formatCurrency(item.amount, currencySymbol)}
                  </span>
                  <span className="font-semibold text-slate-500">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Performance Table */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            {t('budget_adherence_summary')}
          </h4>
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs dark:border-slate-800">
            <table className="w-full min-w-[540px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4 font-bold whitespace-nowrap">{t('table_col_category')}</th>
                  <th className="py-3 px-4 font-bold whitespace-nowrap">{t('table_col_budget_limit')}</th>
                  <th className="py-3 px-4 font-bold whitespace-nowrap">{t('table_col_actual_spent')}</th>
                  <th className="py-3 px-4 font-bold whitespace-nowrap text-right sm:text-left">{t('table_col_status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {budgets.map((b) => {
                  const spent =
                    b.category === 'Overall'
                      ? totalExpense
                      : catMap[b.category] || 0;
                  const pct = Math.round((spent / b.amount) * 100);
                  const isOver = pct >= 100;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {b.category === 'Overall' ? t('overall_label') : translateCategory(b.category)}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {formatCurrency(b.amount, currencySymbol)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(spent, currencySymbol)}{' '}
                        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">({pct}%)</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right sm:text-left">
                        <span
                          className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold shrink-0 tracking-wide ${
                            isOver
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/50'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/50'
                          }`}
                        >
                          {isOver ? t('status_exceeded') : t('status_within_target')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-8 border-t border-slate-100 pt-4 text-center text-[10px] text-slate-400 dark:border-slate-800">
          Spendly Automated Personal Finance Engine • Verified & Encrypted Local Data
        </div>
      </motion.div>
    </div>
  );
};
