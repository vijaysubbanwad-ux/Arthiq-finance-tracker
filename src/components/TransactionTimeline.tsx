import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CreditCard,
  Download,
  Edit2,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ExpenseCategory,
  IncomeSource,
  PaymentMethod,
  Transaction,
} from '../types';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  formatCurrency,
  formatTimelineDate,
  PAYMENT_METHOD_BADGES,
} from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

interface TransactionTimelineProps {
  transactions: Transaction[];
  onAddClick: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  currencySymbol?: string;
  initialFilterDate?: string | null;
  onClearDateFilter?: () => void;
}

export const TransactionTimeline: React.FC<TransactionTimelineProps> = ({
  transactions,
  onAddClick,
  onEditTransaction,
  onDeleteTransaction,
  currencySymbol = '₹',
  initialFilterDate = null,
  onClearDateFilter,
}) => {
  const { t, translateCategory, translatePaymentMethod } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Edit modal state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Date filter if coming from heatmap click
        if (initialFilterDate && !tx.date.startsWith(initialFilterDate)) {
          return false;
        }

        // Search term (name, description, amount)
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = tx.title.toLowerCase().includes(term);
          const matchDesc = tx.description?.toLowerCase().includes(term) ?? false;
          const matchCat = tx.category.toLowerCase().includes(term);
          const matchAmt = tx.amount.toString().includes(term);
          if (!matchTitle && !matchDesc && !matchCat && !matchAmt) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

        // Payment method filter
        if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'highest') return b.amount - a.amount;
        if (sortBy === 'lowest') return a.amount - b.amount;
        return 0;
      });
  }, [
    transactions,
    searchTerm,
    typeFilter,
    categoryFilter,
    paymentFilter,
    sortBy,
    initialFilterDate,
  ]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { dateKey: string; label: string; items: Transaction[] }[] = [];
    const dateMap = new Map<string, Transaction[]>();

    filteredTransactions.forEach((tx) => {
      const existing = dateMap.get(tx.date) || [];
      existing.push(tx);
      dateMap.set(tx.date, existing);
    });

    // preserve sort order of dates
    const seenDates = new Set<string>();
    filteredTransactions.forEach((tx) => {
      if (!seenDates.has(tx.date)) {
        seenDates.add(tx.date);
        groups.push({
          dateKey: tx.date,
          label: formatTimelineDate(tx.date),
          items: dateMap.get(tx.date) || [],
        });
      }
    });

    return groups;
  }, [filteredTransactions]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Title', 'Category', 'Amount', 'Payment Method', 'Description'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.date,
      tx.type,
      `"${tx.title.replace(/"/g, '""')}"`,
      tx.category,
      tx.amount,
      tx.paymentMethod,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Spendly_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    onEditTransaction(editingTx);
    setEditingTx(null);
  };

  // Get unique categories for dropdown
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  return (
    <div className="space-y-4">
      {/* Controls & Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('search_transactions_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search input"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-3 my-auto text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Download filtered transactions as CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('export_csv')}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onAddClick}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              <Plus className="h-4 w-4" />
              <span>{t('record_transaction')}</span>
            </motion.button>
          </div>
        </div>

        {/* Filters and Sorting Row */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {/* Type Toggle Pills */}
          <div className="flex items-center rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('filter_all')}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('expense')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                typeFilter === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs dark:bg-slate-900 dark:text-rose-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('filter_expenses')}
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter('income')}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('filter_income')}
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            id="tx-filter-category"
            aria-label={t('category_label')}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">{t('all_categories')}</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {translateCategory(c)}
              </option>
            ))}
          </select>

          {/* Payment Method Dropdown */}
          <select
            id="tx-filter-payment-method"
            aria-label={t('payment_method_label')}
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="all">{t('all_payment_methods')}</option>
            <option value="UPI">UPI</option>
            <option value="Cash">{translatePaymentMethod('Cash')}</option>
            <option value="Debit Card">{translatePaymentMethod('Debit Card')}</option>
            <option value="Credit Card">{translatePaymentMethod('Credit Card')}</option>
            <option value="Bank Transfer">{translatePaymentMethod('Bank Transfer')}</option>
          </select>

          {/* Sort Dropdown */}
          <select
            id="tx-sort-by"
            aria-label="Sort Transactions"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="ml-auto rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="newest">{t('sort_newest')}</option>
            <option value="oldest">{t('sort_oldest')}</option>
            <option value="highest">{t('sort_highest')}</option>
            <option value="lowest">{t('sort_lowest')}</option>
          </select>
        </div>

        {/* Active Heatmap Date Filter Badge */}
        {initialFilterDate && (
          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <span>Filtered by Date: <strong>{initialFilterDate}</strong></span>
            {onClearDateFilter && (
              <button
                type="button"
                onClick={onClearDateFilter}
                className="font-bold underline hover:opacity-80"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modern Timeline Container */}
      <div className="space-y-6">
        {groupedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
            <span className="text-4xl">🔍</span>
            <h4 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">
              No transactions match your filter
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try adjusting your search keyword or clearing active filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setCategoryFilter('all');
                setPaymentFilter('all');
                if (onClearDateFilter) onClearDateFilter();
              }}
              className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          groupedTransactions.map((group) => (
            <div key={group.dateKey} className="relative">
              {/* Group Date Header */}
              <div className="sticky top-16 z-20 mb-2.5 flex items-center gap-2 bg-slate-50/90 py-1 backdrop-blur-xs dark:bg-slate-950/90">
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-extrabold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  {group.label}
                </span>
                <span className="text-[11px] text-slate-400">
                  ({group.items.length} {group.items.length === 1 ? 'entry' : 'entries'})
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {group.items.map((tx, idx) => {
                    const isIncome = tx.type === 'income';
                    const catIcon = CATEGORY_ICONS[tx.category] || '🧾';
                    const pBadge = PAYMENT_METHOD_BADGES[tx.paymentMethod] || {
                      label: tx.paymentMethod,
                      icon: '💳',
                    };

                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, height: 0 }}
                        transition={{ duration: 0.22, delay: Math.min(idx * 0.02, 0.2) }}
                        whileHover={{ y: -1 }}
                        className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition-shadow hover:border-slate-300 hover:shadow-xs dark:border-slate-800/80 dark:bg-slate-900 dark:hover:border-slate-700"
                      >
                        {/* Left: Icon and Details */}
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg shadow-2xs ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}
                          >
                            {catIcon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white md:text-sm truncate">
                                {tx.title}
                              </span>
                              <span
                                className={`inline-flex items-center justify-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-semibold shrink-0 ${
                                  isIncome
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                {translateCategory(tx.category)}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <span>{pBadge.icon}</span>
                                <span>{translatePaymentMethod(tx.paymentMethod)}</span>
                              </span>
                              {tx.description && (
                                <>
                                  <span>•</span>
                                  <span className="line-clamp-1 italic text-slate-400">
                                    {tx.description}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Amount and Actions */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span
                              className={`text-sm font-black md:text-base ${
                                isIncome
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {isIncome ? '+' : '-'}
                              {formatCurrency(tx.amount, currencySymbol)}
                            </span>
                            <div className="text-[10px] font-medium text-slate-400">
                              {tx.date}
                            </div>
                          </div>

                          {/* Hover Quick Edit / Delete */}
                          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 sm:opacity-0 transition-opacity">
                            <button
                              type="button"
                              aria-label="Edit transaction"
                              onClick={() => setEditingTx(tx)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-95 transition dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Delete transaction"
                              onClick={() => setDeleteConfirmId(tx.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative z-10 w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Delete Transaction?
              </h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                Are you sure you want to delete this transaction? This action will adjust your balance and cannot be undone.
              </p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => {
                    onDeleteTransaction(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Transaction Modal */}
      <AnimatePresence>
        {editingTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTx(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Edit Transaction
                </h4>
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={() => setEditingTx(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTx.title}
                    onChange={(e) => setEditingTx({ ...editingTx, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Amount ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingTx.amount}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-tx-payment-method" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Payment Method
                    </label>
                    <select
                      id="edit-tx-payment-method"
                      aria-label="Payment Method"
                      value={editingTx.paymentMethod}
                      onChange={(e) =>
                        setEditingTx({ ...editingTx, paymentMethod: e.target.value as any })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={editingTx.date}
                      onChange={(e) => setEditingTx({ ...editingTx, date: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={editingTx.description || ''}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, description: e.target.value })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingTx(null)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  >
                    Save Changes
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
