import {
  Budget,
  FinancialHealthScore,
  Goal,
  SmartInsight,
  Transaction,
} from '../types';
import { formatCurrency } from './formatters';

export function calculateFinancialHealth(
  transactions: Transaction[],
  budgets: Budget[],
  goals: Goal[],
  currencySymbol = '₹'
): FinancialHealthScore {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Current month transactions
  const thisMonthTxs = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = thisMonthTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = thisMonthTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

  // 1. Savings Rate Score (Max 30 points)
  // >= 30% savings rate = 30 pts; 20% = 20 pts; 10% = 10 pts
  let savingsRateScore = 0;
  if (savingsRate >= 35) savingsRateScore = 30;
  else if (savingsRate >= 25) savingsRateScore = 25;
  else if (savingsRate >= 15) savingsRateScore = 18;
  else if (savingsRate >= 5) savingsRateScore = 10;
  else if (savingsRate > 0) savingsRateScore = 5;

  // 2. Budget Usage Score (Max 25 points)
  const overallBudget =
    budgets.find((b) => b.category === 'Overall')?.amount ||
    budgets.reduce((acc, b) => acc + (b.category !== 'Overall' ? b.amount : 0), 0) ||
    (totalIncome > 0 ? totalIncome * 0.7 : 30000);

  const budgetUsagePercent = overallBudget > 0 ? (totalExpenses / overallBudget) * 100 : 80;
  let budgetUsageScore = 0;
  if (budgetUsagePercent <= 70) budgetUsageScore = 25;
  else if (budgetUsagePercent <= 85) budgetUsageScore = 20;
  else if (budgetUsagePercent <= 100) budgetUsageScore = 14;
  else if (budgetUsagePercent <= 115) budgetUsageScore = 7;
  else budgetUsageScore = 2;

  // 3. Expense Consistency (Max 20 points)
  // Check if daily expenses are evenly distributed without erratic wild surges
  const dailyExpenses: Record<string, number> = {};
  thisMonthTxs
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      dailyExpenses[t.date] = (dailyExpenses[t.date] || 0) + t.amount;
    });
  const expenseValues = Object.values(dailyExpenses);
  let expenseConsistencyScore = 14; // baseline reasonable
  if (expenseValues.length >= 5) {
    const avg = expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length;
    const variance =
      expenseValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / expenseValues.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avg > 0 ? stdDev / avg : 1;
    if (coefficientOfVariation < 0.8) expenseConsistencyScore = 20;
    else if (coefficientOfVariation < 1.4) expenseConsistencyScore = 16;
    else expenseConsistencyScore = 10;
  }

  // 4. Income vs Expense Buffer (Max 15 points)
  let incomeBufferScore = 0;
  if (totalIncome > 0) {
    const expenseRatio = totalExpenses / totalIncome;
    if (expenseRatio <= 0.6) incomeBufferScore = 15;
    else if (expenseRatio <= 0.75) incomeBufferScore = 12;
    else if (expenseRatio <= 0.9) incomeBufferScore = 8;
    else if (expenseRatio <= 1.0) incomeBufferScore = 4;
    else incomeBufferScore = 1;
  } else {
    incomeBufferScore = 8;
  }

  // 5. Goal Progress (Max 10 points)
  let goalProgressScore = 5;
  if (goals.length > 0) {
    const avgGoalProgress =
      goals.reduce((sum, g) => sum + (g.targetAmount > 0 ? (g.currentSaved / g.targetAmount) * 100 : 0), 0) /
      goals.length;
    if (avgGoalProgress >= 70) goalProgressScore = 10;
    else if (avgGoalProgress >= 40) goalProgressScore = 8;
    else if (avgGoalProgress >= 20) goalProgressScore = 6;
    else goalProgressScore = 4;
  }

  const rawScore =
    savingsRateScore + budgetUsageScore + expenseConsistencyScore + incomeBufferScore + goalProgressScore;
  const score = Math.min(100, Math.max(15, Math.round(rawScore)));

  let rating: FinancialHealthScore['rating'] = 'Average';
  let explanation = '';

  if (score >= 80) {
    rating = 'Excellent';
    explanation = `Outstanding financial posture! You maintain a strong ${savingsRate.toFixed(1)}% savings rate and your spending is comfortably within budget limits.`;
  } else if (score >= 68) {
    rating = 'Good';
    explanation = `Healthy financial habits. You have a solid cash buffer and stay on track with savings, with minor room to optimize recurring spending.`;
  } else if (score >= 50) {
    rating = 'Average';
    explanation = `Moderate financial health. Your spending is close to your monthly budget ceiling. Boosting your savings reserve will elevate your stability.`;
  } else {
    rating = 'Needs Improvement';
    explanation = `High financial pressure. Expenses are consuming nearly all incoming cash flow. Cutting discretionary expenses will restore balance.`;
  }

  const tips: string[] = [];
  if (savingsRate < 20) {
    tips.push(`Target a minimum 20% savings rate by automating savings right when your salary or pocket money arrives.`);
  }
  if (budgetUsagePercent > 80) {
    tips.push(`Slow down discretionary spending on Shopping and Dining to avoid breaking your monthly ceiling.`);
  }
  if (goals.some((g) => g.currentSaved < g.targetAmount * 0.3)) {
    tips.push(`Contribute small daily amounts (e.g. ${currencySymbol}100/day) toward your lagging goals to build momentum.`);
  }
  if (tips.length === 0) {
    tips.push(`Maintain your consistent weekly tracking habit to keep unlocking high financial health tiers!`);
    tips.push(`Consider redirecting surplus cash into higher-yield investments or emergency reserves.`);
  }

  return {
    score,
    rating,
    savingsRateScore,
    budgetUsageScore,
    expenseConsistencyScore,
    incomeBufferScore,
    goalProgressScore,
    explanation,
    breakdown: [
      {
        label: 'Savings Rate',
        score: savingsRateScore,
        max: 30,
        description: `${savingsRate.toFixed(0)}% of income saved this month`,
      },
      {
        label: 'Budget Discipline',
        score: budgetUsageScore,
        max: 25,
        description: `${budgetUsagePercent.toFixed(0)}% of monthly budget utilized`,
      },
      {
        label: 'Expense Consistency',
        score: expenseConsistencyScore,
        max: 20,
        description: 'Predictable daily spending patterns without wild spikes',
      },
      {
        label: 'Cash Flow Buffer',
        score: incomeBufferScore,
        max: 15,
        description: `Income comfortably exceeds outflow by ${formatCurrency(Math.max(0, netSavings), currencySymbol)}`,
      },
      {
        label: 'Goal Progress',
        score: goalProgressScore,
        max: 10,
        description: `${goals.length} active savings targets tracking on schedule`,
      },
    ],
    tips,
  };
}

export function generateSmartInsights(
  transactions: Transaction[],
  budgets: Budget[],
  currencySymbol = '₹'
): SmartInsight[] {
  const insights: SmartInsight[] = [];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = transactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Calculate category totals
  const categoryTotals: Record<string, number> = {};
  thisMonthExpenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  // 1. Highest spending category
  let topCategory = '';
  let topCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategory = cat;
    }
  });

  if (topCategory) {
    const totalExp = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
    const catPercent = totalExp > 0 ? Math.round((topCategoryAmount / totalExp) * 100) : 0;
    insights.push({
      id: 'insight_top_cat',
      type: 'highest',
      icon: '📊',
      title: `Highest Spending: ${topCategory}`,
      description: `Your highest expense category is ${topCategory} at ${formatCurrency(topCategoryAmount, currencySymbol)} (${catPercent}% of total expenses this month).`,
      badgeText: `${catPercent}% of total`,
      actionTab: 'analytics',
    });
  }

  // 2. Food / Dining surge insight
  const foodTotal = categoryTotals['Food'] || 0;
  if (foodTotal > 2500) {
    const potentialSaving = Math.round(foodTotal * 0.22);
    insights.push({
      id: 'insight_food_savings',
      type: 'saving',
      icon: '💡',
      title: 'Smart Savings Opportunity',
      description: `You spent ${formatCurrency(foodTotal, currencySymbol)} on dining & snacks. Cooking or hostel meals on 2 extra weekdays could save approximately ${formatCurrency(potentialSaving, currencySymbol)} this month!`,
      badgeText: `Save ~${formatCurrency(potentialSaving, currencySymbol)}`,
      actionTab: 'budget',
    });
  }

  // 3. Category budget near limit or comparison
  const foodBudget = budgets.find((b) => b.category === 'Food');
  if (foodBudget && foodTotal >= foodBudget.amount * 0.75) {
    const pct = Math.round((foodTotal / foodBudget.amount) * 100);
    insights.push({
      id: 'insight_budget_warning',
      type: 'increase',
      icon: '⚠️',
      title: 'Food Budget Approaching Limit',
      description: `You have consumed ${pct}% of your ${formatCurrency(foodBudget.amount, currencySymbol)} Food budget with ${Math.max(1, 30 - now.getDate())} days remaining.`,
      badgeText: `${pct}% Used`,
      actionTab: 'budget',
    });
  }

  // 4. Positive savings rate or weekend insight
  const weekendExpenses = thisMonthExpenses.filter((t) => {
    const day = new Date(t.date).getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  });
  const weekendSum = weekendExpenses.reduce((a, b) => a + b.amount, 0);
  const weekdaySum = thisMonthExpenses.reduce((a, b) => a + b.amount, 0) - weekendSum;

  if (weekendExpenses.length > 0 && weekendSum > weekdaySum * 0.4) {
    insights.push({
      id: 'insight_weekend',
      type: 'trend',
      icon: '⚡',
      title: 'Weekend Spending Pattern',
      description: `Weekend spending accounts for ${Math.round((weekendSum / (weekendSum + weekdaySum || 1)) * 100)}% of your expenses. Setting weekend limits helps protect your monthly savings.`,
      badgeText: 'Pattern Alert',
      actionTab: 'analytics',
    });
  } else {
    insights.push({
      id: 'insight_health',
      type: 'positive',
      icon: '🎯',
      title: 'Consistent Daily Discipline',
      description: `Great pacing! Your average daily spending is steady and aligned with your monthly goals.`,
      badgeText: 'On Track',
      actionTab: 'dashboard',
    });
  }

  return insights;
}
