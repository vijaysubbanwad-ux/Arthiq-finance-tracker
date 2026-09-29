import { Language } from '../types';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🚩' },
];

export const TRANSLATIONS = {
  // Navigation & Tabs
  nav_dashboard: {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    mr: 'डॅशबोर्ड',
  },
  nav_timeline: {
    en: 'Timeline',
    hi: 'लेन-देन',
    mr: 'व्यवहार',
  },
  nav_transactions: {
    en: 'Transactions',
    hi: 'लेन-देन सूची',
    mr: 'व्यवहार सूची',
  },
  nav_income: {
    en: 'Income Hub',
    hi: 'आय केंद्र',
    mr: 'उत्पन्न केंद्र',
  },
  nav_analytics: {
    en: 'Analytics',
    hi: 'विश्लेषण',
    mr: 'विश्लेषण',
  },
  nav_budgets: {
    en: 'Budgets',
    hi: 'बजट',
    mr: 'बजेट',
  },
  nav_goals: {
    en: 'Savings Goals',
    hi: 'बचत लक्ष्य',
    mr: 'बचत ध्येये',
  },
  nav_subscriptions: {
    en: 'Subscriptions',
    hi: 'सदस्यता',
    mr: 'वर्गणी / सदस्यता',
  },
  nav_ai_chat: {
    en: 'Arthiq AI',
    hi: 'आर्थिक AI',
    mr: 'आर्थिक AI',
  },
  nav_monthly_report: {
    en: 'Monthly Report',
    hi: 'मासिक रिपोर्ट',
    mr: 'मासिक अहवाल',
  },
  nav_settings: {
    en: 'Settings',
    hi: 'सेटिंग्स',
    mr: 'सेटिंग्ज',
  },
  nav_menu: {
    en: 'Menu',
    hi: 'मेनू',
    mr: 'मेनू',
  },

  // Header & Greetings
  greeting_morning: {
    en: 'Good morning',
    hi: 'शुभ प्रभात',
    mr: 'शुभ सकाळ',
  },
  greeting_afternoon: {
    en: 'Good afternoon',
    hi: 'शुभ दोपहर',
    mr: 'शुभ दुपार',
  },
  greeting_evening: {
    en: 'Good evening',
    hi: 'शुभ संध्या',
    mr: 'शुभ संध्याकाळ',
  },
  header_subtitle: {
    en: 'Spendly AI Financial Command Center',
    hi: 'Spendly AI वित्तीय नियंत्रण केंद्र',
    mr: 'Spendly AI आर्थिक नियंत्रण केंद्र',
  },
  health_score_badge: {
    en: 'Health',
    hi: 'स्वास्थ्य',
    mr: 'आरोग्य',
  },
  add_entry: {
    en: 'Add Entry',
    hi: 'प्रविष्टि जोड़ें',
    mr: 'नोंद जोडा',
  },
  day_mode: {
    en: 'Day Mode',
    hi: 'दिन मोड',
    mr: 'दिवस मोड',
  },
  night_mode: {
    en: 'Night Mode',
    hi: 'रात मोड',
    mr: 'रात्र मोड',
  },
  switch_to_light: {
    en: 'Switch to Day Mode',
    hi: 'दिन मोड में बदलें',
    mr: 'दिवस मोडमध्ये बदला',
  },
  switch_to_dark: {
    en: 'Switch to Night Mode',
    hi: 'रात मोड में बदलें',
    mr: 'रात्र मोडमध्ये बदला',
  },
  select_language: {
    en: 'Select Language',
    hi: 'भाषा चुनें',
    mr: 'भाषा निवडा',
  },
  smart_alerts: {
    en: 'Smart Alerts',
    hi: 'स्मार्ट सूचनाएं',
    mr: 'स्मार्ट सूचना',
  },
  mark_all_read: {
    en: 'Mark all read',
    hi: 'सभी पढ़ी गईं',
    mr: 'सर्व वाचल्या म्हणून चिन्हांकित करा',
  },
  no_active_alerts: {
    en: 'No active alerts right now',
    hi: 'वर्तमान में कोई नई सूचना नहीं है',
    mr: 'सध्या कोणत्याही सक्रिय सूचना नाहीत',
  },

  // Dashboard Overview
  dashboard_title: {
    en: 'Financial Overview',
    hi: 'वित्तीय समीक्षा',
    mr: 'आर्थिक आढावा',
  },
  dashboard_subtitle: {
    en: 'Track, optimize, and grow your wealth with intelligent insights',
    hi: 'बुद्धिमान विश्लेषण के साथ अपने धन को ट्रैक, नियंत्रित और बढ़ाएं',
    mr: 'हुशार विश्लेषणासह तुमची संपत्ती ट्रॅक, नियंत्रित आणि वाढवा',
  },
  record_transaction: {
    en: 'Record Transaction',
    hi: 'लेन-देन दर्ज करें',
    mr: 'व्यवहार नोंदवा',
  },
  quick_add_desc: {
    en: 'Tap to log expense, income, savings goal or budget limit',
    hi: 'खर्च, आय, बचत लक्ष्य या बजट सीमा दर्ज करने के लिए टैप करें',
    mr: 'खर्च, उत्पन्न, बचत ध्येय किंवा बजेट मर्यादा नोंदवण्यासाठी टॅप करा',
  },
  tap_to_add: {
    en: 'Quick Add',
    hi: 'त्वरित जोड़ें',
    mr: 'त्वरित जोडा',
  },
  total_net_balance: {
    en: 'Total Net Balance',
    hi: 'कुल नेट बैलेंस',
    mr: 'एकूण निव्वळ शिल्लक',
  },
  monthly_income: {
    en: 'Monthly Income',
    hi: 'मासिक आय',
    mr: 'मासिक उत्पन्न',
  },
  monthly_expenses: {
    en: 'Monthly Expenses',
    hi: 'मासिक खर्च',
    mr: 'मासिक खर्च',
  },
  net_savings: {
    en: 'Net Savings',
    hi: 'शुद्ध बचत',
    mr: 'निव्वळ बचत',
  },
  savings_rate: {
    en: 'Savings Rate',
    hi: 'बचत दर',
    mr: 'बचत दर',
  },
  active_streak: {
    en: 'Active streak',
    hi: 'सक्रिय स्ट्रीक',
    mr: 'सक्रिय स्ट्रीक',
  },
  days: {
    en: 'days',
    hi: 'दिन',
    mr: 'दिवस',
  },
  safe_to_spend: {
    en: 'Safe to Spend',
    hi: 'सुरक्षित खर्च',
    mr: 'सुरक्षित खर्च',
  },
  daily_limit: {
    en: 'Daily Limit',
    hi: 'दैनिक सीमा',
    mr: 'दैनिक मर्यादा',
  },
  recent_transactions: {
    en: 'Recent Transactions',
    hi: 'हाल के लेन-देन',
    mr: 'अलीकडील व्यवहार',
  },
  view_all: {
    en: 'View All',
    hi: 'सभी देखें',
    mr: 'सर्व पहा',
  },
  spending_heatmap: {
    en: 'Spending Heatmap',
    hi: 'खर्च तीव्रता हीटमॅप',
    mr: 'खर्च तीव्रता हीटमॅप',
  },
  smart_insights: {
    en: 'Smart Insights',
    hi: 'स्मार्ट अंतर्दृष्टि',
    mr: 'स्मार्ट अंतर्दृष्टी',
  },
  financial_health_score: {
    en: 'Financial Health Score',
    hi: 'वित्तीय स्वास्थ्य स्कोर',
    mr: 'आर्थिक आरोग्य गुण',
  },
  active_subscriptions: {
    en: 'Active Subscriptions',
    hi: 'सक्रिय सदस्यता',
    mr: 'सक्रिय वर्गणी',
  },
  savings_milestones: {
    en: 'Savings Milestones',
    hi: 'बचत लक्ष्य प्रगती',
    mr: 'बचत ध्येय प्रगती',
  },
  welcome_back: {
    en: 'Welcome back',
    hi: 'स्वागत है',
    mr: 'पुन्हा स्वागत आहे',
  },
  tagline: {
    en: 'Understand your money. Control your future.',
    hi: 'अपने पैसे को समझें। अपने भविष्य को नियंत्रित करें।',
    mr: 'तुमचे पैसे समजून घ्या. तुमचे भविष्य नियंत्रित करा.',
  },
  command_center: {
    en: 'Personal Command Center',
    hi: 'व्यक्तिगत नियंत्रण केंद्र',
    mr: 'वैयक्तिक नियंत्रण केंद्र',
  },
  cumulative_net: {
    en: 'Cumulative Net',
    hi: 'संचयी नेट',
    mr: 'संचयी निव्वळ',
  },
  current_inflow: {
    en: 'Current Inflow',
    hi: 'चालू आवक',
    mr: 'चालू आवक',
  },
  expenses_logged: {
    en: 'Expenses Logged',
    hi: 'दर्ज खर्च',
    mr: 'नोंदवलेले खर्च',
  },
  this_month: {
    en: 'This Month',
    hi: 'इस महीने',
    mr: 'या महिन्यात',
  },
  monthly_budget: {
    en: 'Monthly Budget',
    hi: 'मासिक बजट',
    mr: 'मासिक बजेट',
  },
  allocated: {
    en: 'Allocated',
    hi: 'आवंटित',
    mr: 'वाटप केलेले',
  },
  budget_buffer: {
    en: 'Budget Buffer',
    hi: 'बजट बफर',
    mr: 'बजेट बफर',
  },
  left_to_spend: {
    en: 'Left to Spend',
    hi: 'खर्च के लिए शेष',
    mr: 'खर्च करण्यासाठी शिल्लक',
  },
  recent_transaction_stream: {
    en: 'Recent Transaction Stream',
    hi: 'हालिया लेन-देन प्रवाह',
    mr: 'अलीकडील व्यवहार प्रवाह',
  },
  latest_cash_inflows: {
    en: 'Latest cash inflows and payments',
    hi: 'नवीनतम आवक और भुगतान',
    mr: 'नवीनतम आवक आणि देयके',
  },
  monthly_budget_pacing: {
    en: 'Monthly Budget Pacing',
    hi: 'मासिक बजट स्थिति',
    mr: 'मासिक बजेट स्थिती',
  },
  guardrails_categories: {
    en: 'Guardrails across key expense categories',
    hi: 'प्रमुख श्रेणियों पर सीमा नियंत्रण',
    mr: 'प्रमुख श्रेणींवर नियंत्रण मर्यादा',
  },
  manage: {
    en: 'Manage',
    hi: 'प्रबंधन',
    mr: 'व्यवस्थापन',
  },
  active_priority_goal: {
    en: 'Active Priority Goal',
    hi: 'सक्रिय प्राथमिकता लक्ष्य',
    mr: 'सक्रिय प्राधान्य ध्येय',
  },
  view_goals: {
    en: 'View Goals',
    hi: 'लक्ष्य देखें',
    mr: 'ध्येये पहा',
  },
  no_transactions_yet: {
    en: 'No transactions yet',
    hi: 'अभी कोई लेन-देन नहीं है',
    mr: 'अद्याप कोणतेही व्यवहार नाहीत',
  },

  // Speed Dial Quick Actions
  action_log_expense: {
    en: 'Log Expense',
    hi: 'खर्च दर्ज करें',
    mr: 'खर्च नोंदवा',
  },
  action_record_income: {
    en: 'Record Income',
    hi: 'आय दर्ज करें',
    mr: 'उत्पन्न नोंदवा',
  },
  action_add_goal: {
    en: 'Add Savings Goal',
    hi: 'बचत लक्ष्य जोड़ें',
    mr: 'बचत ध्येय जोडा',
  },
  action_set_budget: {
    en: 'Set Budget Limit',
    hi: 'बजट सीमा तय करें',
    mr: 'बजेट मर्यादा ठरवा',
  },

  // Modal Fields & Common Form Controls
  title_label: {
    en: 'Title / Description',
    hi: 'शीर्षक / विवरण',
    mr: 'शीर्षक / तपशील',
  },
  amount_label: {
    en: 'Amount',
    hi: 'रकम',
    mr: 'रक्कम',
  },
  category_label: {
    en: 'Category',
    hi: 'श्रेणी',
    mr: 'वर्गवारी',
  },
  payment_method_label: {
    en: 'Payment Method',
    hi: 'भुगतान विधि',
    mr: 'पेमेंट पद्धत',
  },
  date_label: {
    en: 'Date',
    hi: 'तारीख',
    mr: 'तारीख',
  },
  save: {
    en: 'Save',
    hi: 'सुरक्षित करें',
    mr: 'जतन करा',
  },
  cancel: {
    en: 'Cancel',
    hi: 'रद्द करें',
    mr: 'रद्द करा',
  },
  delete: {
    en: 'Delete',
    hi: 'हटाएं',
    mr: 'हटवा',
  },
  edit: {
    en: 'Edit',
    hi: 'संपादित करें',
    mr: 'संपादित करा',
  },
  search_placeholder: {
    en: 'Search transactions...',
    hi: 'लेन-देन खोजें...',
    mr: 'व्यवहार शोधा...',
  },
  filter_all: {
    en: 'All',
    hi: 'सभी',
    mr: 'सर्व',
  },
  filter_expenses: {
    en: 'Expenses',
    hi: 'खर्च',
    mr: 'खर्च',
  },
  filter_income: {
    en: 'Income',
    hi: 'आय',
    mr: 'उत्पन्न',
  },
  no_transactions_found: {
    en: 'No transactions found',
    hi: 'कोई लेन-देन नहीं मिला',
    mr: 'कोणतेही व्यवहार आढळले नाहीत',
  },

  // Settings
  settings_title: {
    en: 'System Settings & Preferences',
    hi: 'सिस्टम सेटिंग्स और प्राथमिकताएं',
    mr: 'प्रणाली सेटिंग्ज आणि प्राधान्ये',
  },
  settings_subtitle: {
    en: 'Manage language, currency, display theme, and local backups',
    hi: 'भाषा, मुद्रा, डिस्प्ले थीम और लोकल बैकअप प्रबंधित करें',
    mr: 'भाषा, चलन, डिस्प्ले थीम आणि स्थानिक बॅकअप व्यवस्थापित करा',
  },
  profile_and_currency: {
    en: 'User Profile & Currency',
    hi: 'उपयोगकर्ता प्रोफ़ाइल और मुद्रा',
    mr: 'वापरकर्ता प्रोफाइल आणि चलन',
  },
  display_name: {
    en: 'Your Name',
    hi: 'आपका नाम',
    mr: 'तुमचे नाव',
  },
  monthly_target_income: {
    en: 'Expected Monthly Income',
    hi: 'अपेक्षित मासिक आय',
    mr: 'अपेक्षित मासिक उत्पन्न',
  },
  currency: {
    en: 'Preferred Currency',
    hi: 'पसंदीदा मुद्रा',
    mr: 'पसंतीचे चलन',
  },
  appearance_theme: {
    en: 'Appearance & Theme',
    hi: 'दिखावट और थीम',
    mr: 'दिसणे आणि थीम',
  },
  theme_light: {
    en: 'Light Mode',
    hi: 'लाइट मोड',
    mr: 'लाइट मोड',
  },
  theme_dark: {
    en: 'Dark Mode',
    hi: 'डार्क मोड',
    mr: 'डार्क मोड',
  },
  language_section: {
    en: 'Application Language',
    hi: 'एप्लिकेशन भाषा',
    mr: 'अॅपची भाषा',
  },
  language_desc: {
    en: 'Choose your preferred language for navigating the app (English, Hindi, Marathi)',
    hi: 'ऐप में उपयोग के लिए अपनी पसंदीदा भाषा चुनें (English, हिंदी, मराठी)',
    mr: 'अॅप वापरण्यासाठी तुमची पसंतीची भाषा निवडा (English, हिंदी, मराठी)',
  },
  data_management: {
    en: 'Data Management & Backups',
    hi: 'डेटा प्रबंधन और बैकअप',
    mr: 'डेटा व्यवस्थापन आणि बॅकअप',
  },
  export_data: {
    en: 'Export JSON Backup',
    hi: 'JSON बैकअप निर्यात करें',
    mr: 'JSON बॅकअप निर्यात करा',
  },
  import_data: {
    en: 'Import JSON Backup',
    hi: 'JSON बैकअप आयात करें',
    mr: 'JSON बॅकअप आयात करा',
  },
  reset_demo: {
    en: 'Reset to Demo Data',
    hi: 'डेमो डेटा रीसेट करें',
    mr: 'डेमो डेटा रीसेट करा',
  },
  clear_data: {
    en: 'Clear All Data',
    hi: 'सभी डेटा साफ़ करें',
    mr: 'सर्व डेटा साफ करा',
  },
  saved_successfully: {
    en: 'Settings saved successfully!',
    hi: 'सेटिंग्स सफलतापूर्वक सहेजी गईं!',
    mr: 'सेटिंग्ज यशस्वीरित्या जतन केल्या!',
  },

  // Categories translation
  cat_food: {
    en: 'Food & Dining',
    hi: 'खान-पान व भोजन',
    mr: 'अन्न व खाणे',
  },
  cat_travel: {
    en: 'Travel & Transport',
    hi: 'यात्रा व परिवहन',
    mr: 'प्रवास व वाहतूक',
  },
  cat_shopping: {
    en: 'Shopping',
    hi: 'खरीदारी',
    mr: 'खरेदी',
  },
  cat_education: {
    en: 'Education',
    hi: 'शिक्षा व अभ्यास',
    mr: 'शिक्षण व अभ्यास',
  },
  cat_bills: {
    en: 'Bills & Utilities',
    hi: 'बिल व उपयोगिता',
    mr: 'बिले व सेवा',
  },
  cat_entertainment: {
    en: 'Entertainment',
    hi: 'मनोरंजन',
    mr: 'मनोरंजन',
  },
  cat_healthcare: {
    en: 'Healthcare',
    hi: 'स्वास्थ्य व दवाएं',
    mr: 'आरोग्य व औषधे',
  },
  cat_rent: {
    en: 'Rent & Housing',
    hi: 'किराया व आवास',
    mr: 'घरभाडे व निवास',
  },
  cat_subscriptions: {
    en: 'Subscriptions',
    hi: 'सदस्यता',
    mr: 'वर्गणी / सदस्यता',
  },
  cat_other: {
    en: 'Other Expenses',
    hi: 'अन्य खर्च',
    mr: 'इतर खर्च',
  },

  // Income Sources
  cat_salary: {
    en: 'Salary & Stipend',
    hi: 'वेतन व स्टाइपेंड',
    mr: 'पगार व मानधन',
  },
  cat_pocket_money: {
    en: 'Pocket Money',
    hi: 'पॉकेट मनी',
    mr: 'पॉकेट मनी',
  },
  cat_freelance: {
    en: 'Freelance & Projects',
    hi: 'फ्रीलांस व प्रोजेक्ट्स',
    mr: 'फ्रीलान्स व प्रकल्प',
  },
  cat_scholarship: {
    en: 'Scholarship',
    hi: 'छात्रवृत्ति',
    mr: 'शिष्यवृत्ती',
  },
  cat_business: {
    en: 'Business & Ventures',
    hi: 'व्यापार व व्यवसाय',
    mr: 'व्यवसाय व नफा',
  },

  // Payment Methods
  pm_cash: {
    en: 'Cash',
    hi: 'नकद',
    mr: 'रोख',
  },
  pm_upi: {
    en: 'UPI (GPay / PhonePe / Paytm)',
    hi: 'यूपीआई (UPI)',
    mr: 'यूपीआय (UPI)',
  },
  pm_debit_card: {
    en: 'Debit Card',
    hi: 'डेबिट कार्ड',
    mr: 'डेबिट कार्ड',
  },
  pm_credit_card: {
    en: 'Credit Card',
    hi: 'क्रेडिट कार्ड',
    mr: 'क्रेडिट कार्ड',
  },
  pm_bank_transfer: {
    en: 'Net Banking / Transfer',
    hi: 'नेट बैंकिंग / ट्रांसफर',
    mr: 'नेट बँकिंग / ट्रान्सफर',
  },

  // Daily Budget & Health Cards & Timeline
  daily_budget_tracker: {
    en: 'Daily Budget Tracker',
    hi: 'दैनिक बजट ट्रैकर',
    mr: 'दैनिक बजेट ट्रॅकर',
  },
  todays_pacing_limit: {
    en: "Today's Pacing Limit",
    hi: 'आज की खर्च सीमा',
    mr: 'आजची खर्च मर्यादा',
  },
  over_budget: {
    en: 'Over Budget',
    hi: 'बजट से अधिक',
    mr: 'बजेटपेक्षा जास्त',
  },
  close_to_limit: {
    en: 'Close to Limit',
    hi: 'सीमा के करीब',
    mr: 'मर्यादेच्या जवळ',
  },
  normal_status: {
    en: 'Normal',
    hi: 'सामान्य',
    mr: 'सामान्य',
  },
  todays_spent: {
    en: "Today's Spent",
    hi: 'आज का खर्च',
    mr: 'आजचा खर्च',
  },
  remaining_label: {
    en: 'Remaining',
    hi: 'शेष',
    mr: 'शिल्लक',
  },
  spent_label: {
    en: 'spent',
    hi: 'खर्च',
    mr: 'खर्च',
  },
  recorded_today: {
    en: 'recorded today',
    hi: 'आज दर्ज किए गए',
    mr: 'आज नोंदवले',
  },
  savings_rate_pill: {
    en: 'Savings Rate',
    hi: 'बचत दर',
    mr: 'बचत दर',
  },
  budget_discipline_pill: {
    en: 'Budget Disc.',
    hi: 'बजट अनुशासन',
    mr: 'बजेट शिस्त',
  },
  view_breakdown: {
    en: 'View detailed breakdown',
    hi: 'विस्तृत विवरण देखें',
    mr: 'तपशीलवार माहिती पहा',
  },
  search_transactions_placeholder: {
    en: 'Search by transaction name, category, or amount...',
    hi: 'नाम, श्रेणी या राशि द्वारा खोजें...',
    mr: 'नाव, प्रवर्ग किंवा रक्कमेनुसार शोधा...',
  },
  export_csv: {
    en: 'Export CSV',
    hi: 'CSV निर्यात',
    mr: 'CSV निर्यात',
  },
  all_categories: {
    en: 'All Categories',
    hi: 'सभी श्रेणियां',
    mr: 'सर्व प्रवर्ग',
  },
  all_payment_methods: {
    en: 'All Payment Methods',
    hi: 'सभी भुगतान विधियां',
    mr: 'सर्व पेमेंट पद्धती',
  },
  sort_newest: {
    en: 'Sort: Newest First',
    hi: 'क्रम: नवीनतम पहले',
    mr: 'क्रमवारी: नवीन प्रथम',
  },
  sort_oldest: {
    en: 'Sort: Oldest First',
    hi: 'क्रम: सबसे पुराना पहले',
    mr: 'क्रमवारी: जुने प्रथम',
  },
  sort_highest: {
    en: 'Sort: Highest Amount',
    hi: 'क्रम: सबसे अधिक राशि',
    mr: 'क्रमवारी: सर्वाधिक रक्कम',
  },
  sort_lowest: {
    en: 'Sort: Lowest Amount',
    hi: 'क्रम: सबसे कम राशि',
    mr: 'क्रमवारी: सर्वात कमी रक्कम',
  },
  budget_adherence_summary: {
    en: 'Budget Adherence Summary',
    hi: 'बजट अनुपालन सारांश',
    mr: 'बजेट पालन सारांश',
  },
  table_col_category: {
    en: 'Category',
    hi: 'श्रेणी',
    mr: 'प्रवर्ग',
  },
  table_col_budget_limit: {
    en: 'Budget Limit',
    hi: 'बजट सीमा',
    mr: 'बजेट मर्यादा',
  },
  table_col_actual_spent: {
    en: 'Actual Spent',
    hi: 'वास्तविक खर्च',
    mr: 'प्रत्यक्ष खर्च',
  },
  table_col_status: {
    en: 'Status',
    hi: 'स्थिति',
    mr: 'स्थिती',
  },
  status_within_target: {
    en: 'Within Target',
    hi: 'लक्ष्य के भीतर',
    mr: 'मर्यादेत',
  },
  status_exceeded: {
    en: 'Exceeded',
    hi: 'सीमा पार',
    mr: 'मर्यादा ओलांडली',
  },
  overall_label: {
    en: 'Overall',
    hi: 'कुल',
    mr: 'एकूण',
  },
  monthly_executive_statement: {
    en: 'Monthly Executive Statement',
    hi: 'मासिक वित्तीय विवरण',
    mr: 'मासिक आर्थिक अहवाल',
  },
  monthly_statement_desc: {
    en: 'Official monthly audit report, balance summary & budget metrics',
    hi: 'आधिकारिक मासिक ऑडिट रिपोर्ट, शेष राशि सारांश और बजट मेट्रिक्स',
    mr: 'अधिकृत मासिक ऑडिट अहवाल, शिल्लक सारांश आणि बजेट मेट्रिक्स',
  },
  print_save_pdf: {
    en: 'Print / Save PDF',
    hi: 'प्रिंट / पीडीएफ सहेजें',
    mr: 'प्रिंट / पीडीएफ सेव्ह करा',
  },
  executive_summary_title: {
    en: 'Executive Summary',
    hi: 'कार्यकारी सारांश',
    mr: 'कार्यकारी सारांश',
  },
  total_inflow: {
    en: 'Total Inflow',
    hi: 'कुल आमदनी',
    mr: 'एकूण जमा',
  },
  total_outflow: {
    en: 'Total Outflow',
    hi: 'कुल खर्च',
    mr: 'एकूण खर्च',
  },
  top_expense_drivers: {
    en: 'Top Expense Drivers',
    hi: 'शीर्ष खर्च श्रेणियां',
    mr: 'सर्वाधिक खर्चाचे प्रवर्ग',
  },
  safe_pace: {
    en: 'Safe Pace',
    hi: 'सुरक्षित गति',
    mr: 'सुरक्षित गती',
  },
  safe_status: {
    en: 'Safe',
    hi: 'सुरक्षित',
    mr: 'सुरक्षित',
  },
  near_limit: {
    en: 'Near Limit',
    hi: 'सीमा के पास',
    mr: 'मर्यादेजवळ',
  },
  auth_modal_title: {
    en: 'Welcome to Spendly',
    hi: 'स्पेंडली में आपका स्वागत है',
    mr: 'स्पेंडली मध्ये आपले स्वागत आहे',
  },
  auth_modal_subtitle: {
    en: 'Sign in to sync your expenses, budgets, and goals securely to cloud',
    hi: 'अपने खर्च, बजट और लक्ष्यों को क्लाउड पर सुरक्षित सिंक करने के लिए साइन इन करें',
    mr: 'तुमचे खर्च, बजेट आणि उद्दिष्टे सुरक्षितपणे क्लाउडवर सिंक करण्यासाठी साइन इन करा',
  },
  continue_with_google: {
    en: 'Continue with Google',
    hi: 'Google के साथ जारी रखें',
    mr: 'Google सह सुरू ठेवा',
  },
  or_continue_with_phone: {
    en: 'Or sign in with Phone Number',
    hi: 'या फोन नंबर के साथ साइन इन करें',
    mr: 'किंवा फोन नंबरसह साइन इन करा',
  },
  phone_number_label: {
    en: 'Phone Number',
    hi: 'फोन नंबर',
    mr: 'फोन नंबर',
  },
  phone_placeholder: {
    en: 'Enter 10-digit number',
    hi: '10 अंकों का नंबर दर्ज करें',
    mr: '10 अंकी नंबर टाका',
  },
  send_otp: {
    en: 'Send OTP',
    hi: 'ओटीपी भेजें',
    mr: 'ओटीपी पाठवा',
  },
  enter_otp: {
    en: 'Enter 6-digit OTP Code',
    hi: '6 अंकों का ओटीपी कोड दर्ज करें',
    mr: '6 अंकी ओटीपी कोड टाका',
  },
  verify_and_login: {
    en: 'Verify & Sign In',
    hi: 'सत्यापित करें और साइन इन करें',
    mr: 'पडताळणी करा आणि साइन इन करा',
  },
  resend_otp: {
    en: 'Resend OTP',
    hi: 'ओटीपी पुनः भेजें',
    mr: 'ओटीपी पुन्हा पाठवा',
  },
  change_number: {
    en: 'Change Number',
    hi: 'नंबर बदलें',
    mr: 'नंबर बदला',
  },
  login_signup: {
    en: 'Sign In / Register',
    hi: 'साइन इन / रजिस्टर',
    mr: 'साइन इन / नोंदणी',
  },
  logged_in_as: {
    en: 'Logged in as',
    hi: 'लॉग इन किया गया',
    mr: 'लॉग इन केलेले खाते',
  },
  logout: {
    en: 'Log Out',
    hi: 'लॉग आउट',
    mr: 'लॉग आउट',
  },
  cloud_synced: {
    en: 'Cloud Synced',
    hi: 'क्लाउड सिंक सुरक्षित',
    mr: 'क्लाउड सिंक सुरक्षित',
  },
  auth_phone_disclaimer: {
    en: 'A 6-digit SMS verification code will be sent to your mobile number.',
    hi: 'आपके मोबाइल नंबर पर 6 अंकों का एसएमएस सत्यापन कोड भेजा जाएगा।',
    mr: 'तुमच्या मोबाईल क्रमांकावर 6 अंकी SMS पडताळणी कोड पाठवला जाईल.',
  },
  quick_currency_action: {
    en: 'Alternative Currencies',
    hi: 'वैकल्पिक मुद्राएँ',
    mr: 'पर्यायी चलने',
  },
  quick_currency_switcher: {
    en: 'Display Currency',
    hi: 'प्रदर्शन मुद्रा',
    mr: 'प्रदर्शन चलन',
  },
  display_in_currency: {
    en: 'Display in',
    hi: 'में दिखाएं',
    mr: 'मध्ये दाखवा',
  },
  view_alt_currencies: {
    en: 'View in Alternative Currencies',
    hi: 'वैकल्पिक मुद्राओं में देखें',
    mr: 'पर्यायी चलनांमध्ये पहा',
  },
  exchange_rate: {
    en: 'Exchange Rate',
    hi: 'विनिमय दर',
    mr: 'विनिमय दर',
  },
  base_currency: {
    en: 'Base Currency',
    hi: 'मूल मुद्रा',
    mr: 'मूळ चलन',
  },
  converted_preview: {
    en: 'Alternative Currency View',
    hi: 'वैकल्पिक मुद्रा दृश्य',
    mr: 'पर्यायी चलन दृश्य',
  },
  reset_to_base: {
    en: 'Reset to Base Currency',
    hi: 'मूल मुद्रा पर रीसेट करें',
    mr: 'मूळ चलनावर रीसेट करा',
  },
  quick_currency_desc: {
    en: 'Real-time multi-currency balance conversion for international users',
    hi: 'अंतर्राष्ट्रीय उपयोगकर्ताओं के लिए वास्तविक समय बहु-मुद्रा शेष रूपांतरण',
    mr: 'आंतरराष्ट्रीय वापरकर्त्यांसाठी रिअल-टाइम बहु-चलन शिल्लक रूपांतरण',
  },
  all_currencies: {
    en: 'All Currencies',
    hi: 'सभी मुद्राएँ',
    mr: 'सर्व चलने',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS;

export function t(key: TranslationKey, lang: Language = 'en'): string {
  const entry = TRANSLATIONS[key];
  if (!entry) return key;
  return entry[lang] || entry.en || key;
}

export function translateCategory(category: string, lang: Language = 'en'): string {
  const catKeyMap: Record<string, TranslationKey> = {
    Food: 'cat_food',
    Travel: 'cat_travel',
    Shopping: 'cat_shopping',
    Education: 'cat_education',
    Bills: 'cat_bills',
    Entertainment: 'cat_entertainment',
    Healthcare: 'cat_healthcare',
    Rent: 'cat_rent',
    Subscriptions: 'cat_subscriptions',
    Other: 'cat_other',
    Salary: 'cat_salary',
    'Pocket Money': 'cat_pocket_money',
    Freelance: 'cat_freelance',
    Scholarship: 'cat_scholarship',
    Business: 'cat_business',
  };

  const key = catKeyMap[category];
  if (key) {
    return t(key, lang);
  }
  return category;
}

export function translatePaymentMethod(method: string, lang: Language = 'en'): string {
  const methodMap: Record<string, TranslationKey> = {
    Cash: 'pm_cash',
    UPI: 'pm_upi',
    'Debit Card': 'pm_debit_card',
    'Credit Card': 'pm_credit_card',
    'Bank Transfer': 'pm_bank_transfer',
  };

  const key = methodMap[method];
  if (key) {
    return t(key, lang);
  }
  return method;
}
