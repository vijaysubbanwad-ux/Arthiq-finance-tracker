import React, { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Cloud,
  Globe,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Phone,
  ShieldCheck,
  Sparkles,
  Sun,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ActiveTab, AlertItem, CurrencyCode, UserProfile } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/translations';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  userProfile?: UserProfile;
  alerts?: AlertItem[];
  onMarkAlertRead?: (id: string) => void;
  onDismissAlert?: (id: string) => void;
  onMarkAllAlertsRead?: () => void;
  onClearAllAlerts?: () => void;
  onToggleTheme?: () => void;
  onToggleDarkMode?: () => void;
  onOpenMobileMenu?: () => void;
  onToggleSidebar?: () => void;
  onOpenQuickAdd?: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  onOpenAuthModal?: () => void;
  healthScore?: number | { score: number };
  activeTab?: ActiveTab;
  displayCurrency?: CurrencyCode;
  onSelectDisplayCurrency?: (currency: CurrencyCode) => void;
  onOpenAltCurrenciesModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  alerts = [],
  onMarkAlertRead,
  onDismissAlert,
  onMarkAllAlertsRead,
  onClearAllAlerts,
  onToggleTheme,
  onToggleDarkMode,
  onOpenMobileMenu,
  onToggleSidebar,
  onOpenQuickAdd,
  onNavigateTab,
  onOpenAuthModal,
  healthScore = 80,
  displayCurrency,
  onSelectDisplayCurrency,
  onOpenAltCurrenciesModal,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const unreadAlerts = alerts.filter((a) => !a.read);

  const handleMobileToggle = () => {
    if (onToggleSidebar) onToggleSidebar();
    else if (onOpenMobileMenu) onOpenMobileMenu();
  };

  const handleToggleThemeMode = () => {
    if (onToggleDarkMode) onToggleDarkMode();
    else if (onToggleTheme) onToggleTheme();
  };

  const handleNavigate = (tab: ActiveTab) => {
    if (onNavigateTab) onNavigateTab(tab);
  };

  const handleMarkRead = (id: string) => {
    if (onDismissAlert) onDismissAlert(id);
    else if (onMarkAlertRead) onMarkAlertRead(id);
  };

  const handleMarkAllRead = () => {
    if (onClearAllAlerts) onClearAllAlerts();
    else if (onMarkAllAlertsRead) onMarkAllAlertsRead();
  };

  const numericHealthScore =
    typeof healthScore === 'number'
      ? healthScore
      : (healthScore as any)?.score ?? 80;

  const isDarkMode = Boolean(
    userProfile?.darkMode || userProfile?.theme === 'dark'
  );

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const rawName = user?.displayName || user?.phoneNumber || userProfile?.name || 'Friend';
  const displayName = rawName.includes('@') ? rawName.split('@')[0] : rawName;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/85 px-3 sm:px-4 md:px-6 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-900/85">
      {/* Left: Mobile Menu Toggle & Personalized Welcome */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={handleMobileToggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu className="h-5 w-5" />
        </motion.button>

        <div className="flex items-center lg:hidden shrink-0">
          <BrandLogo size="sm" showText={false} />
        </div>

        <div className="min-w-0">
          <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white sm:text-base md:text-lg flex items-center gap-1">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[85px] xs:max-w-[125px] sm:max-w-[180px] md:max-w-none">
              {displayName}
            </span>{' '}
            <span className="inline-block animate-pulse shrink-0">👋</span>
          </h1>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block truncate">
            {t('header_subtitle')}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0">
        {/* Financial Health Score Pill */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={() => handleNavigate('dashboard')}
          className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 sm:flex"
          title="Financial Health Score"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('health_score_badge')}: {numericHealthScore}/100</span>
        </motion.button>

        {/* Language Switcher Dropdown */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => {
              setShowLangDropdown(!showLangDropdown);
              setShowAlertsDropdown(false);
            }}
            className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 px-2 sm:px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700"
            title={t('select_language')}
            aria-label={t('select_language')}
          >
            <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden xs:inline text-[11px] tracking-wide font-bold">{currentLangObj.nativeName}</span>
            <span className="xs:hidden text-[10px] tracking-wider font-bold">{currentLangObj.code.toUpperCase()}</span>
          </motion.button>

          <AnimatePresence>
            {showLangDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900 z-50"
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t('select_language')}
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangDropdown(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                      language === lang.code
                        ? 'bg-emerald-50 text-emerald-700 font-bold dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </div>
                    {language === lang.code && (
                      <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle Button (Day / Night) */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          type="button"
          onClick={handleToggleThemeMode}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          title={isDarkMode ? t('switch_to_light') : t('switch_to_dark')}
          aria-label={isDarkMode ? t('switch_to_light') : t('switch_to_dark')}
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </motion.button>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={() => {
              setShowAlertsDropdown(!showAlertsDropdown);
              setShowLangDropdown(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadAlerts.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                {unreadAlerts.length}
              </span>
            )}
          </motion.button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showAlertsDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 max-w-[calc(100vw-1.5rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900 z-50"
              >
                <div className="mb-2.5 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('smart_alerts')}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {unreadAlerts.length} new
                    </span>
                  </div>
                  {unreadAlerts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                      <CheckCheck className="h-3 w-3" />
                      {t('mark_all_read')}
                    </button>
                  )}
                </div>

                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-400">
                      {t('no_active_alerts')}
                    </p>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        onClick={() => {
                          handleMarkRead(alert.id);
                          if (alert.actionTab) {
                            handleNavigate(alert.actionTab as ActiveTab);
                            setShowAlertsDropdown(false);
                          }
                        }}
                        className={`cursor-pointer rounded-lg border p-2.5 transition ${
                          alert.read
                            ? 'border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400'
                            : 'border-emerald-100 bg-emerald-50/60 text-slate-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-slate-100 font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-semibold">
                            {alert.type === 'warning' && '⚠️ '}
                            {alert.type === 'danger' && '🚨 '}
                            {alert.type === 'info' && '🔔 '}
                            {alert.type === 'success' && '🎯 '}
                            {alert.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {alert.date}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {alert.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Account / Auth Section */}
        {user ? (
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.94 }}
              type="button"
              id="header-user-menu-btn"
              onClick={() => {
                setShowUserDropdown(!showUserDropdown);
                setShowAlertsDropdown(false);
                setShowLangDropdown(false);
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-1 pr-2.5 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800"
              aria-label="User profile and account"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="h-7 w-7 rounded-lg object-cover ring-1 ring-emerald-500/30"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-xs font-bold text-slate-950">
                  {user.phoneNumber ? (
                    <Phone className="h-3.5 w-3.5" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
              )}
              <div className="hidden text-left md:block">
                <div className="max-w-[100px] truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                  {displayName}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Cloud</span>
                </div>
              </div>
            </motion.button>

            {/* User Dropdown */}
            <AnimatePresence>
              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900 z-50"
                >
                  <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={displayName}
                          referrerPolicy="no-referrer"
                          className="h-9 w-9 rounded-xl object-cover ring-2 ring-emerald-500/30"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-sm font-bold text-slate-950">
                          {user.phoneNumber ? (
                            <Phone className="h-4 w-4" />
                          ) : (
                            displayName.charAt(0).toUpperCase()
                          )}
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <div className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {displayName}
                        </div>
                        <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {user.email || user.phoneNumber || 'Authenticated User'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      <span>{t('cloud_synced')}</span>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleNavigate('settings');
                        setShowUserDropdown(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      type="button"
                      id="header-logout-btn"
                      onClick={async () => {
                        setShowUserDropdown(false);
                        await logout();
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Sign In Button */
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.94 }}
            type="button"
            id="header-signin-btn"
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-500/20 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">{t('login_signup')}</span>
          </motion.button>
        )}
      </div>
    </header>
  );
};
