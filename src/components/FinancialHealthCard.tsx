import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Info,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { FinancialHealthScore } from '../types';

interface FinancialHealthCardProps {
  health: FinancialHealthScore;
  onOpenDetails: () => void;
}

export const FinancialHealthCard: React.FC<FinancialHealthCardProps> = ({
  health,
  onOpenDetails,
}) => {
  const { t } = useLanguage();
  // Circular gauge calculations (radius = 38, perimeter = 2 * PI * 38 = ~238.76)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (health.score / 100) * circumference;

  const getRatingColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 68) return 'text-teal-500 stroke-teal-500';
    if (score >= 50) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const getRatingBadge = (rating: FinancialHealthScore['rating']) => {
    switch (rating) {
      case 'Excellent':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Good':
        return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800';
      case 'Average':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all dark:border-slate-800/80 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        {/* Left: Score Circle + Heading */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="9"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`transition-all duration-1000 ease-out ${getRatingColor(health.score)}`}
                strokeWidth="9"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {health.score}
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-400">
                / 100
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white md:text-base">
                {t('financial_health_score')}
              </h3>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getRatingBadge(
                  health.rating
                )}`}
              >
                {health.rating}
              </span>
            </div>
            <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
              {health.explanation}
            </p>
          </div>
        </div>

        {/* Right: Quick Breakdown Pills & Action Button */}
        <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:items-center md:flex-col md:items-end">
          <div className="grid grid-cols-2 gap-2 text-xs sm:flex sm:items-center">
            <div className="rounded-lg bg-slate-50 px-2.5 py-1 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              <span className="text-slate-400 text-[10px] block">{t('savings_rate_pill')}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {health.savingsRateScore}/30
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 px-2.5 py-1 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              <span className="text-slate-400 text-[10px] block">{t('budget_discipline_pill')}</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {health.budgetUsageScore}/25
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenDetails}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            <span>{t('view_breakdown')}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
