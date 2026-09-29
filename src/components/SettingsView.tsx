import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  Download,
  Globe,
  LogIn,
  LogOut,
  Moon,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Language, UserProfile } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/translations';

interface SettingsViewProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onResetDemoData: () => void;
  onClearAllData: () => void;
  onExportJson: () => void;
  onImportJson: (jsonData: any) => boolean;
  currencySymbol: string;
  onOpenAuthModal?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  onUpdateProfile,
  onResetDemoData,
  onClearAllData,
  onExportJson,
  onImportJson,
  currencySymbol,
  onOpenAuthModal,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [name, setName] = useState(userProfile?.name || 'Vijay');
  const [monthlyIncome, setMonthlyIncome] = useState(
    userProfile?.monthlyIncome != null ? userProfile.monthlyIncome.toString() : '35000'
  );
  const [currency, setCurrency] = useState(userProfile?.currency || 'INR');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDarkMode = Boolean(userProfile?.darkMode || userProfile?.theme === 'dark');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const incomeNum = parseFloat(monthlyIncome) || 0;
    onUpdateProfile({
      name: name.trim(),
      monthlyIncome: incomeNum,
      currency,
      language,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLanguageChange = (code: Language) => {
    setLanguage(code);
    onUpdateProfile({ language: code });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const success = onImportJson(parsed);
        if (success) {
          setImportStatus({ type: 'success', text: 'Data imported successfully!' });
        } else {
          setImportStatus({ type: 'error', text: 'Invalid Spendly backup file format.' });
        }
      } catch {
        setImportStatus({ type: 'error', text: 'Failed to parse JSON file.' });
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white md:text-xl">
          {t('settings_title')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings_subtitle')}
        </p>
      </div>

      {/* Account & Cloud Sync Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Account & Cloud Synchronization
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your Google or Phone login and cloud backup
              </p>
            </div>
          </div>
          {user ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Cloud Connected</span>
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Local Mode
            </span>
          )}
        </div>

        <div className="mt-4">
          {user ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="h-11 w-11 rounded-xl object-cover ring-2 ring-emerald-500/30"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 font-bold text-slate-950">
                    {user.phoneNumber ? (
                      <Phone className="h-5 w-5" />
                    ) : (
                      (user.displayName || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {user.displayName || user.phoneNumber || 'Authenticated User'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {user.email || user.phoneNumber}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Provider: {user.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Phone Number (SMS)'}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-semibold text-rose-600 shadow-2xs hover:bg-rose-50 dark:border-rose-900/50 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/30"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-50/40 p-4 dark:border-emerald-500/30 dark:bg-emerald-950/20">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Backup your finances securely
                </h4>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Sign in with your Google account or Phone Number to access your transactions anywhere.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-emerald-400"
              >
                <LogIn className="h-4 w-4" />
                <span>{t('login_signup')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Language Selection Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('language_section')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('language_desc')}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`relative flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs dark:border-emerald-500 dark:bg-emerald-950/40'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {lang.nativeName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lang.name}
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-2xs">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Profile & Currency Form */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('profile_and_currency')}
          </h3>
        </div>

        <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('display_name')}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('monthly_target_income')} ({currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                required
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="settings-currency-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('currency')}
              </label>
              <select
                id="settings-currency-select"
                aria-label={t('currency')}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:bg-slate-800 dark:focus:border-emerald-400"
              >
                <option value="INR">₹ Indian Rupee (INR)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="GBP">£ British Pound (GBP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('appearance_theme')}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateProfile({ darkMode: false, theme: 'light' })}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                    !isDarkMode
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  <span>{t('day_mode')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateProfile({ darkMode: true, theme: 'dark' })}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition ${
                    isDarkMode
                      ? 'border-emerald-500 bg-emerald-950 text-emerald-300 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{t('night_mode')}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            {savedSuccess ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="h-4 w-4" /> {t('saved_successfully')}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Changes apply instantly across analytics & dashboard
              </span>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              {t('save')}
            </motion.button>
          </div>
        </form>
      </div>

      {/* Data Management Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('data_management')}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Spendly stores your financial ledger directly in your browser's encrypted local storage.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Export JSON */}
          <div className="rounded-xl border border-slate-200/70 p-3.5 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t('export_data')}
            </h4>
            <p className="mt-1 text-[11px] text-slate-500">
              Download your complete ledger, budgets, goals, and history as a JSON file.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onExportJson}
              className="mt-3 flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t('export_data')}</span>
            </motion.button>
          </div>

          {/* Import JSON */}
          <div className="rounded-xl border border-slate-200/70 p-3.5 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t('import_data')}
            </h4>
            <p className="mt-1 text-[11px] text-slate-500">
              Restore previously exported Spendly data into this browser.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{t('import_data')}</span>
            </motion.button>
          </div>

          {/* Reset Demo Data */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 dark:border-amber-900/30 dark:bg-amber-950/10">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
              {t('reset_demo')}
            </h4>
            <p className="mt-1 text-[11px] text-amber-800/80 dark:text-amber-400">
              Reload sample student / young professional financial data (income, UPI transactions, subscriptions).
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{t('reset_demo')}</span>
            </motion.button>
          </div>

          {/* Clear All Data */}
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/40 p-3.5 dark:border-rose-900/30 dark:bg-rose-950/10">
            <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300">
              {t('clear_data')}
            </h4>
            <p className="mt-1 text-[11px] text-rose-800/80 dark:text-rose-400">
              Permanently erase all logged transactions, budgets, goals, and reset scores.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setShowClearModal(true)}
              className="mt-3 flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t('clear_data')}</span>
            </motion.button>
          </div>
        </div>

        {importStatus && (
          <div
            className={`mt-4 rounded-xl p-3 text-xs font-semibold ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
            }`}
          >
            {importStatus.text}
          </div>
        )}
      </div>

      {/* Demo Reset Confirmation Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <RefreshCw className="h-5 w-5" />
              <h4 className="text-sm font-bold">Load Demo Financial Ledger</h4>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Current records will be replaced with realistic sample demo data including salary, UPI spends, budgets, goals, and subscriptions.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDemoData();
                  setShowDemoModal(false);
                }}
                className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
              >
                {t('reset_demo')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="text-sm font-bold">Confirm Ledger Erase</h4>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              This will wipe all records in local storage. Make sure to download a JSON backup if you wish to keep your records.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAllData();
                  setShowClearModal(false);
                }}
                className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                Yes, Erase Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
