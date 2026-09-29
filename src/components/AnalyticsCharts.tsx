import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Filter,
  PieChart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Transaction } from '../types';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  formatCurrency,
} from '../utils/formatters';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  currencySymbol?: string;
}

type DateRangeFilter = '7d' | '30d' | '3m' | '6m' | '1y';

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  currencySymbol = '₹',
}) => {
  const [range, setRange] = useState<DateRangeFilter>('30d');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<{
    date: string;
    expense: number;
    income: number;
    x: number;
    y: number;
  } | null>(null);

  // Filter transactions by range
  const filteredTxs = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();

    if (range === '7d') cutoff.setDate(now.getDate() - 7);
    else if (range === '30d') cutoff.setDate(now.getDate() - 30);
    else if (range === '3m') cutoff.setMonth(now.getMonth() - 3);
    else if (range === '6m') cutoff.setMonth(now.getMonth() - 6);
    else if (range === '1y') cutoff.setFullYear(now.getFullYear() - 1);

    return transactions.filter((t) => new Date(t.date) >= cutoff);
  }, [transactions, range]);

  // High-level statistics
  const stats = useMemo(() => {
    const expenses = filteredTxs.filter((t) => t.type === 'expense');
    const income = filteredTxs.filter((t) => t.type === 'income');

    const totalExp = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalInc = income.reduce((sum, t) => sum + t.amount, 0);
    const netSavings = totalInc - totalExp;
    const savingsRate = totalInc > 0 ? Math.max(0, (netSavings / totalInc) * 100) : 0;

    // Unique days count in range
    const daysSet = new Set(expenses.map((t) => t.date));
    const activeDaysCount = Math.max(1, daysSet.size);
    const avgDailySpending = Math.round(totalExp / activeDaysCount);

    // Highest expense
    let highestExp: Transaction | null = null;
    expenses.forEach((t) => {
      if (!highestExp || t.amount > highestExp.amount) highestExp = t;
    });

    // Highest category
    const catTotals: Record<string, number> = {};
    expenses.forEach((t) => {
      catTotals[t.category] = (catTotals[t.category] || 0) + t.amount;
    });

    let topCat = 'None';
    let topCatAmt = 0;
    Object.entries(catTotals).forEach(([cat, amt]) => {
      if (amt > topCatAmt) {
        topCatAmt = amt;
        topCat = cat;
      }
    });

    // Monthly average
    const monthsCount = range === '7d' || range === '30d' ? 1 : range === '3m' ? 3 : range === '6m' ? 6 : 12;
    const monthlyAvgExp = Math.round(totalExp / monthsCount);

    return {
      totalExp,
      totalInc,
      netSavings,
      savingsRate,
      avgDailySpending,
      highestExp,
      topCat,
      topCatAmt,
      monthlyAvgExp,
    };
  }, [filteredTxs, range]);

  // Chart 1: Category Expense Donut Breakdown
  const categoryBreakdown = useMemo(() => {
    const expenses = filteredTxs.filter((t) => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    const map: Record<string, number> = {};

    expenses.forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });

    return Object.entries(map)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: CATEGORY_COLORS[category]?.accent || '#64748b',
        icon: CATEGORY_ICONS[category as any] || '🧾',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTxs]);

  // Chart 2: Daily Spending Trend (Last N days chronological)
  const dailyTrendData = useMemo(() => {
    const dayMap: Record<string, { date: string; expense: number; income: number }> = {};

    // Sort all relevant dates
    filteredTxs.forEach((t) => {
      if (!dayMap[t.date]) {
        dayMap[t.date] = { date: t.date, expense: 0, income: 0 };
      }
      if (t.type === 'expense') dayMap[t.date].expense += t.amount;
      if (t.type === 'income') dayMap[t.date].income += t.amount;
    });

    const sorted = Object.values(dayMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return sorted;
  }, [filteredTxs]);

  // Chart 3: Payment Method Breakdown
  const paymentBreakdown = useMemo(() => {
    const expenses = filteredTxs.filter((t) => t.type === 'expense');
    const total = expenses.reduce((sum, t) => sum + t.amount, 0);
    const map: Record<string, number> = {};

    expenses.forEach((t) => {
      map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.amount;
    });

    return Object.entries(map)
      .map(([method, amount]) => ({
        method,
        amount,
        percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTxs]);

  return (
    <div className="space-y-6">
      {/* Top Header & Range Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white md:text-xl">
            Analytics & Financial Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deep dive trends, category allocations, and cash flows
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div className="flex items-center overflow-x-auto max-w-full rounded-xl border border-slate-200 bg-white p-1 shadow-2xs dark:border-slate-800 dark:bg-slate-900 shrink-0">
          {(['7d', '30d', '3m', '6m', '1y'] as DateRangeFilter[]).map((tab) => (
            <motion.button
              whileTap={{ scale: 0.96 }}
              key={tab}
              type="button"
              onClick={() => setRange(tab)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition ${
                range === tab
                  ? 'bg-emerald-600 text-white shadow-xs dark:bg-emerald-500'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab === '7d' && '7 Days'}
              {tab === '30d' && '30 Days'}
              {tab === '3m' && '3 Months'}
              {tab === '6m' && '6 Months'}
              {tab === '1y' && '1 Year'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Useful Statistics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Avg Daily Spending
          </span>
          <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(stats.avgDailySpending, currencySymbol)}
          </div>
          <span className="text-[10px] text-slate-500">Per active day</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Highest Expense
          </span>
          <div className="mt-1 truncate text-base font-extrabold text-rose-600 dark:text-rose-400">
            {stats.highestExp
              ? formatCurrency(stats.highestExp.amount, currencySymbol)
              : '₹0'}
          </div>
          <span className="truncate text-[10px] text-slate-500 block">
            {stats.highestExp ? stats.highestExp.title : 'None'}
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Highest Category
          </span>
          <div className="mt-1 truncate text-base font-extrabold text-amber-600 dark:text-amber-400">
            {stats.topCat}
          </div>
          <span className="text-[10px] text-slate-500">
            {formatCurrency(stats.topCatAmt, currencySymbol)}
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Savings Rate
          </span>
          <div className="mt-1 text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {stats.savingsRate.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-500">Of total income</span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs dark:border-slate-800/80 dark:bg-slate-900 col-span-2 sm:col-span-1"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Monthly Average
          </span>
          <div className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(stats.monthlyAvgExp, currencySymbol)}
          </div>
          <span className="text-[10px] text-slate-500">Projected pace</span>
        </motion.div>
      </div>

      {/* Row 1: Income vs Expense & Category Donut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Income vs Expense Comparative Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Income vs Expense Flow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cash inflow against total spending
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Income
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Expense
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {/* Income bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <ArrowDownRight className="h-3.5 w-3.5 text-emerald-500" /> Total Inflow
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(stats.totalInc, currencySymbol)}
                </span>
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{
                    width: `${
                      stats.totalInc + stats.totalExp > 0
                        ? (stats.totalInc / (stats.totalInc + stats.totalExp)) * 100
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Expense bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="h-3.5 w-3.5 text-rose-500" /> Total Outflow
                </span>
                <span className="text-rose-600 dark:text-rose-400">
                  {formatCurrency(stats.totalExp, currencySymbol)}
                </span>
              </div>
              <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-rose-500 transition-all duration-700"
                  style={{
                    width: `${
                      stats.totalInc + stats.totalExp > 0
                        ? (stats.totalExp / (stats.totalInc + stats.totalExp)) * 100
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Net Savings Box */}
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Net Surplus / Savings</span>
                <span
                  className={`text-sm font-black ${
                    stats.netSavings >= 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {stats.netSavings >= 0 ? '+' : ''}
                  {formatCurrency(stats.netSavings, currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown Donut / List */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Category Expense Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Where your money was allocated
              </p>
            </div>
            <PieChart className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-4 space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {categoryBreakdown.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                No expense categories logged in this period
              </p>
            ) : (
              categoryBreakdown.map((item) => (
                <div
                  key={item.category}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 transition hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-800/30 dark:hover:bg-slate-800/60"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.amount, currencySymbol)}{' '}
                      <span className="text-[10px] font-normal text-slate-400">
                        ({item.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Daily Spending Trend Area Chart & Payment Method Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daily Spending Trend (2 Cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Spending Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fluctuations in expenditure over time
              </p>
            </div>
            <TrendingDown className="h-4 w-4 text-slate-400" />
          </div>

          {dailyTrendData.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-xs text-slate-400">
              No transactions recorded in this date range
            </div>
          ) : (
            <div className="mt-4">
              {/* Responsive SVG Sparkline / Area */}
              <div className="relative h-48 w-full">
                <svg
                  className="h-full w-full overflow-visible"
                  viewBox={`0 0 ${Math.max(100, dailyTrendData.length * 40)} 160`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal grid guide lines */}
                  <line x1="0" y1="30" x2="1000" y2="30" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <line x1="0" y1="80" x2="1000" y2="80" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />
                  <line x1="0" y1="130" x2="1000" y2="130" stroke="currentColor" strokeDasharray="3 3" className="text-slate-200 dark:text-slate-800" strokeWidth="1" />

                  {(() => {
                    const maxVal = Math.max(100, ...dailyTrendData.map((d) => d.expense));
                    const widthStep = Math.max(100, dailyTrendData.length * 40) / Math.max(1, dailyTrendData.length - 1);

                    const points = dailyTrendData.map((d, i) => {
                      const x = i * widthStep;
                      const y = 140 - (d.expense / maxVal) * 110;
                      return { x, y, data: d };
                    });

                    const pathD = points.reduce(
                      (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                      ''
                    );

                    const areaD = `${pathD} L ${points[points.length - 1].x} 140 L 0 140 Z`;

                    return (
                      <>
                        <path d={areaD} fill="url(#areaGradient)" />
                        <path
                          d={pathD}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {points.map((p, i) => (
                          <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="4"
                            className="fill-white stroke-emerald-600 transition-all hover:r-6 cursor-pointer dark:fill-slate-900"
                            strokeWidth="2"
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredTrendPoint({
                                date: p.data.date,
                                expense: p.data.expense,
                                income: p.data.income,
                                x: rect.left,
                                y: rect.top,
                              });
                            }}
                            onMouseLeave={() => setHoveredTrendPoint(null)}
                          />
                        ))}
                      </>
                    );
                  })()}
                </svg>

                {/* Hover Tooltip */}
                {hoveredTrendPoint && (
                  <div
                    className="fixed z-50 -translate-x-1/2 -translate-y-full pointer-events-none rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-white shadow-xl backdrop-blur-md dark:border-slate-600 dark:bg-slate-950"
                    style={{
                      left: `${hoveredTrendPoint.x}px`,
                      top: `${hoveredTrendPoint.y - 8}px`,
                    }}
                  >
                    <div className="text-[10px] font-bold text-slate-300">
                      {hoveredTrendPoint.date}
                    </div>
                    <div className="text-xs font-bold text-emerald-400">
                      Expense: {formatCurrency(hoveredTrendPoint.expense, currencySymbol)}
                    </div>
                    {hoveredTrendPoint.income > 0 && (
                      <div className="text-[10px] font-bold text-teal-300">
                        Income: +{formatCurrency(hoveredTrendPoint.income, currencySymbol)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Payment Method Breakdown (1 Col) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Payment Channels
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown by transaction mode
              </p>
            </div>
            <CreditCard className="h-4 w-4 text-slate-400" />
          </div>

          <div className="mt-4 space-y-3">
            {paymentBreakdown.map((pm) => (
              <div key={pm.method} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{pm.method}</span>
                  <span>
                    {formatCurrency(pm.amount, currencySymbol)}{' '}
                    <span className="text-slate-400 font-normal">({pm.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${pm.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
