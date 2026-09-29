import React, { useState } from 'react';
import {
  ArrowLeftRight,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  Coins,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  Phone,
  PiggyBank,
  Repeat,
  Settings,
  ShieldCheck,
  Sun,
  Target,
  TrendingUp,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ActiveTab, CurrencyCode, UserProfile } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  convertCurrency,
  formatCurrencyInCode,
  getCurrencyMeta,
  SUPPORTED_CURRENCIES,
} from '../utils/currency';
import { TranslationKey } from '../utils/translations';
import { BrandLogo } from './BrandLogo';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  mobileOpen?: boolean;
  isOpen?: boolean;
  onCloseMobile?: () => void;
  onClose?: () => void;
  userProfile?: UserProfile;
  totalBalance?: number;
  currencySymbol?: string;
  onToggleDarkMode?: () => void;
  onOpenAuthModal?: () => void;
  displayCurrency?: CurrencyCode;
  onSelectDisplayCurrency?: (currency: CurrencyCode) => void;
  onOpenAltCurrenciesModal?: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  translationKey: TranslationKey;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', translationKey: 'nav_dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', translationKey: 'nav_transactions', icon: CreditCard },
  { id: 'income', label: 'Income', translationKey: 'nav_income', icon: TrendingUp },
  { id: 'analytics', label: 'Analytics', translationKey: 'nav_analytics', icon: BarChart3 },
  { id: 'goals', label: 'Savings Goals', translationKey: 'nav_goals', icon: Target },
  { id: 'budgets', label: 'Budget', translationKey: 'nav_budgets', icon: PiggyBank },
  { id: 'subscriptions', label: 'Subscriptions', translationKey: 'nav_subscriptions', icon: Repeat },
  { id: 'ai-chat', label: 'SpendSense AI', translationKey: 'nav_ai_chat', icon: Bot, badge: 'AI', badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300' },
  { id: 'reports', label: 'Monthly Report', translationKey: 'nav_monthly_report', icon: FileText },
  { id: 'settings', label: 'Settings', translationKey: 'nav_settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  mobileOpen,
  isOpen,
  onCloseMobile,
  onClose,
  userProfile,
  totalBalance = 0,
  currencySymbol,
  onToggleDarkMode,
  onOpenAuthModal,
  displayCurrency,
  onSelectDisplayCurrency,
  onOpenAltCurrenciesModal,
}) => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const isDrawerOpen = mobileOpen ?? isOpen ?? false;
  const isDarkMode = Boolean(
    userProfile?.darkMode || userProfile?.theme === 'dark'
  );
  const handleClose = () => {
    if (onCloseMobile) onCloseMobile();
    if (onClose) onClose();
  };

  const baseCurrency: CurrencyCode = (userProfile?.currency as CurrencyCode) || 'INR';
  const isAltActive = Boolean(displayCurrency && displayCurrency.toUpperCase() !== baseCurrency.toUpperCase());
  const convertedTotal = isAltActive
    ? convertCurrency(totalBalance, baseCurrency, displayCurrency!)
    : totalBalance;

  const symbol =
    currencySymbol ||
    userProfile?.currencySymbol ||
    (userProfile?.currency === 'USD'
      ? '$'
      : userProfile?.currency === 'EUR'
      ? '€'
      : userProfile?.currency === 'GBP'
      ? '£'
      : '₹');

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    handleClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isDrawerOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white shadow-lg transition-transform duration-200 dark:border-slate-800/80 dark:bg-slate-900 lg:static lg:translate-x-0 lg:shadow-none ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-5 dark:border-slate-800/80">
          <BrandLogo size="md" />

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close navigation sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('nav_menu')}
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === 'budgets' && activeTab === 'budget') ||
              (item.id === 'reports' && activeTab === 'monthly-report');

            return (
              <motion.button
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 shadow-xs dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span>{t(item.translationKey)}</span>
                </div>

                {item.badge && (
                  <span
                    className={`inline-flex items-center justify-center whitespace-nowrap shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Currency Switcher in Sidebar Menu */}
        <div className="px-3 pb-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCurrencySelector((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Change Display Currency"
            >
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('quick_currency_switcher')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-2xs dark:bg-slate-700 dark:text-slate-200">
                  {getCurrencyMeta(displayCurrency || baseCurrency).flag} {displayCurrency || baseCurrency}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    showCurrencySelector ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            <AnimatePresence>
              {showCurrencySelector && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Select Currency (Live FX)
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {SUPPORTED_CURRENCIES.map((cur) => {
                      const isSelected =
                        (displayCurrency || baseCurrency).toUpperCase() === cur.code;
                      return (
                        <button
                          key={cur.code}
                          type="button"
                          onClick={() => {
                            if (onSelectDisplayCurrency) {
                              onSelectDisplayCurrency(cur.code);
                            }
                            setShowCurrencySelector(false);
                          }}
                          className={`flex flex-col items-center justify-center rounded-lg p-1.5 text-[11px] font-bold transition ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 shadow-2xs'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span className="text-sm">{cur.flag}</span>
                          <span>{cur.code}</span>
                        </button>
                      );
                    })}
                  </div>

                  {onOpenAltCurrenciesModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowCurrencySelector(false);
                        onOpenAltCurrenciesModal();
                      }}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-emerald-500/50 bg-emerald-50/50 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                      <ArrowLeftRight className="h-3 w-3" />
                      <span>{t('view_alt_currencies')} (FX)...</span>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Day / Night Mode Switch */}
        {onToggleDarkMode && (
          <div className="px-3 pb-2">
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle Day and Night mode"
            >
              <div className="flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Sun className="h-4 w-4 text-amber-500" />
                )}
                <span>{isDarkMode ? t('night_mode') : t('day_mode')}</span>
              </div>
              <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-2xs dark:bg-slate-700 dark:text-slate-300">
                {isDarkMode ? 'Dark' : 'Light'}
              </span>
            </button>
          </div>
        )}

        {/* Bottom Account Card */}
        <div className="border-t border-slate-200/80 p-4 dark:border-slate-800/80 space-y-2.5">
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-800/50">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <span>{t('total_net_balance')}</span>
                {isAltActive && (
                  <span className="rounded bg-emerald-100 px-1 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {displayCurrency}
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1.5">
                {onOpenAltCurrenciesModal && (
                  <button
                    type="button"
                    onClick={onOpenAltCurrenciesModal}
                    className="flex items-center gap-1 rounded bg-slate-200/60 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300"
                    title="Alternative Currencies"
                  >
                    <ArrowLeftRight className="h-2.5 w-2.5 text-emerald-500" />
                    <span>FX</span>
                  </button>
                )}
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
            <div className="mt-1 text-base font-bold tracking-tight text-slate-900 dark:text-white">
              {isAltActive
                ? formatCurrencyInCode(convertedTotal, displayCurrency!)
                : formatCurrency(totalBalance, symbol)}
            </div>
            {isAltActive && (
              <div className="text-[10px] text-slate-400">
                Base: {formatCurrency(totalBalance, symbol)}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] text-slate-500 dark:border-slate-700/60 dark:text-slate-400">
              <span className="truncate">{user?.displayName || user?.phoneNumber || userProfile?.name || 'Personal Account'}</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {isAltActive ? `${displayCurrency} (live FX)` : baseCurrency}
              </span>
            </div>
          </div>

          {/* Auth State Button */}
          {user ? (
            <div className="flex items-center justify-between rounded-xl border border-emerald-200/60 bg-emerald-50/50 px-3 py-2 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  {user.email || user.phoneNumber || 'Cloud Connected'}
                </span>
              </div>
              <button
                type="button"
                aria-label="Log Out"
                onClick={() => logout()}
                className="shrink-0 text-[11px] font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
                title="Log Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              id="sidebar-signin-btn"
              onClick={onOpenAuthModal}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-slate-950 shadow-xs transition hover:bg-emerald-400"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{t('login_signup')}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
