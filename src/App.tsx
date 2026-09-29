import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { DashboardView } from './components/DashboardView';
import { FloatingQuickAdd } from './components/FloatingQuickAdd';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Sidebar } from './components/Sidebar';
import {
  ActiveTab,
  AlertItem,
  Budget,
  CurrencyCode,
  Goal,
  Subscription,
  Transaction,
  UserProfile,
} from './types';
import {
  calculateFinancialHealth,
  generateSmartInsights,
} from './utils/healthCalculator';
import { StorageService } from './utils/storage';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { getSavedDisplayCurrency, saveDisplayCurrency } from './utils/currency';

// Lazy-loaded tab views to keep initial bundle ultra-fast & lightweight
const TransactionTimeline = lazy(() =>
  import('./components/TransactionTimeline').then((m) => ({ default: m.TransactionTimeline }))
);
const AnalyticsCharts = lazy(() =>
  import('./components/AnalyticsCharts').then((m) => ({ default: m.AnalyticsCharts }))
);
const BudgetSystem = lazy(() =>
  import('./components/BudgetSystem').then((m) => ({ default: m.BudgetSystem }))
);
const SavingsGoals = lazy(() =>
  import('./components/SavingsGoals').then((m) => ({ default: m.SavingsGoals }))
);
const SubscriptionTracker = lazy(() =>
  import('./components/SubscriptionTracker').then((m) => ({ default: m.SubscriptionTracker }))
);
const AiAssistantChat = lazy(() =>
  import('./components/AiAssistantChat').then((m) => ({ default: m.AiAssistantChat }))
);
const MonthlyReportView = lazy(() =>
  import('./components/MonthlyReportView').then((m) => ({ default: m.MonthlyReportView }))
);
const SettingsView = lazy(() =>
  import('./components/SettingsView').then((m) => ({ default: m.SettingsView }))
);

// Lazy-loaded modals (only loaded on demand when user clicks to open)
const QuickAddModal = lazy(() =>
  import('./components/QuickAddModal').then((m) => ({ default: m.QuickAddModal }))
);
const AuthModal = lazy(() =>
  import('./components/AuthModal').then((m) => ({ default: m.AuthModal }))
);
const FinancialHealthModal = lazy(() =>
  import('./components/FinancialHealthModal').then((m) => ({ default: m.FinancialHealthModal }))
);
const AlternativeCurrenciesModal = lazy(() =>
  import('./components/AlternativeCurrenciesModal').then((m) => ({ default: m.AlternativeCurrenciesModal }))
);

// Stable fallback skeleton that preserves exact view height & prevents layout shift
const ViewSkeleton = () => (
  <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading view">
    <div className="h-24 rounded-3xl bg-slate-200/70 dark:bg-slate-800/70" />
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
      ))}
    </div>
    <div className="h-64 rounded-2xl bg-slate-200/70 dark:bg-slate-800/70" />
  </div>
);

export default function App() {
  const { language, setLanguage } = useLanguage();
  const { user } = useAuth();

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // App Core Data State from StorageService
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    StorageService.getTransactions()
  );
  const [budgets, setBudgets] = useState<Budget[]>(() =>
    StorageService.getBudgets()
  );
  const [goals, setGoals] = useState<Goal[]>(() =>
    StorageService.getGoals()
  );
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() =>
    StorageService.getSubscriptions()
  );
  const [alerts, setAlerts] = useState<AlertItem[]>(() =>
    StorageService.getAlerts()
  );
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    StorageService.getUserProfile()
  );

  // Alternative Currency Display State
  const [displayCurrency, setDisplayCurrency] = useState<CurrencyCode>(() => {
    return getSavedDisplayCurrency() || (userProfile?.currency as CurrencyCode) || 'INR';
  });
  const [isAltCurrencyModalOpen, setIsAltCurrencyModalOpen] = useState(false);

  const handleSelectDisplayCurrency = (code: CurrencyCode) => {
    setDisplayCurrency(code);
    saveDisplayCurrency(code);
  };

  // Modals state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'expense' | 'income' | 'goal' | 'budget'>('expense');
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [filterHeatmapDate, setFilterHeatmapDate] = useState<string | null>(null);

  // Helper to dynamically invoke cloud sync without loading Firestore in critical bundle
  const syncToCloud = (action: (service: any) => Promise<any>) => {
    if (user?.uid) {
      import('./services/cloudSync').then(({ CloudSyncService }) => {
        action(CloudSyncService).catch(console.error);
      });
    }
  };

  // Cloud Sync Listener & Initialization on Auth State Change
  useEffect(() => {
    if (!user) return;
    let unsubTxs: (() => void) | undefined;
    let isCancelled = false;

    import('./services/cloudSync').then(({ CloudSyncService }) => {
      if (isCancelled) return;

      // 1. Sync User Profile with Cloud
      CloudSyncService.syncUserProfile(
        user.uid,
        userProfile,
        user.email,
        user.phoneNumber,
        user.displayName,
        user.photoURL
      ).catch(console.error);

      // 2. Initialize cloud with local data if cloud documents don't exist yet
      CloudSyncService.initializeUserDataIfEmpty(
        user.uid,
        StorageService.getTransactions(),
        StorageService.getBudgets(),
        StorageService.getGoals(),
        StorageService.getSubscriptions()
      ).catch(console.error);

      // 3. Realtime listener for transactions
      unsubTxs = CloudSyncService.subscribeTransactions(user.uid, (cloudTxs) => {
        if (cloudTxs && cloudTxs.length > 0) {
          setTransactions(cloudTxs);
          localStorage.setItem('spendsense_transactions', JSON.stringify(cloudTxs));
        }
      });
    });

    return () => {
      isCancelled = true;
      if (unsubTxs) unsubTxs();
    };
  }, [user?.uid]);

  // Sync Dark Mode class with <html> element
  useEffect(() => {
    const isDark = Boolean(userProfile?.darkMode || userProfile?.theme === 'dark');
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [userProfile?.darkMode, userProfile?.theme]);

  // Derived Currency Symbol
  const currencySymbol = useMemo(() => {
    switch (userProfile?.currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return '₹';
    }
  }, [userProfile?.currency]);

  // Derived Total Balance
  const totalBalance = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return income - expense;
  }, [transactions]);

  // Derived Algorithmic Financial Health Score
  const healthScore = useMemo(() => {
    return calculateFinancialHealth(
      transactions,
      budgets,
      goals,
      currencySymbol
    );
  }, [transactions, budgets, goals, currencySymbol]);

  // Derived Smart Insights
  const smartInsights = useMemo(() => {
    return generateSmartInsights(
      transactions,
      budgets,
      currencySymbol
    );
  }, [transactions, budgets, currencySymbol]);

  // Handler: Add Transaction
  const handleAddTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    StorageService.saveTransaction(newTx);
    setTransactions(StorageService.getTransactions());
    // Refresh alerts in case budget was impacted
    setAlerts(StorageService.getAlerts());

    // Sync to Cloud if authenticated
    if (user?.uid) {
      syncToCloud((svc) => svc.saveTransaction(user.uid, newTx));
    }
  };

  // Handler: Edit Transaction
  const handleEditTransaction = (tx: Transaction) => {
    StorageService.updateTransaction(tx);
    setTransactions(StorageService.getTransactions());
    setAlerts(StorageService.getAlerts());

    if (user?.uid) {
      syncToCloud((svc) => svc.saveTransaction(user.uid, tx));
    }
  };

  // Handler: Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    StorageService.deleteTransaction(id);
    setTransactions(StorageService.getTransactions());
    setAlerts(StorageService.getAlerts());

    if (user?.uid) {
      syncToCloud((svc) => svc.deleteTransaction(user.uid, id));
    }
  };

  // Handler: Add Budget
  const handleAddBudget = (budgetData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: `budget-${Date.now()}`,
    };
    StorageService.saveBudget(newBudget);
    setBudgets(StorageService.getBudgets());
    setAlerts(StorageService.getAlerts());

    if (user?.uid) {
      syncToCloud((svc) => svc.saveBudget(user.uid, newBudget));
    }
  };

  // Handler: Update Budget Amount
  const handleUpdateBudget = (id: string, amount: number) => {
    StorageService.updateBudget(id, amount);
    setBudgets(StorageService.getBudgets());
    setAlerts(StorageService.getAlerts());

    const updated = StorageService.getBudgets().find((b) => b.id === id);
    if (user?.uid && updated) {
      syncToCloud((svc) => svc.saveBudget(user.uid, updated));
    }
  };

  // Handler: Delete Budget
  const handleDeleteBudget = (id: string) => {
    StorageService.deleteBudget(id);
    setBudgets(StorageService.getBudgets());
    setAlerts(StorageService.getAlerts());

    if (user?.uid) {
      syncToCloud((svc) => svc.deleteBudget(user.uid, id));
    }
  };

  // Handler: Add Goal
  const handleAddGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    StorageService.saveGoal(newGoal);
    setGoals(StorageService.getGoals());

    if (user?.uid) {
      syncToCloud((svc) => svc.saveGoal(user.uid, newGoal));
    }
  };

  // Handler: Update Goal Savings
  const handleUpdateGoalSavings = (id: string, delta: number) => {
    StorageService.updateGoalProgress(id, delta);
    setGoals(StorageService.getGoals());

    const updated = StorageService.getGoals().find((g) => g.id === id);
    if (user?.uid && updated) {
      syncToCloud((svc) => svc.saveGoal(user.uid, updated));
    }
  };

  // Handler: Delete Goal
  const handleDeleteGoal = (id: string) => {
    StorageService.deleteGoal(id);
    setGoals(StorageService.getGoals());

    if (user?.uid) {
      syncToCloud((svc) => svc.deleteGoal(user.uid, id));
    }
  };

  // Handler: Add Subscription
  const handleAddSubscription = (subData: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...subData,
      id: `sub-${Date.now()}`,
    };
    StorageService.saveSubscription(newSub);
    setSubscriptions(StorageService.getSubscriptions());

    if (user?.uid) {
      syncToCloud((svc) => svc.saveSubscription(user.uid, newSub));
    }
  };

  // Handler: Delete Subscription
  const handleDeleteSubscription = (id: string) => {
    StorageService.deleteSubscription(id);
    setSubscriptions(StorageService.getSubscriptions());

    if (user?.uid) {
      syncToCloud((svc) => svc.deleteSubscription(user.uid, id));
    }
  };

  // Handler: Toggle Subscription
  const handleToggleSubscription = (id: string) => {
    StorageService.toggleSubscription(id);
    setSubscriptions(StorageService.getSubscriptions());

    const updated = StorageService.getSubscriptions().find((s) => s.id === id);
    if (user?.uid && updated) {
      syncToCloud((svc) => svc.saveSubscription(user.uid, updated));
    }
  };

  // Handler: User Profile Update
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    StorageService.updateUserProfile(updated);
    if (updated.language && updated.language !== language) {
      setLanguage(updated.language);
    }
    setUserProfile(StorageService.getUserProfile());
  };

  // Handler: Toggle Dark Mode (Day / Night)
  const handleToggleDarkMode = () => {
    const currentDark = Boolean(userProfile?.darkMode || userProfile?.theme === 'dark');
    const nextDark = !currentDark;
    handleUpdateProfile({
      darkMode: nextDark,
      theme: nextDark ? 'dark' : 'light',
    });
  };

  // Handler: Dismiss Alert
  const handleDismissAlert = (id: string) => {
    StorageService.dismissAlert(id);
    setAlerts(StorageService.getAlerts());
  };

  // Handler: Clear All Alerts
  const handleClearAllAlerts = () => {
    StorageService.clearAllAlerts();
    setAlerts([]);
  };

  // Handler: Reset Demo Data
  const handleResetDemoData = () => {
    StorageService.resetToDemoData();
    setTransactions(StorageService.getTransactions());
    setBudgets(StorageService.getBudgets());
    setGoals(StorageService.getGoals());
    setSubscriptions(StorageService.getSubscriptions());
    setAlerts(StorageService.getAlerts());
    const resetProfile = StorageService.getUserProfile();
    setUserProfile(resetProfile);
    if (resetProfile.language && resetProfile.language !== language) {
      setLanguage(resetProfile.language);
    }
    setFilterHeatmapDate(null);
  };

  // Handler: Clear All Data
  const handleClearAllData = () => {
    StorageService.clearAllData();
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setSubscriptions([]);
    setAlerts([]);
    setUserProfile(StorageService.getUserProfile());
    setFilterHeatmapDate(null);
  };

  // Handler: Export JSON
  const handleExportJson = () => {
    const data = StorageService.exportFullData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Spendly_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handler: Import JSON
  const handleImportJson = (jsonData: any) => {
    const success = StorageService.importFullData(jsonData);
    if (success) {
      setTransactions(StorageService.getTransactions());
      setBudgets(StorageService.getBudgets());
      setGoals(StorageService.getGoals());
      setSubscriptions(StorageService.getSubscriptions());
      setAlerts(StorageService.getAlerts());
      setUserProfile(StorageService.getUserProfile());
    }
    return success;
  };

  // Date selection from Spending Heatmap
  const handleSelectHeatmapDate = (dateStr: string) => {
    setFilterHeatmapDate(dateStr);
    setActiveTab('transactions');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        isOpen={sidebarOpen}
        mobileOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCloseMobile={() => setSidebarOpen(false)}
        userProfile={userProfile}
        totalBalance={totalBalance}
        currencySymbol={currencySymbol}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        displayCurrency={displayCurrency}
        onSelectDisplayCurrency={handleSelectDisplayCurrency}
        onOpenAltCurrenciesModal={() => setIsAltCurrencyModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          userProfile={userProfile}
          alerts={alerts}
          onDismissAlert={handleDismissAlert}
          onMarkAlertRead={handleDismissAlert}
          onClearAllAlerts={handleClearAllAlerts}
          onMarkAllAlertsRead={handleClearAllAlerts}
          onToggleDarkMode={handleToggleDarkMode}
          onToggleTheme={handleToggleDarkMode}
          onOpenQuickAdd={() => {
            setQuickAddTab('expense');
            setIsQuickAddOpen(true);
          }}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenMobileMenu={() => setSidebarOpen((prev) => !prev)}
          onNavigateTab={setActiveTab}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          healthScore={healthScore.score}
          displayCurrency={displayCurrency}
          onSelectDisplayCurrency={handleSelectDisplayCurrency}
          onOpenAltCurrenciesModal={() => setIsAltCurrencyModalOpen(true)}
        />

        {/* Content Body with bottom safe area for mobile nav */}
        <main className="flex-1 p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              budgets={budgets}
              goals={goals}
              subscriptions={subscriptions}
              health={healthScore}
              insights={smartInsights}
              userProfile={userProfile}
              onNavigateTab={setActiveTab}
              onQuickAdd={(tab) => {
                setQuickAddTab(tab || 'expense');
                setIsQuickAddOpen(true);
              }}
              onOpenHealthModal={() => setIsHealthModalOpen(true)}
              onSelectHeatmapDate={handleSelectHeatmapDate}
              currencySymbol={currencySymbol}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              displayCurrency={displayCurrency}
              onSelectDisplayCurrency={handleSelectDisplayCurrency}
              onOpenAltCurrenciesModal={() => setIsAltCurrencyModalOpen(true)}
            />
          )}

          {activeTab !== 'dashboard' && (
            <Suspense fallback={<ViewSkeleton />}>
              {activeTab === 'transactions' && (
                <TransactionTimeline
                  transactions={transactions}
                  onAddClick={() => {
                    setQuickAddTab('expense');
                    setIsQuickAddOpen(true);
                  }}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  currencySymbol={currencySymbol}
                  initialFilterDate={filterHeatmapDate}
                  onClearDateFilter={() => setFilterHeatmapDate(null)}
                />
              )}

              {activeTab === 'income' && (
                <TransactionTimeline
                  transactions={transactions.filter((t) => t.type === 'income')}
                  onAddClick={() => {
                    setQuickAddTab('income');
                    setIsQuickAddOpen(true);
                  }}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  currencySymbol={currencySymbol}
                  initialFilterDate={filterHeatmapDate}
                  onClearDateFilter={() => setFilterHeatmapDate(null)}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsCharts
                  transactions={transactions}
                  currencySymbol={currencySymbol}
                />
              )}

              {(activeTab === 'budgets' || activeTab === 'budget') && (
                <BudgetSystem
                  budgets={budgets}
                  transactions={transactions}
                  onAddBudget={handleAddBudget}
                  onUpdateBudget={handleUpdateBudget}
                  onDeleteBudget={handleDeleteBudget}
                  currencySymbol={currencySymbol}
                />
              )}

              {activeTab === 'goals' && (
                <SavingsGoals
                  goals={goals}
                  onAddGoal={handleAddGoal}
                  onUpdateGoalSavings={handleUpdateGoalSavings}
                  onDeleteGoal={handleDeleteGoal}
                  currencySymbol={currencySymbol}
                />
              )}

              {activeTab === 'subscriptions' && (
                <SubscriptionTracker
                  subscriptions={subscriptions}
                  onAddSubscription={handleAddSubscription}
                  onDeleteSubscription={handleDeleteSubscription}
                  onToggleSubscription={handleToggleSubscription}
                  currencySymbol={currencySymbol}
                />
              )}

              {activeTab === 'ai-chat' && (
                <AiAssistantChat
                  transactions={transactions}
                  budgets={budgets}
                  goals={goals}
                  subscriptions={subscriptions}
                  currencySymbol={currencySymbol}
                />
              )}

              {(activeTab === 'reports' || activeTab === 'monthly-report') && (
                <MonthlyReportView
                  transactions={transactions}
                  budgets={budgets}
                  health={healthScore}
                  currencySymbol={currencySymbol}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  userProfile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
                  onResetDemoData={handleResetDemoData}
                  onClearAllData={handleClearAllData}
                  onExportJson={handleExportJson}
                  onImportJson={handleImportJson}
                  currencySymbol={currencySymbol}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              )}
            </Suspense>
          )}
        </main>
      </div>

      {/* Floating Speed Dial Action Button on Desktop */}
      <div className="hidden lg:block">
        <FloatingQuickAdd
          onOpenModal={(tab) => {
            setQuickAddTab(tab);
            setIsQuickAddOpen(true);
          }}
        />
      </div>

      {/* Mobile Bottom Navigation Bar with integrated Center Plus Speed Dial */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenModal={(tab) => {
          setQuickAddTab(tab);
          setIsQuickAddOpen(true);
        }}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      {/* Global Quick Add Transaction / Budget / Goal / Sub Modal (Lazy on demand) */}
      {isQuickAddOpen && (
        <Suspense fallback={null}>
          <QuickAddModal
            isOpen={isQuickAddOpen}
            onClose={() => setIsQuickAddOpen(false)}
            onAddTransaction={handleAddTransaction}
            onAddBudget={handleAddBudget}
            onAddGoal={handleAddGoal}
            onAddSubscription={handleAddSubscription}
            initialTab={quickAddTab}
            currencySymbol={currencySymbol}
          />
        </Suspense>
      )}

      {/* Authentication Modal (Google & Phone Number OTP) (Lazy on demand) */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </Suspense>
      )}

      {/* Algorithmic Financial Health Explanation Modal (Lazy on demand) */}
      {isHealthModalOpen && (
        <Suspense fallback={null}>
          <FinancialHealthModal
            isOpen={isHealthModalOpen}
            onClose={() => setIsHealthModalOpen(false)}
            health={healthScore}
          />
        </Suspense>
      )}

      {/* Global Quick Alternative Currencies Modal (Lazy on demand) */}
      {isAltCurrencyModalOpen && (
        <Suspense fallback={null}>
          <AlternativeCurrenciesModal
            isOpen={isAltCurrencyModalOpen}
            onClose={() => setIsAltCurrencyModalOpen(false)}
            baseCurrency={(userProfile?.currency as CurrencyCode) || 'INR'}
            totalBalance={totalBalance}
            totalIncome={transactions
              .filter((t) => {
                const d = new Date(t.date);
                const n = new Date();
                return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() && t.type === 'income';
              })
              .reduce((sum, t) => sum + t.amount, 0)}
            totalExpense={transactions
              .filter((t) => {
                const d = new Date(t.date);
                const n = new Date();
                return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() && t.type === 'expense';
              })
              .reduce((sum, t) => sum + t.amount, 0)}
            currentMonthSavings={
              transactions
                .filter((t) => {
                  const d = new Date(t.date);
                  const n = new Date();
                  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() && t.type === 'income';
                })
                .reduce((sum, t) => sum + t.amount, 0) -
              transactions
                .filter((t) => {
                  const d = new Date(t.date);
                  const n = new Date();
                  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() && t.type === 'expense';
                })
                .reduce((sum, t) => sum + t.amount, 0)
            }
            activeDisplayCurrency={displayCurrency}
            onSelectDisplayCurrency={handleSelectDisplayCurrency}
          />
        </Suspense>
      )}
    </div>
  );
}
