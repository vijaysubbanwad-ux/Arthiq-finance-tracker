import { ExpenseCategory, IncomeSource, PaymentMethod } from '../types';

export function formatCurrency(amount: number, symbol = '₹'): string {
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  return `${symbol}${formatted}`;
}

export function formatCompactCurrency(amount: number, symbol = '₹'): string {
  if (Math.abs(amount) >= 100000) {
    return `${symbol}${(amount / 100000).toFixed(1)}L`;
  }
  if (Math.abs(amount) >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}k`;
  }
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateString: string): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimelineDate(dateString: string): string {
  const d = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  if (isToday) return 'Today';

  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

export const CATEGORY_ICONS: Record<ExpenseCategory | IncomeSource, string> = {
  Food: '🍔',
  Travel: '🚗',
  Shopping: '🛍️',
  Education: '📚',
  Bills: '💡',
  Entertainment: '🎮',
  Healthcare: '🏥',
  Rent: '🏠',
  Subscriptions: '📱',
  Other: '🧾',
  Salary: '💼',
  'Pocket Money': '💰',
  Freelance: '💻',
  Scholarship: '🎓',
  Business: '📈',
};

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  Food: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/40', accent: '#f59e0b' },
  Travel: { bg: 'bg-sky-50 dark:bg-sky-950/30', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800/40', accent: '#0284c7' },
  Shopping: { bg: 'bg-pink-50 dark:bg-pink-950/30', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800/40', accent: '#ec4899' },
  Education: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/40', accent: '#6366f1' },
  Bills: { bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800/40', accent: '#f97316' },
  Entertainment: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/40', accent: '#a855f7' },
  Healthcare: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/40', accent: '#f43f5e' },
  Rent: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800/40', accent: '#0d9488' },
  Subscriptions: { bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800/40', accent: '#8b5cf6' },
  Other: { bg: 'bg-slate-100 dark:bg-slate-800/40', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700', accent: '#64748b' },
  Salary: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/40', accent: '#10b981' },
  'Pocket Money': { bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800/40', accent: '#22c55e' },
  Freelance: { bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800/40', accent: '#06b6d4' },
  Scholarship: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/40', accent: '#3b82f6' },
  Business: { bg: 'bg-lime-50 dark:bg-lime-950/30', text: 'text-lime-700 dark:text-lime-300', border: 'border-lime-200 dark:border-lime-800/40', accent: '#84cc16' },
};

export const PAYMENT_METHOD_BADGES: Record<PaymentMethod, { label: string; icon: string }> = {
  Cash: { label: 'Cash', icon: '💵' },
  UPI: { label: 'UPI', icon: '⚡' },
  'Debit Card': { label: 'Debit Card', icon: '💳' },
  'Credit Card': { label: 'Credit Card', icon: '💎' },
  'Bank Transfer': { label: 'Bank Transfer', icon: '🏦' },
};
