import {
  Achievement,
  AlertItem,
  Budget,
  Goal,
  Subscription,
  Transaction,
  UserProfile,
} from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'spendly_transactions',
  BUDGETS: 'spendly_budgets',
  GOALS: 'spendly_goals',
  SUBSCRIPTIONS: 'spendly_subscriptions',
  ACHIEVEMENTS: 'spendly_achievements',
  USER_PROFILE: 'spendly_user_profile',
  ALERTS: 'spendly_alerts',
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_tx',
    title: 'First Transaction',
    description: 'Track your very first expense or income',
    icon: '🏆',
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    unlockedAt: '2026-09-01',
  },
  {
    id: 'saving_streak_7',
    title: '7 Day Saving Streak',
    description: 'Track expenses consistently for 7 consecutive days',
    icon: '🔥',
    unlocked: true,
    progress: 7,
    maxProgress: 7,
    unlockedAt: '2026-09-10',
  },
  {
    id: 'saved_5000',
    title: 'Saved ₹5,000',
    description: 'Reach a net monthly savings surplus of ₹5,000',
    icon: '💰',
    unlocked: true,
    progress: 5000,
    maxProgress: 5000,
    unlockedAt: '2026-09-08',
  },
  {
    id: 'first_goal_done',
    title: 'First Goal Completed',
    description: 'Fully achieve 100% of a targeted savings goal',
    icon: '🎯',
    unlocked: false,
    progress: 5500,
    maxProgress: 8000,
  },
  {
    id: 'reduced_spending',
    title: 'Reduced Spending',
    description: 'Keep your weekly expenses below budget for 2 weeks in a row',
    icon: '📉',
    unlocked: true,
    progress: 2,
    maxProgress: 2,
    unlockedAt: '2026-09-12',
  },
  {
    id: 'super_saver',
    title: 'Super Saver',
    description: 'Achieve a savings rate of greater than 35% in a month',
    icon: '💎',
    unlocked: false,
    progress: 29,
    maxProgress: 35,
  },
  {
    id: 'budget_master',
    title: 'Budget Master',
    description: 'Set custom budgets for at least 4 different spending categories',
    icon: '📊',
    unlocked: true,
    progress: 4,
    maxProgress: 4,
    unlockedAt: '2026-09-03',
  },
  {
    id: 'sub_auditor',
    title: 'Subscription Auditor',
    description: 'Log and monitor at least 3 active recurring subscriptions',
    icon: '📱',
    unlocked: true,
    progress: 4,
    maxProgress: 3,
    unlockedAt: '2026-09-02',
  },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Vijay',
  email: 'vijay@example.com',
  currency: 'INR',
  currencySymbol: '₹',
  monthlyTargetBudget: 28000,
  theme: 'light',
  darkMode: false,
  savingStreak: 8,
  lastActiveDate: '2026-09-13',
  language: 'en',
};

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'b_overall', category: 'Overall', amount: 28000, period: 'monthly' },
  { id: 'b_food', category: 'Food', amount: 6500, period: 'monthly' },
  { id: 'b_travel', category: 'Travel', amount: 3500, period: 'monthly' },
  { id: 'b_shopping', category: 'Shopping', amount: 4000, period: 'monthly' },
  { id: 'b_entertainment', category: 'Entertainment', amount: 2500, period: 'monthly' },
  { id: 'b_bills', category: 'Bills', amount: 3000, period: 'monthly' },
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g_headphones',
    title: 'Sony WH-1000XM5 Headphones',
    targetAmount: 8000,
    currentSaved: 5500,
    deadline: '2026-10-15',
    icon: '🎧',
    category: 'Gadgets',
    createdAt: '2026-08-10',
  },
  {
    id: 'g_bike',
    title: 'New Commuter Bike',
    targetAmount: 120000,
    currentSaved: 42000,
    deadline: '2027-04-30',
    icon: '🏍️',
    category: 'Vehicle',
    createdAt: '2026-07-01',
  },
  {
    id: 'g_trip',
    title: 'Goa Weekend Trip with Friends',
    targetAmount: 25000,
    currentSaved: 16500,
    deadline: '2026-11-20',
    icon: '✈️',
    category: 'Travel',
    createdAt: '2026-08-25',
  },
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_netflix',
    name: 'Netflix Premium',
    amount: 649,
    billingCycle: 'monthly',
    nextPaymentDate: '2026-09-22',
    category: 'Entertainment',
    paymentMethod: 'Credit Card',
    active: true,
  },
  {
    id: 'sub_spotify',
    name: 'Spotify Student Duo',
    amount: 149,
    billingCycle: 'monthly',
    nextPaymentDate: '2026-09-18',
    category: 'Entertainment',
    paymentMethod: 'UPI',
    active: true,
  },
  {
    id: 'sub_youtube',
    name: 'YouTube Premium',
    amount: 129,
    billingCycle: 'monthly',
    nextPaymentDate: '2026-09-28',
    category: 'Entertainment',
    paymentMethod: 'UPI',
    active: true,
  },
  {
    id: 'sub_gym',
    name: 'Gold’s Gym Membership',
    amount: 1500,
    billingCycle: 'monthly',
    nextPaymentDate: '2026-10-01',
    category: 'Healthcare',
    paymentMethod: 'Bank Transfer',
    active: true,
  },
  {
    id: 'sub_cloud',
    name: 'Google One 100GB Cloud',
    amount: 130,
    billingCycle: 'monthly',
    nextPaymentDate: '2026-09-16',
    category: 'Bills',
    paymentMethod: 'Debit Card',
    active: true,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Income
  {
    id: 'tx_inc_1',
    title: 'Monthly Stipend & Tech Salary',
    amount: 42000,
    type: 'income',
    category: 'Salary',
    date: '2026-09-01',
    paymentMethod: 'Bank Transfer',
    description: 'Direct corporate internship deposit',
    createdAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'tx_inc_2',
    title: 'Freelance Web Design Project',
    amount: 8500,
    type: 'income',
    category: 'Freelance',
    date: '2026-09-06',
    paymentMethod: 'UPI',
    description: 'Landing page dev for local client',
    createdAt: '2026-09-06T15:30:00Z',
  },
  {
    id: 'tx_inc_3',
    title: 'Monthly Pocket Money from Parents',
    amount: 5000,
    type: 'income',
    category: 'Pocket Money',
    date: '2026-09-08',
    paymentMethod: 'UPI',
    description: 'Monthly allowance for college hostel',
    createdAt: '2026-09-08T11:00:00Z',
  },

  // Today (2026-09-13)
  {
    id: 'tx_exp_today_1',
    title: 'Campus Cafeteria Lunch',
    amount: 180,
    type: 'expense',
    category: 'Food',
    date: '2026-09-13',
    paymentMethod: 'UPI',
    description: 'Paneer thali with friends',
    createdAt: '2026-09-13T13:15:00Z',
  },
  {
    id: 'tx_exp_today_2',
    title: 'Evening Metro Ride to Library',
    amount: 45,
    type: 'expense',
    category: 'Travel',
    date: '2026-09-13',
    paymentMethod: 'UPI',
    description: 'Smartcard top-up',
    createdAt: '2026-09-13T17:40:00Z',
  },
  {
    id: 'tx_exp_today_3',
    title: 'Coding Reference Book (Algorithms)',
    amount: 620,
    type: 'expense',
    category: 'Education',
    date: '2026-09-13',
    paymentMethod: 'Debit Card',
    description: 'College textbook purchase',
    createdAt: '2026-09-13T18:50:00Z',
  },

  // Yesterday (2026-09-12)
  {
    id: 'tx_exp_yest_1',
    title: 'Zomato Biryani Dinner',
    amount: 420,
    type: 'expense',
    category: 'Food',
    date: '2026-09-12',
    paymentMethod: 'UPI',
    description: 'Late night weekend study meal',
    createdAt: '2026-09-12T20:30:00Z',
  },
  {
    id: 'tx_exp_yest_2',
    title: 'Auto Rickshaw to Station',
    amount: 120,
    type: 'expense',
    category: 'Travel',
    date: '2026-09-12',
    paymentMethod: 'Cash',
    description: 'Urgent commute',
    createdAt: '2026-09-12T09:10:00Z',
  },

  // Earlier in Sep
  {
    id: 'tx_exp_3',
    title: 'Hostel Room Monthly Rent',
    amount: 8000,
    type: 'expense',
    category: 'Rent',
    date: '2026-09-02',
    paymentMethod: 'Bank Transfer',
    description: 'September room accommodation & maintenance',
    createdAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'tx_exp_4',
    title: 'Supermarket Monthly Groceries & Snacks',
    amount: 1950,
    type: 'expense',
    category: 'Food',
    date: '2026-09-03',
    paymentMethod: 'Debit Card',
    description: 'Cereal, dry fruits, milk, hostel pantry',
    createdAt: '2026-09-03T16:00:00Z',
  },
  {
    id: 'tx_exp_5',
    title: 'Wifi High-Speed Fiber Bill',
    amount: 899,
    type: 'expense',
    category: 'Bills',
    date: '2026-09-04',
    paymentMethod: 'UPI',
    description: 'Airtel Xstream monthly fiber plan',
    createdAt: '2026-09-04T12:00:00Z',
  },
  {
    id: 'tx_exp_6',
    title: 'Casual Sneakers Sale (Myntra)',
    amount: 2200,
    type: 'expense',
    category: 'Shopping',
    date: '2026-09-05',
    paymentMethod: 'Credit Card',
    description: 'Discounted campus shoes',
    createdAt: '2026-09-05T14:20:00Z',
  },
  {
    id: 'tx_exp_7',
    title: 'Cafe Mocha & Cookie',
    amount: 260,
    type: 'expense',
    category: 'Food',
    date: '2026-09-07',
    paymentMethod: 'UPI',
    description: 'Study session at Third Wave Coffee',
    createdAt: '2026-09-07T16:45:00Z',
  },
  {
    id: 'tx_exp_8',
    title: 'Cab to Hackathon Venue',
    amount: 340,
    type: 'expense',
    category: 'Travel',
    date: '2026-09-08',
    paymentMethod: 'UPI',
    description: 'Uber ride with team members',
    createdAt: '2026-09-08T08:30:00Z',
  },
  {
    id: 'tx_exp_9',
    title: 'Movie Tickets: IMAX Sci-Fi Release',
    amount: 580,
    type: 'expense',
    category: 'Entertainment',
    date: '2026-09-09',
    paymentMethod: 'UPI',
    description: 'PVR IMAX with college batchmates',
    createdAt: '2026-09-09T19:00:00Z',
  },
  {
    id: 'tx_exp_10',
    title: 'Pharmacy Vitamins & Eye Drops',
    amount: 380,
    type: 'expense',
    category: 'Healthcare',
    date: '2026-09-10',
    paymentMethod: 'UPI',
    description: 'Medication for screen fatigue',
    createdAt: '2026-09-10T21:00:00Z',
  },
  {
    id: 'tx_exp_11',
    title: 'Domino’s Pizza Treat',
    amount: 720,
    type: 'expense',
    category: 'Food',
    date: '2026-09-11',
    paymentMethod: 'Credit Card',
    description: 'Celebrated hackathon 2nd place win',
    createdAt: '2026-09-11T20:15:00Z',
  },
  {
    id: 'tx_exp_12',
    title: 'Mobile Recharge (3-Month Prepaid)',
    amount: 719,
    type: 'expense',
    category: 'Bills',
    date: '2026-09-07',
    paymentMethod: 'UPI',
    description: 'Jio 2GB/day recharge',
    createdAt: '2026-09-07T11:20:00Z',
  },
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'al_1',
    type: 'warning',
    title: 'Food Budget Alert',
    message: 'You have used 78% of your ₹6,500 Food budget for this month.',
    date: '2026-09-13',
    read: false,
    actionTab: 'budget',
  },
  {
    id: 'al_2',
    type: 'info',
    title: 'Subscription Reminder',
    message: 'Google One (₹130) renewal is scheduled in 3 days (16 Sep).',
    date: '2026-09-13',
    read: false,
    actionTab: 'subscriptions',
  },
  {
    id: 'al_3',
    type: 'success',
    title: 'Goal Progress Milestone',
    message: 'Your “Sony Headphones” goal reached 68.7% completion!',
    date: '2026-09-11',
    read: true,
    actionTab: 'goals',
  },
];

// Helper to safely load data
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save to localStorage for key ${key}:`, err);
  }
}

export const getLocalDateString = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const StorageService = {
  getTransactions(): Transaction[] {
    const txs = getLocalItem<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    const todayStr = getLocalDateString();

    if (txs.length === 0) {
      // Update initial sample transactions with today's date
      const seeded = INITIAL_TRANSACTIONS.map((tx) => {
        if (tx.id.startsWith('tx_exp_today')) {
          return { ...tx, date: todayStr };
        }
        return tx;
      });
      setLocalItem(STORAGE_KEYS.TRANSACTIONS, seeded);
      return seeded;
    }

    // Ensure there is at least one transaction for today so the daily budget pacing is active
    const hasTodayTx = txs.some(
      (t) => t.type === 'expense' && (t.date === todayStr || t.date.startsWith(todayStr))
    );

    if (!hasTodayTx) {
      const todaySampleTxs: Transaction[] = [
        {
          id: `tx_today_lunch_${todayStr}`,
          title: 'Campus Cafeteria Lunch',
          amount: 180,
          type: 'expense',
          category: 'Food',
          date: todayStr,
          paymentMethod: 'UPI',
          description: 'Paneer thali & curd',
          createdAt: `${todayStr}T13:15:00Z`,
        },
        {
          id: `tx_today_metro_${todayStr}`,
          title: 'Evening Metro Ride to Library',
          amount: 45,
          type: 'expense',
          category: 'Travel',
          date: todayStr,
          paymentMethod: 'UPI',
          description: 'Smartcard top-up',
          createdAt: `${todayStr}T17:40:00Z`,
        },
        {
          id: `tx_today_chai_${todayStr}`,
          title: 'Chai & Evening Snacks',
          amount: 60,
          type: 'expense',
          category: 'Food',
          date: todayStr,
          paymentMethod: 'UPI',
          description: 'Tea break with college friends',
          createdAt: `${todayStr}T18:20:00Z`,
        },
      ];
      const merged = [...todaySampleTxs, ...txs];
      setLocalItem(STORAGE_KEYS.TRANSACTIONS, merged);
      return merged;
    }

    return txs;
  },

  saveTransactions(transactions: Transaction[]): void {
    setLocalItem(STORAGE_KEYS.TRANSACTIONS, transactions);
  },

  addTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const transactions = this.getTransactions();
    const newTx: Transaction = {
      ...tx,
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    const updated = [newTx, ...transactions];
    this.saveTransactions(updated);
    return newTx;
  },

  updateTransaction(txOrId: string | Transaction, updatedFields?: Partial<Transaction>): Transaction | null {
    const transactions = this.getTransactions();
    const id = typeof txOrId === 'string' ? txOrId : txOrId.id;
    const index = transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;
    const fields = typeof txOrId === 'string' ? updatedFields || {} : txOrId;
    transactions[index] = { ...transactions[index], ...fields };
    this.saveTransactions(transactions);
    return transactions[index];
  },

  deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const filtered = transactions.filter((t) => t.id !== id);
    this.saveTransactions(filtered);
    return true;
  },

  getBudgets(): Budget[] {
    const budgets = getLocalItem<Budget[]>(STORAGE_KEYS.BUDGETS, []);
    if (budgets.length === 0) {
      setLocalItem(STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS);
      return INITIAL_BUDGETS;
    }
    return budgets;
  },

  saveBudgets(budgets: Budget[]): void {
    setLocalItem(STORAGE_KEYS.BUDGETS, budgets);
  },

  addBudget(budget: Omit<Budget, 'id'>): Budget {
    const budgets = this.getBudgets();
    const newBudget: Budget = {
      ...budget,
      id: 'b_' + Date.now(),
    };
    this.saveBudgets([...budgets, newBudget]);
    return newBudget;
  },

  updateBudget(id: string, amount: number): void {
    const budgets = this.getBudgets();
    const updated = budgets.map((b) => (b.id === id ? { ...b, amount } : b));
    this.saveBudgets(updated);
  },

  deleteBudget(id: string): void {
    const budgets = this.getBudgets();
    this.saveBudgets(budgets.filter((b) => b.id !== id));
  },

  getGoals(): Goal[] {
    const goals = getLocalItem<Goal[]>(STORAGE_KEYS.GOALS, []);
    if (goals.length === 0) {
      setLocalItem(STORAGE_KEYS.GOALS, INITIAL_GOALS);
      return INITIAL_GOALS;
    }
    return goals;
  },

  saveGoals(goals: Goal[]): void {
    setLocalItem(STORAGE_KEYS.GOALS, goals);
  },

  addGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Goal {
    const goals = this.getGoals();
    const newGoal: Goal = {
      ...goal,
      id: 'g_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    this.saveGoals([...goals, newGoal]);
    return newGoal;
  },

  updateGoalSavings(id: string, additionalAmount: number): Goal | null {
    const goals = this.getGoals();
    const index = goals.findIndex((g) => g.id === id);
    if (index === -1) return null;
    const current = goals[index];
    const newSaved = Math.max(0, current.currentSaved + additionalAmount);
    goals[index] = { ...current, currentSaved: newSaved };
    this.saveGoals(goals);
    return goals[index];
  },

  deleteGoal(id: string): void {
    const goals = this.getGoals();
    this.saveGoals(goals.filter((g) => g.id !== id));
  },

  getSubscriptions(): Subscription[] {
    const subs = getLocalItem<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    if (subs.length === 0) {
      setLocalItem(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
      return INITIAL_SUBSCRIPTIONS;
    }
    return subs;
  },

  saveSubscriptions(subscriptions: Subscription[]): void {
    setLocalItem(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
  },

  addSubscription(sub: Omit<Subscription, 'id'>): Subscription {
    const subs = this.getSubscriptions();
    const newSub: Subscription = {
      ...sub,
      id: 'sub_' + Date.now(),
    };
    this.saveSubscriptions([...subs, newSub]);
    return newSub;
  },

  deleteSubscription(id: string): void {
    const subs = this.getSubscriptions();
    this.saveSubscriptions(subs.filter((s) => s.id !== id));
  },

  toggleSubscription(id: string): void {
    const subs = this.getSubscriptions();
    const updated = subs.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    this.saveSubscriptions(updated);
  },

  getUserProfile(): UserProfile {
    const profile = getLocalItem<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, INITIAL_USER_PROFILE);
    if (!profile || typeof profile !== 'object') {
      return { ...INITIAL_USER_PROFILE };
    }
    const isDark = profile.darkMode !== undefined ? Boolean(profile.darkMode) : profile.theme === 'dark';
    return {
      ...INITIAL_USER_PROFILE,
      ...profile,
      language: profile.language || 'en',
      darkMode: isDark,
      theme: isDark ? 'dark' : 'light',
      currencySymbol:
        profile.currencySymbol ||
        (profile.currency === 'USD'
          ? '$'
          : profile.currency === 'EUR'
          ? '€'
          : profile.currency === 'GBP'
          ? '£'
          : '₹'),
    };
  },

  saveUserProfile(profile: UserProfile): void {
    setLocalItem(STORAGE_KEYS.USER_PROFILE, profile);
  },

  getAchievements(): Achievement[] {
    const achievements = getLocalItem<Achievement[]>(STORAGE_KEYS.ACHIEVEMENTS, []);
    if (achievements.length === 0) {
      setLocalItem(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
      return INITIAL_ACHIEVEMENTS;
    }
    return achievements;
  },

  saveAchievements(achievements: Achievement[]): void {
    setLocalItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  },

  getAlerts(): AlertItem[] {
    const alerts = getLocalItem<AlertItem[]>(STORAGE_KEYS.ALERTS, []);
    if (alerts.length === 0) {
      setLocalItem(STORAGE_KEYS.ALERTS, INITIAL_ALERTS);
      return INITIAL_ALERTS;
    }
    return alerts;
  },

  saveAlerts(alerts: AlertItem[]): void {
    setLocalItem(STORAGE_KEYS.ALERTS, alerts);
  },

  markAlertRead(id: string): void {
    const alerts = this.getAlerts();
    this.saveAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));
  },

  markAllAlertsRead(): void {
    const alerts = this.getAlerts();
    this.saveAlerts(alerts.map((a) => ({ ...a, read: true })));
  },

  loadDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(INITIAL_SUBSCRIPTIONS));
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(INITIAL_ACHIEVEMENTS));
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(INITIAL_USER_PROFILE));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(INITIAL_ALERTS));
  },

  resetAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    // Re-seed bare minimum
    setLocalItem(STORAGE_KEYS.USER_PROFILE, {
      ...INITIAL_USER_PROFILE,
      name: 'New User',
      savingStreak: 1,
    });
    setLocalItem(STORAGE_KEYS.TRANSACTIONS, []);
    setLocalItem(STORAGE_KEYS.BUDGETS, [
      { id: 'b_overall', category: 'Overall', amount: 20000, period: 'monthly' },
    ]);
    setLocalItem(STORAGE_KEYS.GOALS, []);
    setLocalItem(STORAGE_KEYS.SUBSCRIPTIONS, []);
    setLocalItem(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS.map((a) => ({ ...a, unlocked: false, progress: 0 })));
    setLocalItem(STORAGE_KEYS.ALERTS, []);
  },

  exportJSON(): string {
    const data = {
      transactions: this.getTransactions(),
      budgets: this.getBudgets(),
      goals: this.getGoals(),
      subscriptions: this.getSubscriptions(),
      achievements: this.getAchievements(),
      userProfile: this.getUserProfile(),
      alerts: this.getAlerts(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.transactions) setLocalItem(STORAGE_KEYS.TRANSACTIONS, data.transactions);
      if (data.budgets) setLocalItem(STORAGE_KEYS.BUDGETS, data.budgets);
      if (data.goals) setLocalItem(STORAGE_KEYS.GOALS, data.goals);
      if (data.subscriptions) setLocalItem(STORAGE_KEYS.SUBSCRIPTIONS, data.subscriptions);
      if (data.achievements) setLocalItem(STORAGE_KEYS.ACHIEVEMENTS, data.achievements);
      if (data.userProfile) setLocalItem(STORAGE_KEYS.USER_PROFILE, data.userProfile);
      if (data.alerts) setLocalItem(STORAGE_KEYS.ALERTS, data.alerts);
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  },

  // Convenience methods
  saveTransaction(tx: Transaction): void {
    const list = this.getTransactions();
    const idx = list.findIndex((t) => t.id === tx.id);
    if (idx >= 0) {
      list[idx] = tx;
      this.saveTransactions(list);
    } else {
      this.saveTransactions([tx, ...list]);
    }
  },

  saveBudget(budget: Budget): void {
    const list = this.getBudgets();
    const idx = list.findIndex((b) => b.id === budget.id);
    if (idx >= 0) {
      list[idx] = budget;
      this.saveBudgets(list);
    } else {
      this.saveBudgets([...list, budget]);
    }
  },

  saveGoal(goal: Goal): void {
    const list = this.getGoals();
    const idx = list.findIndex((g) => g.id === goal.id);
    if (idx >= 0) {
      list[idx] = goal;
      this.saveGoals(list);
    } else {
      this.saveGoals([...list, goal]);
    }
  },

  updateGoalProgress(id: string, delta: number): void {
    this.updateGoalSavings(id, delta);
  },

  saveSubscription(sub: Subscription): void {
    const list = this.getSubscriptions();
    const idx = list.findIndex((s) => s.id === sub.id);
    if (idx >= 0) {
      list[idx] = sub;
      this.saveSubscriptions(list);
    } else {
      this.saveSubscriptions([...list, sub]);
    }
  },

  updateUserProfile(updated: Partial<UserProfile>): void {
    const current = this.getUserProfile();
    const merged = { ...current, ...updated };
    this.saveUserProfile(merged);
  },

  dismissAlert(id: string): void {
    const list = this.getAlerts();
    this.saveAlerts(list.filter((a) => a.id !== id));
  },

  clearAllAlerts(): void {
    this.saveAlerts([]);
  },

  resetToDemoData(): void {
    this.loadDemoData();
  },

  clearAllData(): void {
    this.resetAllData();
  },

  exportFullData(): any {
    return {
      transactions: this.getTransactions(),
      budgets: this.getBudgets(),
      goals: this.getGoals(),
      subscriptions: this.getSubscriptions(),
      achievements: this.getAchievements(),
      userProfile: this.getUserProfile(),
      alerts: this.getAlerts(),
      exportedAt: new Date().toISOString(),
    };
  },

  importFullData(jsonData: any): boolean {
    try {
      if (jsonData.transactions) setLocalItem(STORAGE_KEYS.TRANSACTIONS, jsonData.transactions);
      if (jsonData.budgets) setLocalItem(STORAGE_KEYS.BUDGETS, jsonData.budgets);
      if (jsonData.goals) setLocalItem(STORAGE_KEYS.GOALS, jsonData.goals);
      if (jsonData.subscriptions) setLocalItem(STORAGE_KEYS.SUBSCRIPTIONS, jsonData.subscriptions);
      if (jsonData.achievements) setLocalItem(STORAGE_KEYS.ACHIEVEMENTS, jsonData.achievements);
      if (jsonData.userProfile) setLocalItem(STORAGE_KEYS.USER_PROFILE, jsonData.userProfile);
      if (jsonData.alerts) setLocalItem(STORAGE_KEYS.ALERTS, jsonData.alerts);
      return true;
    } catch (e) {
      console.error('Failed to import full data:', e);
      return false;
    }
  },
};
