import React, { useState } from 'react';
import {
  ArrowLeftRight,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Coins,
  Copy,
  Globe,
  Info,
  Sparkles,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CurrencyCode } from '../types';
import {
  convertCurrency,
  formatCurrencyInCode,
  formatExchangeRateRelation,
  getCurrencyMeta,
  getExchangeRate,
  SUPPORTED_CURRENCIES,
} from '../utils/currency';
import { useLanguage } from '../context/LanguageContext';

interface AlternativeCurrenciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseCurrency?: string;
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  activeDisplayCurrency: string;
  onSelectDisplayCurrency: (currency: CurrencyCode) => void;
  onResetToBaseCurrency: () => void;
}

export const AlternativeCurrenciesModal: React.FC<AlternativeCurrenciesModalProps> = ({
  isOpen,
  onClose,
  baseCurrency = 'INR',
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  monthlySavings,
  activeDisplayCurrency,
  onSelectDisplayCurrency,
  onResetToBaseCurrency,
}) => {
  const { t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [calculatorAmount, setCalculatorAmount] = useState<string>(
    Math.round(Math.abs(totalBalance)).toString()
  );
  const [calculatorFrom, setCalculatorFrom] = useState<string>(baseCurrency);
  const [calculatorTo, setCalculatorTo] = useState<string>(
    activeDisplayCurrency !== baseCurrency ? activeDisplayCurrency : 'USD'
  );

  const baseMeta = getCurrencyMeta(baseCurrency);
  const activeMeta = getCurrencyMeta(activeDisplayCurrency);
  const isAltActive = activeDisplayCurrency.toUpperCase() !== baseCurrency.toUpperCase();

  const handleCopy = (code: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  const parsedCalcAmount = parseFloat(calculatorAmount) || 0;
  const calcResult = convertCurrency(parsedCalcAmount, calculatorFrom, calculatorTo);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black tracking-tight text-slate-900 sm:text-lg dark:text-white">
                    Alternative Currencies Balance View
                  </h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    Quick Action
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instantly view and switch balance totals across international currencies
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Active Status & Base Info Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-xs dark:bg-slate-800">
                  {activeMeta.flag}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Active Display: {activeMeta.code} ({activeMeta.symbol})
                    </span>
                    {isAltActive ? (
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        Alternative Mode
                      </span>
                    ) : (
                      <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        Base Currency
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAltActive
                      ? `Displaying totals in ${activeMeta.name}. Base records remain safely tracked in ${baseMeta.code}.`
                      : `Standard base tracking in ${baseMeta.name} (${baseMeta.code}).`}
                  </p>
                </div>
              </div>

              {isAltActive && (
                <button
                  type="button"
                  onClick={() => {
                    onResetToBaseCurrency();
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <ArrowLeftRight className="h-3.5 w-3.5" />
                  <span>Reset to Base ({baseMeta.code})</span>
                </button>
              )}
            </div>

            {/* Base Totals Bar (Quick Reference) */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Base Net Balance
                </span>
                <div className="mt-1 text-base font-black text-slate-900 dark:text-white">
                  {formatCurrencyInCode(totalBalance, baseMeta.code)}
                </div>
                <span className="text-[10px] text-slate-400">{baseMeta.code} Standard</span>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Base Inflow
                </span>
                <div className="mt-1 text-base font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrencyInCode(monthlyIncome, baseMeta.code)}
                </div>
                <span className="text-[10px] text-slate-400">This Month</span>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Base Outflow
                </span>
                <div className="mt-1 text-base font-black text-rose-600 dark:text-rose-400">
                  {formatCurrencyInCode(monthlyExpense, baseMeta.code)}
                </div>
                <span className="text-[10px] text-slate-400">This Month</span>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Net Savings
                </span>
                <div className="mt-1 text-base font-black text-sky-600 dark:text-sky-400">
                  {formatCurrencyInCode(monthlySavings, baseMeta.code)}
                </div>
                <span className="text-[10px] text-slate-400">Surplus</span>
              </div>
            </div>

            {/* Currencies Grid */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Live Converted Balances ({SUPPORTED_CURRENCIES.length} Global Currencies)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  Click any currency to display on Dashboard
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {SUPPORTED_CURRENCIES.map((currency) => {
                  const isCurrentActive =
                    activeDisplayCurrency.toUpperCase() === currency.code;
                  const isBase = baseCurrency.toUpperCase() === currency.code;

                  const convertedBalance = convertCurrency(
                    totalBalance,
                    baseCurrency,
                    currency.code
                  );
                  const convertedIncome = convertCurrency(
                    monthlyIncome,
                    baseCurrency,
                    currency.code
                  );
                  const convertedExpense = convertCurrency(
                    monthlyExpense,
                    baseCurrency,
                    currency.code
                  );

                  const formattedBalanceStr = formatCurrencyInCode(
                    convertedBalance,
                    currency.code
                  );

                  return (
                    <motion.div
                      whileHover={{ y: -2 }}
                      key={currency.code}
                      className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                        isCurrentActive
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500 dark:border-emerald-500 dark:bg-emerald-950/20'
                          : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Top row: Flag, Name, Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl" role="img" aria-label={currency.name}>
                            {currency.flag}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {currency.code}
                              </span>
                              <span className="text-xs text-slate-400">
                                · {currency.symbol}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              {currency.name}
                            </div>
                          </div>
                        </div>

                        {isCurrentActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                            <span>Active</span>
                          </span>
                        ) : isBase ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Base
                          </span>
                        ) : null}
                      </div>

                      {/* Middle: Converted Balance */}
                      <div className="my-3">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Total Balance
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                            {formattedBalanceStr}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(currency.code, formattedBalanceStr)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Copy amount"
                          >
                            {copiedCode === currency.code ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Rate hint */}
                        <div className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          {formatExchangeRateRelation(baseCurrency, currency.code)}
                        </div>
                      </div>

                      {/* Inflow / Outflow Miniature stats */}
                      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 text-[11px] dark:border-slate-800/80">
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <ArrowDownRight className="h-3 w-3" />
                          <span>{formatCurrencyInCode(convertedIncome, currency.code, { compact: true })}</span>
                        </div>
                        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                          <ArrowUpRight className="h-3 w-3" />
                          <span>{formatCurrencyInCode(convertedExpense, currency.code, { compact: true })}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectDisplayCurrency(currency.code);
                          }}
                          className={`w-full rounded-xl py-1.5 text-xs font-bold transition ${
                            isCurrentActive
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                          }`}
                        >
                          {isCurrentActive ? 'Active on Dashboard' : `Display in ${currency.code}`}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Quick FX Calculator */}
            <div className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Quick Currency Calculator
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-12 items-center">
                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Amount & Source
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={calculatorAmount}
                      onChange={(e) => setCalculatorAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="0.00"
                    />
                    <select
                      id="currency-calc-from"
                      aria-label="Source currency"
                      value={calculatorFrom}
                      onChange={(e) => setCalculatorFrom(e.target.value)}
                      className="w-28 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={`from-${c.code}`} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Preset quick chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setCalculatorAmount(Math.round(Math.abs(totalBalance)).toString())}
                      className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Total Balance
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalculatorAmount(Math.round(monthlyIncome).toString())}
                      className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Monthly Inflow
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalculatorAmount('10000')}
                      className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      10,000
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalculatorAmount('50000')}
                      className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      50,000
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2 flex justify-center py-1">
                  <button
                    type="button"
                    onClick={() => {
                      const prevFrom = calculatorFrom;
                      setCalculatorFrom(calculatorTo);
                      setCalculatorTo(prevFrom);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-2xs hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    title="Swap currencies"
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="sm:col-span-5 space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    Converted Result & Target
                  </label>
                  <div className="flex gap-2">
                    <div className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-emerald-50/50 px-3 py-2 text-sm font-black text-emerald-900 dark:border-slate-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      <span>{formatCurrencyInCode(calcResult, calculatorTo)}</span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {calculatorTo}
                      </span>
                    </div>
                    <select
                      id="currency-calc-to"
                      aria-label="Target currency"
                      value={calculatorTo}
                      onChange={(e) => setCalculatorTo(e.target.value)}
                      className="w-28 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {SUPPORTED_CURRENCIES.map((c) => (
                        <option key={`to-${c.code}`} value={c.code}>
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Rate: {formatExchangeRateRelation(calculatorFrom, calculatorTo)}
                  </div>
                </div>
              </div>
            </div>

            {/* Benchmark Disclosure */}
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
              <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
              <span>
                Exchange rates are calculated via standardized international interbank benchmarks.
                Switching display currency provides convenient views for international users and expatriates without altering your core database records.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
