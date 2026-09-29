import React from 'react';
import {
  Award,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FinancialHealthScore } from '../types';

interface FinancialHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  health: FinancialHealthScore;
}

export const FinancialHealthModal: React.FC<FinancialHealthModalProps> = ({
  isOpen,
  onClose,
  health,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4.5 sm:p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Financial Health Score Audit
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Score evaluation model & improvement tips
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

        {/* Big Score Summary Banner */}
        <div className="my-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Current Rating: {health.rating}
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {health.score} <span className="text-sm font-medium text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs">
                {health.score >= 80 ? 'Top 10% Habit' : health.score >= 68 ? 'Disciplined' : 'Needs Optimization'}
              </span>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
            {health.explanation}
          </p>
        </div>

        {/* 5 Core Pillars Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Algorithmic Breakdown Factors
          </h4>

          {health.breakdown.map((item, i) => {
            const percentage = Math.round((item.score / item.max) * 100);
            return (
              <div
                key={i}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <span>{item.label}</span>
                  <span>
                    {item.score} / {item.max} pts ({percentage}%)
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 80
                        ? 'bg-emerald-500'
                        : percentage >= 60
                        ? 'bg-teal-500'
                        : percentage >= 40
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Actionable Recommendations */}
        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-900/30 dark:bg-indigo-950/20">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300">
            <Lightbulb className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Recommended Actions to Reach 90+ Score</span>
          </div>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
            {health.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-indigo-500">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Got it
        </motion.button>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};
