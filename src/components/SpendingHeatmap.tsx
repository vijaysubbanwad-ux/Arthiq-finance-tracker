import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Flame, Info } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface SpendingHeatmapProps {
  transactions: Transaction[];
  currencySymbol?: string;
  onSelectDate?: (dateStr: string) => void;
}

export const SpendingHeatmap: React.FC<SpendingHeatmapProps> = ({
  transactions,
  currencySymbol = '₹',
  onSelectDate,
}) => {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month, -1 = last month
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    displayDate: string;
    totalSpent: number;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // Compute reference month
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + selectedMonthOffset, 1);
  const targetYear = targetDate.getFullYear();
  const targetMonth = targetDate.getMonth();

  const monthName = targetDate.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  // Calculate days in month
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(targetYear, targetMonth, 1).getDay(); // 0 = Sunday

  // Aggregate daily expenses for the target month
  const dailyData: Record<number, { total: number; count: number; dateStr: string }> = {};
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dailyData[d] = { total: 0, count: 0, dateStr: dStr };
  }

  let maxDailySpending = 1;
  transactions.forEach((tx) => {
    if (tx.type !== 'expense') return;
    const txDate = new Date(tx.date);
    if (txDate.getFullYear() === targetYear && txDate.getMonth() === targetMonth) {
      const dayNum = txDate.getDate();
      if (dailyData[dayNum]) {
        dailyData[dayNum].total += tx.amount;
        dailyData[dayNum].count += 1;
        if (dailyData[dayNum].total > maxDailySpending) {
          maxDailySpending = dailyData[dayNum].total;
        }
      }
    }
  });

  // Calculate intensity 0-4
  const getIntensity = (amount: number): number => {
    if (amount <= 0) return 0;
    const ratio = amount / maxDailySpending;
    if (ratio < 0.15) return 1;
    if (ratio < 0.4) return 2;
    if (ratio < 0.75) return 3;
    return 4;
  };

  const getCellColor = (intensity: number): string => {
    switch (intensity) {
      case 0:
        return 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border-slate-200/50 dark:border-slate-700/50';
      case 1:
        return 'bg-emerald-200 hover:bg-emerald-300 dark:bg-emerald-950 dark:border-emerald-800/50 dark:hover:bg-emerald-900 border-emerald-300';
      case 2:
        return 'bg-amber-300 hover:bg-amber-400 dark:bg-amber-800/70 dark:hover:bg-amber-700 border-amber-400';
      case 3:
        return 'bg-orange-400 hover:bg-orange-500 dark:bg-orange-600/80 dark:hover:bg-orange-500 border-orange-500 text-white';
      case 4:
        return 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 border-rose-600 text-white shadow-xs';
      default:
        return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days grid with blank padding for month offset
  const gridCells = [];
  for (let i = 0; i < firstDayWeekday; i++) {
    gridCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    gridCells.push(d);
  }

  // Monthly summary stats
  const totalMonthExpense = Object.values(dailyData).reduce((sum, item) => sum + item.total, 0);
  const activeSpendDays = Object.values(dailyData).filter((item) => item.total > 0).length;

  return (
    <div className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all dark:border-slate-800/80 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100/90 pb-4 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/5 shadow-xs dark:border-emerald-400/25 dark:from-emerald-500/25 dark:via-teal-500/15 dark:to-emerald-500/10">
            <Flame className="h-5 w-5 text-emerald-600 drop-shadow-xs dark:text-emerald-400" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900"></span>
            </span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Spending Heatmap
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-emerald-700 shadow-2xs dark:border-emerald-800/50 dark:bg-emerald-950/50 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Daily Outflow
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              Visual intensity map of day-to-day expenditure
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          {selectedMonthOffset < 0 && (
            <button
              type="button"
              onClick={() => setSelectedMonthOffset(0)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-2 py-1 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
              title="Reset to current month"
            >
              <span>Current</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1 shadow-2xs dark:border-slate-800 dark:bg-slate-800/60">
            <button
              type="button"
              onClick={() => setSelectedMonthOffset((prev) => prev - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 shadow-2xs transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100">
              <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="min-w-24 text-center">{monthName}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedMonthOffset((prev) => Math.min(0, prev + 1))}
              disabled={selectedMonthOffset >= 0}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 shadow-2xs transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 disabled:pointer-events-none disabled:opacity-30 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="my-3.5 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div>
          Total for {targetDate.toLocaleDateString('en-IN', { month: 'short' })}:{' '}
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalMonthExpense, currencySymbol)}
          </span>
        </div>
        <div className="hidden h-3 w-px bg-slate-200 dark:bg-slate-700 sm:block" />
        <div>
          Active Spending Days:{' '}
          <span className="font-bold text-slate-900 dark:text-white">
            {activeSpendDays} of {daysInMonth} days
          </span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[340px]">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 pb-1 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            {weekdays.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {gridCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-10 rounded-xl" />;
              }

              const data = dailyData[day];
              const intensity = getIntensity(data.total);
              const isToday =
                selectedMonthOffset === 0 &&
                now.getDate() === day &&
                now.getMonth() === targetMonth &&
                now.getFullYear() === targetYear;

              const displayDate = `${day} ${targetDate.toLocaleDateString('en-IN', { month: 'short' })}`;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => onSelectDate && onSelectDate(data.dateStr)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredDay({
                      dateStr: data.dateStr,
                      displayDate,
                      totalSpent: data.total,
                      count: data.count,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`relative flex h-11 cursor-pointer flex-col items-center justify-between rounded-xl border p-1 text-[11px] font-semibold transition-all hover:scale-105 active:scale-95 ${getCellColor(
                    intensity
                  )} ${isToday ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900' : ''}`}
                >
                  <span className="text-[10px] opacity-80">{day}</span>
                  {data.total > 0 ? (
                    <span className="truncate text-[9px] font-bold">
                      {currencySymbol}
                      {data.total >= 1000 ? `${(data.total / 1000).toFixed(0)}k` : data.total}
                    </span>
                  ) : (
                    <span className="text-[8px] opacity-30">—</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full pointer-events-none rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-white shadow-xl backdrop-blur-md dark:border-slate-600 dark:bg-slate-950"
          style={{
            left: `${hoveredDay.x}px`,
            top: `${hoveredDay.y - 8}px`,
          }}
        >
          <div className="text-[11px] font-bold text-slate-200">
            {hoveredDay.displayDate}
          </div>
          <div className="mt-0.5 text-xs font-extrabold text-emerald-400">
            {formatCurrency(hoveredDay.totalSpent, currencySymbol)} spent
          </div>
          <div className="text-[10px] text-slate-400">
            {hoveredDay.count} {hoveredDay.count === 1 ? 'transaction' : 'transactions'}
          </div>
        </div>
      )}

      {/* Intensity Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          <span>Click any day to filter timeline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]">Low</span>
          <div className="flex items-center gap-1">
            <span className="h-3 w-3 rounded-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
            <span className="h-3 w-3 rounded-xs bg-emerald-200 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800" />
            <span className="h-3 w-3 rounded-xs bg-amber-300 dark:bg-amber-800 border border-amber-400" />
            <span className="h-3 w-3 rounded-xs bg-orange-400 dark:bg-orange-600 border border-orange-500" />
            <span className="h-3 w-3 rounded-xs bg-rose-500 dark:bg-rose-600 border border-rose-600" />
          </div>
          <span className="text-[11px]">Heavy</span>
        </div>
      </div>
    </div>
  );
};
