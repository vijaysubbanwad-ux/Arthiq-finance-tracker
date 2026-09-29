import React, { useState } from 'react';
import {
  MinusCircle,
  PieChart,
  Plus,
  PlusCircle,
  Target,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface FloatingQuickAddProps {
  onOpenModal: (tab: 'expense' | 'income' | 'goal' | 'budget') => void;
}

export const FloatingQuickAdd: React.FC<FloatingQuickAddProps> = ({ onOpenModal }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (tab: 'expense' | 'income' | 'goal' | 'budget') => {
    setIsOpen(false);
    onOpenModal(tab);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:bottom-8 lg:right-8">
      {/* Backdrop when menu is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-2xs"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Speed Dial Options Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-40 flex flex-col items-end gap-2.5"
          >
            {/* Option 4: Add Budget */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleSelect('budget')}
              className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white py-2 pl-3.5 pr-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
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
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleSelect('goal')}
              className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white py-2 pl-3.5 pr-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
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
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleSelect('income')}
              className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white py-2 pl-3.5 pr-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
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
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => handleSelect('expense')}
              className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white py-2 pl-3.5 pr-2.5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
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

      {/* Main Trigger Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ duration: 0.2 }}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Speed dial quick add menu"
        className={`relative z-40 mt-2 flex h-13 w-13 items-center justify-center rounded-2xl shadow-xl transition-colors ${
          isOpen
            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
            : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30'
        }`}
      >
        <Plus className="h-6 w-6 stroke-[2.5]" />
      </motion.button>
    </div>
  );
};
