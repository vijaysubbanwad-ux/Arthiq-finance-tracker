import React from 'react';
import { ArrowRight, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { ActiveTab, SmartInsight } from '../types';

interface SmartInsightCardProps {
  insights: SmartInsight[];
  onNavigateTab: (tab: ActiveTab) => void;
}

export const SmartInsightCard: React.FC<SmartInsightCardProps> = ({
  insights,
  onNavigateTab,
}) => {
  if (insights.length === 0) return null;

  return (
    <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/50 p-5 shadow-xs dark:border-purple-900/40 dark:from-purple-950/20 dark:via-slate-900 dark:to-indigo-950/20">
      {/* Header */}
      <div className="mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
              SpendSense Smart Insights
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Automated behavioral intelligence from your spending logs
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateTab('ai-chat')}
          className="flex items-center gap-1 text-xs font-semibold text-purple-700 hover:text-purple-800 dark:text-purple-300 dark:hover:text-purple-200"
        >
          <span>Ask AI</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            onClick={() => insight.actionTab && onNavigateTab(insight.actionTab as ActiveTab)}
            className="group relative cursor-pointer rounded-xl border border-slate-200/90 bg-white/90 p-3.5 transition-all hover:border-purple-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-purple-700"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xl">{insight.icon}</span>
              {insight.badgeText && (
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                  {insight.badgeText}
                </span>
              )}
            </div>
            <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
              {insight.title}
            </h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
