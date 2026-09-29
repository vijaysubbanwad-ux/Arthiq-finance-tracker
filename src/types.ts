export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Education'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Rent'
  | 'Subscriptions'
  | 'Other';

export type IncomeSource =
  | 'Salary'
  | 'Pocket Money'
  | 'Freelance'
  | 'Scholarship'
  | 'Business'
  | 'Other';

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Debit Card'
  | 'Credit Card'
  | 'Bank Transfer';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: ExpenseCategory | IncomeSource;
  date: string; // ISO string or YYYY-MM-DD
  paymentMethod: PaymentMethod;
  description?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory | 'Overall';
  amount: number;
  period: 'monthly';
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentSaved: number;
  deadline: string; // YYYY-MM-DD
  icon?: string;
  category?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'monthly' | 'yearly';
  nextPaymentDate: string; // YYYY-MM-DD
  category: string;
  paymentMethod: PaymentMethod;
  active: boolean;
  notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

export type Language = 'en' | 'hi' | 'mr';

export interface UserProfile {
  name: string;
  email: string;
  currency: string;
  currencySymbol: string;
  monthlyTargetBudget: number;
  theme: 'light' | 'dark';
  savingStreak: number;
  lastActiveDate: string;
  monthlyIncome?: number;
  monthlyBudget?: number;
  savingsTarget?: number;
  darkMode?: boolean;
  language?: Language;
  phoneNumber?: string;
  avatarUrl?: string;
  photoURL?: string;
  notificationsEnabled?: boolean;
  onboardingCompleted?: boolean;
  uid?: string;
  monthlyReportEmail?: string;
  enableMonthlyReportPdf?: boolean;
  reportDeliveryDay?: number;
}

export interface AlertItem {
  id: string;
  type: 'warning' | 'info' | 'success' | 'danger';
  title: string;
  message: string;
  date: string;
  read: boolean;
  actionTab?: string;
}

export interface FinancialHealthScore {
  score: number;
  rating: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  savingsRateScore: number; // 0-30
  budgetUsageScore: number; // 0-25
  expenseConsistencyScore: number; // 0-20
  incomeBufferScore: number; // 0-15
  goalProgressScore: number; // 0-10
  explanation: string;
  breakdown: {
    label: string;
    score: number;
    max: number;
    description: string;
  }[];
  tips: string[];
}

export interface SmartInsight {
  id: string;
  type: 'increase' | 'saving' | 'highest' | 'trend' | 'positive';
  icon: string;
  title: string;
  description: string;
  badgeText?: string;
  actionText?: string;
  actionTab?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'ai';
  text: string;
  timestamp: string;
  suggestions?: string[];
  suggestedActions?: string[];
  metrics?: {
    label: string;
    value: string;
  }[];
}

export type ActiveTab =
  | 'dashboard'
  | 'transactions'
  | 'income'
  | 'analytics'
  | 'goals'
  | 'budget'
  | 'budgets'
  | 'subscriptions'
  | 'ai-chat'
  | 'monthly-report'
  | 'reports'
  | 'settings';

export type CurrencyCode =
  | 'INR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'AED'
  | 'CAD'
  | 'AUD'
  | 'JPY'
  | 'SGD'
  | 'CHF'
  | 'SAR';

export interface CurrencyMeta {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  locale: string;
  decimals: number;
}
