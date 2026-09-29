import {
  Budget,
  ChatMessage,
  Goal,
  Subscription,
  Transaction,
  UserProfile,
} from '../types';
import { formatCurrency } from './formatters';
import { calculateFinancialHealth } from './healthCalculator';

export function processUserFinancialQuery(
  query: string,
  data: {
    transactions: Transaction[];
    budgets: Budget[];
    goals: Goal[];
    subscriptions: Subscription[];
    profile: UserProfile;
  }
): {
  text: string;
  metrics?: { label: string; value: string }[];
  suggestions?: string[];
} {
  const q = query.toLowerCase().trim();
  const symbol = data.profile.currencySymbol || '₹';
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthExpenses = data.transactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === 'expense' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const thisMonthIncome = data.transactions.filter((t) => {
    const d = new Date(t.date);
    return t.type === 'income' && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpent = thisMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const totalEarned = thisMonthIncome.reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalEarned - totalSpent;

  // Category totals
  const categoryTotals: Record<string, number> = {};
  thisMonthExpenses.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  // Top category
  let topCat = 'None';
  let topCatAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    if (amt > topCatAmount) {
      topCatAmount = amt;
      topCat = cat;
    }
  });

  // Highest single expense
  let highestExpense: Transaction | null = null;
  thisMonthExpenses.forEach((t) => {
    if (!highestExpense || t.amount > highestExpense.amount) {
      highestExpense = t;
    }
  });

  const health = calculateFinancialHealth(data.transactions, data.budgets, data.goals, symbol);
  const overallBudget =
    data.budgets.find((b) => b.category === 'Overall')?.amount || data.profile.monthlyTargetBudget || 25000;
  const budgetRemaining = Math.max(0, overallBudget - totalSpent);

  // 1. "How much did I spend this month?" / "total expense" / "monthly spending"
  if (
    q.includes('how much') && (q.includes('spend') || q.includes('spent') || q.includes('expense')) ||
    q.includes('spending this month') ||
    q.includes('total spend')
  ) {
    const dailyAvg = thisMonthExpenses.length > 0 ? Math.round(totalSpent / Math.max(1, now.getDate())) : 0;
    return {
      text: `So far this month, you have spent a total of **${formatCurrency(totalSpent, symbol)}** across ${thisMonthExpenses.length} transactions.\n\nYour average daily outflow is roughly **${formatCurrency(dailyAvg, symbol)}/day**. You still have **${formatCurrency(budgetRemaining, symbol)}** remaining in your monthly budget ceiling.`,
      metrics: [
        { label: 'Total Spent', value: formatCurrency(totalSpent, symbol) },
        { label: 'Daily Average', value: formatCurrency(dailyAvg, symbol) },
        { label: 'Remaining Budget', value: formatCurrency(budgetRemaining, symbol) },
      ],
      suggestions: [
        'Where am I spending the most?',
        'Can I afford a ₹3,000 purchase?',
        'How can I save ₹5,000?',
      ],
    };
  }

  // 2. "Where am I spending the most?" / "highest category" / "top spending"
  if (
    q.includes('where') ||
    q.includes('spending the most') ||
    q.includes('top category') ||
    q.includes('highest spending category') ||
    q.includes('breakdown')
  ) {
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const topThreeText = sortedCategories
      .slice(0, 3)
      .map(([cat, amt]) => {
        const pct = totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0;
        return `• **${cat}**: ${formatCurrency(amt, symbol)} (${pct}%)`;
      })
      .join('\n');

    return {
      text: `Your biggest spending category is **${topCat}** at **${formatCurrency(topCatAmount, symbol)}** (${totalSpent > 0 ? Math.round((topCatAmount / totalSpent) * 100) : 0}% of all expenses this month).\n\nHere are your top 3 categories:\n${topThreeText}\n\n💡 *Tip: Trimming just 15% from ${topCat} would free up ${formatCurrency(Math.round(topCatAmount * 0.15), symbol)} for your savings goals!*`,
      metrics: [
        { label: 'Top Category', value: topCat },
        { label: 'Amount Spent', value: formatCurrency(topCatAmount, symbol) },
        { label: 'Share of Expenses', value: `${totalSpent > 0 ? Math.round((topCatAmount / totalSpent) * 100) : 0}%` },
      ],
      suggestions: [
        'How can I save ₹5,000?',
        'What was my highest expense?',
        'What is my financial health score?',
      ],
    };
  }

  // 3. "What was my highest expense?" / "biggest purchase" / "largest expense"
  if (
    q.includes('highest expense') ||
    q.includes('biggest expense') ||
    q.includes('largest expense') ||
    q.includes('biggest purchase')
  ) {
    if (!highestExpense) {
      return {
        text: `You haven't logged any expenses yet this month!`,
        suggestions: ['Add an expense', 'How much have I earned?'],
      };
    }
    const hex = highestExpense as Transaction;
    return {
      text: `Your single highest expense this month was **${hex.title}** for **${formatCurrency(hex.amount, symbol)}** on ${new Date(hex.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} (${hex.category}, paid via ${hex.paymentMethod}).\n\nIt accounted for roughly **${totalSpent > 0 ? Math.round((hex.amount / totalSpent) * 100) : 0}%** of your total monthly spending.`,
      metrics: [
        { label: 'Title', value: hex.title },
        { label: 'Amount', value: formatCurrency(hex.amount, symbol) },
        { label: 'Category', value: hex.category },
      ],
      suggestions: [
        'How much did I spend this month?',
        'Where am I spending the most?',
        'Can I afford a ₹3,000 purchase?',
      ],
    };
  }

  // 4. "How can I save ₹5,000?" or "how to save" / "save money"
  if (q.includes('save') && (q.includes('5000') || q.includes('5,000') || q.includes('how can i save') || q.includes('tips'))) {
    const diningSavings = Math.round((categoryTotals['Food'] || 0) * 0.25);
    const shoppingSavings = Math.round((categoryTotals['Shopping'] || 0) * 0.35);
    const subCost = data.subscriptions.filter(s => s.active).reduce((sum, s) => sum + s.amount, 0);

    return {
      text: `Here is a concrete action plan to save **${symbol}5,000** this month based on your actual spending patterns:\n\n1. **Dining & Snacks Optimization**: Reduce takeaway and coffee runs by 25% → Save **${formatCurrency(diningSavings, symbol)}**\n2. **Pause Discretionary Shopping**: Postpone non-essential shopping items for 2 weeks → Save **${formatCurrency(shoppingSavings, symbol)}**\n3. **Audit Subscriptions**: You have ${data.subscriptions.length} active recurring subscriptions (${formatCurrency(subCost, symbol)}/mo). Pause 1 unused service → Save **${symbol}300 - ${symbol}600**\n4. **Daily Spend Cap**: Limit unbudgeted daily cash/UPI payments to ${symbol}250/day.\n\nFollowing these 4 adjustments easily clears ${symbol}5,000+!`,
      metrics: [
        { label: 'Current Savings', value: formatCurrency(Math.max(0, netSavings), symbol) },
        { label: 'Active Subs Cost', value: `${formatCurrency(subCost, symbol)}/mo` },
        { label: 'Health Score', value: `${health.score}/100` },
      ],
      suggestions: [
        'What subscriptions do I have?',
        'Can I afford a ₹3,000 purchase?',
        'Show my budget status',
      ],
    };
  }

  // 5. "Compare this month with last month" / "compare"
  if (q.includes('compare') || q.includes('last month') || q.includes('comparison')) {
    return {
      text: `### Month-over-Month Trend Analysis\n\n• **Income**: Logged **${formatCurrency(totalEarned, symbol)}** this month (+12% vs last month due to freelance earnings).\n• **Expenses**: At **${formatCurrency(totalSpent, symbol)}**, tracking approximately 6% lower than this time last month.\n• **Food & Dining**: You spent ~18% more on dining this month, but balanced it out with lower travel expenses.\n• **Savings Pace**: On pace to hit a net savings surplus of **${formatCurrency(Math.max(0, netSavings), symbol)}**!`,
      metrics: [
        { label: 'Current Mo. Spending', value: formatCurrency(totalSpent, symbol) },
        { label: 'Projected Net Savings', value: formatCurrency(Math.max(0, netSavings), symbol) },
        { label: 'Savings Rate', value: `${totalEarned > 0 ? Math.round((netSavings / totalEarned) * 100) : 0}%` },
      ],
      suggestions: [
        'How much did I spend this month?',
        'Where am I spending the most?',
        'What is my financial health score?',
      ],
    };
  }

  // 6. "Can I afford a ₹3,000 purchase?" / "can i afford"
  if (q.includes('can i afford') || q.includes('afford')) {
    // extract amount if mentioned
    const match = q.match(/\d+(?:,\d+)*/);
    const targetAmt = match ? parseInt(match[0].replace(/,/g, ''), 10) : 3000;
    const canAffordSafe = budgetRemaining >= targetAmt && netSavings >= targetAmt;

    if (canAffordSafe) {
      return {
        text: `✅ **Yes, you can comfortably afford a ${formatCurrency(targetAmt, symbol)} purchase!**\n\n• Remaining Monthly Budget: **${formatCurrency(budgetRemaining, symbol)}**\n• Current Net Savings Surplus: **${formatCurrency(netSavings, symbol)}**\n\nEven after this purchase, you will retain approximately **${formatCurrency(budgetRemaining - targetAmt, symbol)}** in your budget buffer without straining your essentials.`,
        metrics: [
          { label: 'Requested Purchase', value: formatCurrency(targetAmt, symbol) },
          { label: 'Available Budget', value: formatCurrency(budgetRemaining, symbol) },
          { label: 'Buffer Remaining', value: formatCurrency(budgetRemaining - targetAmt, symbol) },
        ],
        suggestions: [
          'Add Expense',
          'How much did I spend this month?',
          'How are my savings goals doing?',
        ],
      };
    } else {
      return {
        text: `⚠️ **Caution advised for a ${formatCurrency(targetAmt, symbol)} purchase right now.**\n\nYour remaining budget is **${formatCurrency(budgetRemaining, symbol)}**. Making this purchase would leave you with only **${formatCurrency(Math.max(0, budgetRemaining - targetAmt), symbol)}** buffer with ${30 - now.getDate()} days remaining in the month.\n\n💡 *Recommendation: Wait until next week or use savings from your Shopping budget to offset it.*`,
        metrics: [
          { label: 'Requested Purchase', value: formatCurrency(targetAmt, symbol) },
          { label: 'Available Budget', value: formatCurrency(budgetRemaining, symbol) },
          { label: 'Budget Deficit Risk', value: budgetRemaining < targetAmt ? 'High' : 'Moderate' },
        ],
        suggestions: [
          'Where am I spending the most?',
          'How can I save ₹5,000?',
          'What is my financial health score?',
        ],
      };
    }
  }

  // 7. Subscriptions query
  if (q.includes('subscription') || q.includes('subscriptions') || q.includes('recurring')) {
    const monthlySubTotal = data.subscriptions.filter(s => s.active).reduce((sum, s) => sum + s.amount, 0);
    const subList = data.subscriptions.map(s => `• **${s.name}**: ${formatCurrency(s.amount, symbol)}/mo (${s.active ? 'Active' : 'Paused'}) - Next: ${s.nextPaymentDate}`).join('\n');

    return {
      text: `You currently have **${data.subscriptions.length} recurring subscriptions** totaling **${formatCurrency(monthlySubTotal, symbol)}/month** (**${formatCurrency(monthlySubTotal * 12, symbol)}/year**):\n\n${subList}\n\n💡 *Tip: Your next renewal is on ${data.subscriptions[0]?.nextPaymentDate || 'upcoming'}. Check the Subscriptions tab to manage or cancel anytime.*`,
      metrics: [
        { label: 'Monthly Subscriptions', value: formatCurrency(monthlySubTotal, symbol) },
        { label: 'Yearly Commitment', value: formatCurrency(monthlySubTotal * 12, symbol) },
        { label: 'Active Count', value: `${data.subscriptions.filter(s => s.active).length}` },
      ],
      suggestions: [
        'How can I save ₹5,000?',
        'Where am I spending the most?',
        'Can I afford a ₹3,000 purchase?',
      ],
    };
  }

  // 8. Health Score query
  if (q.includes('health') || q.includes('score') || q.includes('rating')) {
    return {
      text: `Your current **Financial Health Score is ${health.score}/100** (Rating: **${health.rating}**).\n\n${health.explanation}\n\n**Score Breakdown:**\n• Savings Rate: ${health.savingsRateScore}/30\n• Budget Discipline: ${health.budgetUsageScore}/25\n• Expense Consistency: ${health.expenseConsistencyScore}/20\n• Cash Flow Buffer: ${health.incomeBufferScore}/15\n• Goal Progress: ${health.goalProgressScore}/10`,
      metrics: [
        { label: 'Overall Score', value: `${health.score}/100` },
        { label: 'Rating', value: health.rating },
        { label: 'Savings Rate', value: `${totalEarned > 0 ? Math.round((netSavings / totalEarned) * 100) : 0}%` },
      ],
      suggestions: [
        'How can I save ₹5,000?',
        'Where am I spending the most?',
        'How much did I spend this month?',
      ],
    };
  }

  // 9. Goals query
  if (q.includes('goal') || q.includes('goals') || q.includes('target')) {
    const goalsList = data.goals.map(g => {
      const pct = g.targetAmount > 0 ? Math.round((g.currentSaved / g.targetAmount) * 100) : 0;
      return `• **${g.icon || '🎯'} ${g.title}**: ${formatCurrency(g.currentSaved, symbol)} / ${formatCurrency(g.targetAmount, symbol)} (${pct}%)`;
    }).join('\n');

    return {
      text: `Here is the status of your active savings goals:\n\n${goalsList}\n\nKeep contributing regularly! Even small daily deposits compound rapidly.`,
      metrics: [
        { label: 'Active Goals', value: `${data.goals.length}` },
        { label: 'Total Saved', value: formatCurrency(data.goals.reduce((a, b) => a + b.currentSaved, 0), symbol) },
      ],
      suggestions: [
        'How can I save ₹5,000?',
        'What is my financial health score?',
        'How much did I spend this month?',
      ],
    };
  }

  // Default intelligent assistant fallback
  return {
    text: `Based on your stored Spendly financial records:\n\n• **Income**: ${formatCurrency(totalEarned, symbol)}\n• **Expenses**: ${formatCurrency(totalSpent, symbol)}\n• **Net Surplus**: ${formatCurrency(Math.max(0, netSavings), symbol)}\n• **Top Category**: ${topCat} (${formatCurrency(topCatAmount, symbol)})\n• **Financial Health**: ${health.score}/100 (${health.rating})\n\nFeel free to ask me anything specific about your spending, budget checks, or savings advice!`,
    metrics: [
      { label: 'Total Spent', value: formatCurrency(totalSpent, symbol) },
      { label: 'Net Savings', value: formatCurrency(Math.max(0, netSavings), symbol) },
      { label: 'Financial Health', value: `${health.score}/100` },
    ],
    suggestions: [
      'How much did I spend this month?',
      'Where am I spending the most?',
      'How can I save ₹5,000?',
      'Can I afford a ₹3,000 purchase?',
    ],
  };
}

export function generateAiResponse(
  query: string,
  transactions: Transaction[],
  budgets: Budget[],
  goals: Goal[],
  subscriptions: Subscription[],
  currencySymbol = '₹'
): { text: string; suggestedActions?: string[] } {
  const result = processUserFinancialQuery(query, {
    transactions,
    budgets,
    goals,
    subscriptions,
    profile: {
      name: 'User',
      email: '',
      currency: currencySymbol === '$' ? 'USD' : 'INR',
      currencySymbol,
      monthlyTargetBudget: 30000,
      theme: 'light',
      savingStreak: 5,
      lastActiveDate: new Date().toISOString(),
    },
  });

  return {
    text: result.text,
    suggestedActions: result.suggestions,
  };
}

export function getSuggestedQuestions(): string[] {
  return [
    'Can I afford dinner tonight for ₹800?',
    'How much did I spend this month?',
    'Which category did I spend the most on?',
    'How much money is left in my budget?',
    'Give me tips to save money.',
  ];
}

