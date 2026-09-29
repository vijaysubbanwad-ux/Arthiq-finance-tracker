import React, { useState } from 'react';
import {
  BarChart3,
  LayoutDashboard,
  Menu,
  MinusCircle,
  PieChart,
  Plus,
  PlusCircle,
  Receipt,
  Target,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { ActiveTab } from '../types';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenModal: (tab: 'expense' | 'income' | 'goal' | 'budget') => void;
  onOpenSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenModal,
  onOpenSidebar,
}) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const isDashboard = activeTab === 'dashboard';
  const isTransactions = activeTab === 'transactions' || activeTab === 'income';
  const isAnalytics = activeTab === 'analytics';

  const handleSelectAction = (tab: 'expense' | 'income' | 'goal' | 'budget') => {
    setIsOpen(false);
    onOpenModal(tab);
  };

  return (
    <>
      {/* Backdrop when speed dial is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-2xs lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Speed Dial Options Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[55] flex flex-col items-center gap-2.5 lg:hidden"
          >
            {/* Option 4: Add Budget */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              type="button"
              onClick={() => handleSelectAction('budget')}
              className="flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white py-2 pl-4 pr-2.5 shadow-xl transition-all dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {t('action_set_budget')}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <PieChart className="h-4 w-4" />
              </span>
            </motion.button>

            {/* Option 3: Add Goal */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              type="button"
              onClick={() => handleSelectAction('goal')}
              className="flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white py-2 pl-4 pr-2.5 shadow-xl transition-all dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {t('action_add_goal')}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                <Target className="h-4 w-4" />
              </span>
            </motion.button>

            {/* Option 2: Add Income */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              type="button"
              onClick={() => handleSelectAction('income')}
              className="flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white py-2 pl-4 pr-2.5 shadow-xl transition-all dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {t('action_record_income')}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <PlusCircle className="h-4 w-4" />
              </span>
            </motion.button>

            {/* Option 1: Add Expense */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              type="button"
              onClick={() => handleSelectAction('expense')}
              className="flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white py-2 pl-4 pr-2.5 shadow-xl transition-all dark:border-slate-700 dark:bg-slate-800"
            >
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {t('action_log_expense')}
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                <MinusCircle className="h-4 w-4" />
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        aria-label="Mobile Navigation Bar"
        className="fixed bottom-0 inset-x-0 z-45 border-t border-slate-200/80 bg-white/95 backdrop-blur-lg shadow-lg dark:border-slate-800/80 dark:bg-slate-900/95 lg:hidden safe-bottom"
      >
        <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
          {/* Dashboard Tab */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
              isDashboard
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <LayoutDashboard className="h-5 w-5" />
              {isDashboard && (
                <motion.span
                  layoutId="bottomTabDot"
                  className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-600 dark:bg-emerald-400"
                />
              )}
            </div>
            <span className="mt-1 text-[10px]">{t('nav_dashboard')}</span>
          </motion.button>

          {/* Transactions Tab */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => onSelectTab('transactions')}
            className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
              isTransactions
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Receipt className="h-5 w-5" />
              {isTransactions && (
                <motion.span
                  layoutId="bottomTabDot"
                  className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-600 dark:bg-emerald-400"
                />
              )}
            </div>
            <span className="mt-1 text-[10px]">{t('nav_timeline')}</span>
          </motion.button>

          {/* Center Quick Add Speed Dial Trigger (Plus Icon) */}
          <div className="relative flex flex-1 items-center justify-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: isOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`flex h-12 w-12 -translate-y-3 items-center justify-center rounded-2xl shadow-lg transition-colors ${
                isOpen
                  ? 'bg-slate-900 text-white shadow-slate-900/40 dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-emerald-500/30'
              }`}
              aria-label="Speed dial quick add menu"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </motion.button>
          </div>

          {/* Analytics Tab */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => onSelectTab('analytics')}
            className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
              isAnalytics
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <BarChart3 className="h-5 w-5" />
              {isAnalytics && (
                <motion.span
                  layoutId="bottomTabDot"
                  className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-600 dark:bg-emerald-400"
                />
              )}
            </div>
            <span className="mt-1 text-[10px]">{t('nav_analytics')}</span>
          </motion.button>

          {/* Menu Drawer Toggle */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={onOpenSidebar}
            className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors ${
              !isDashboard && !isTransactions && !isAnalytics
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Menu className="h-5 w-5" />
              {!isDashboard && !isTransactions && !isAnalytics && (
                <motion.span
                  layoutId="bottomTabDot"
                  className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-600 dark:bg-emerald-400"
                />
              )}
            </div>
            <span className="mt-1 text-[10px]">{t('nav_menu')}</span>
          </motion.button>
        </div>
      </nav>
    </>
  );
};
