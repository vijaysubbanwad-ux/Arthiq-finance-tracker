import { CurrencyCode, CurrencyMeta } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyMeta[] = [
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    locale: 'en-IN',
    decimals: 0,
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    locale: 'en-US',
    decimals: 2,
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺',
    locale: 'de-DE',
    decimals: 2,
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧',
    locale: 'en-GB',
    decimals: 2,
  },
  {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    flag: '🇦🇪',
    locale: 'ar-AE',
    decimals: 2,
  },
  {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    flag: '🇨🇦',
    locale: 'en-CA',
    decimals: 2,
  },
  {
    code: 'AUD',
    symbol: 'AU$',
    name: 'Australian Dollar',
    flag: '🇦🇺',
    locale: 'en-AU',
    decimals: 2,
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    flag: '🇯🇵',
    locale: 'ja-JP',
    decimals: 0,
  },
  {
    code: 'SGD',
    symbol: 'SG$',
    name: 'Singapore Dollar',
    flag: '🇸🇬',
    locale: 'en-SG',
    decimals: 2,
  },
  {
    code: 'CHF',
    symbol: 'CHF',
    name: 'Swiss Franc',
    flag: '🇨🇭',
    locale: 'de-CH',
    decimals: 2,
  },
  {
    code: 'SAR',
    symbol: '﷼',
    name: 'Saudi Riyal',
    flag: '🇸🇦',
    locale: 'ar-SA',
    decimals: 2,
  },
];

// Baseline benchmark exchange rates relative to 1 USD
export const BASELINE_USD_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  INR: 83.75, // 1 USD = 83.75 INR
  EUR: 0.92,  // 1 USD = 0.92 EUR
  GBP: 0.79,  // 1 USD = 0.79 GBP
  AED: 3.67,  // 1 USD = 3.67 AED
  CAD: 1.36,  // 1 USD = 1.36 CAD
  AUD: 1.51,  // 1 USD = 1.51 AUD
  JPY: 154.5, // 1 USD = 154.5 JPY
  SGD: 1.35,  // 1 USD = 1.35 SGD
  CHF: 0.89,  // 1 USD = 0.89 CHF
  SAR: 3.75,  // 1 USD = 3.75 SAR
};

const DISPLAY_CURRENCY_KEY = 'spendly_display_currency';
const CUSTOM_RATES_KEY = 'spendly_custom_fx_rates';

/**
 * Get the active exchange rate from `fromCurrency` to `toCurrency`
 */
export function getExchangeRate(
  fromCurrency: string = 'INR',
  toCurrency: string = 'USD'
): number {
  const fromCode = (fromCurrency.toUpperCase() in BASELINE_USD_RATES
    ? fromCurrency.toUpperCase()
    : 'INR') as CurrencyCode;
  const toCode = (toCurrency.toUpperCase() in BASELINE_USD_RATES
    ? toCurrency.toUpperCase()
    : 'USD') as CurrencyCode;

  if (fromCode === toCode) return 1.0;

  // Check custom rate overrides from local storage
  try {
    const custom = localStorage.getItem(CUSTOM_RATES_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      const pairKey = `${fromCode}_${toCode}`;
      if (typeof parsed[pairKey] === 'number' && parsed[pairKey] > 0) {
        return parsed[pairKey];
      }
    }
  } catch {
    // fallback to baseline
  }

  // Calculate cross rate via USD
  const fromRateToUSD = BASELINE_USD_RATES[fromCode]; // e.g. INR = 83.75 (1 USD = 83.75 INR)
  const toRateToUSD = BASELINE_USD_RATES[toCode];     // e.g. USD = 1.0, EUR = 0.92

  // 1 unit of fromCode in USD = 1 / fromRateToUSD
  // in toCode = (1 / fromRateToUSD) * toRateToUSD
  return toRateToUSD / fromRateToUSD;
}

/**
 * Convert an amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string = 'INR',
  toCurrency: string = 'USD'
): number {
  if (isNaN(amount) || amount === 0) return 0;
  const rate = getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

/**
 * Get currency metadata by code
 */
export function getCurrencyMeta(currencyCode: string = 'INR'): CurrencyMeta {
  const found = SUPPORTED_CURRENCIES.find(
    (c) => c.code.toLowerCase() === currencyCode.toLowerCase()
  );
  return (
    found || {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee',
      flag: '🇮🇳',
      locale: 'en-IN',
      decimals: 0,
    }
  );
}

/**
 * Formats an amount in a given currency code with appropriate localized decimal precision
 */
export function formatCurrencyInCode(
  amount: number,
  currencyCode: string = 'INR',
  options?: { compact?: boolean; hideSymbol?: boolean }
): string {
  const meta = getCurrencyMeta(currencyCode);
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (options?.compact) {
    if (meta.code === 'INR') {
      if (absAmount >= 100000) {
        return `${sign}${meta.symbol}${(absAmount / 100000).toFixed(1)}L`;
      }
      if (absAmount >= 1000) {
        return `${sign}${meta.symbol}${(absAmount / 1000).toFixed(1)}k`;
      }
    } else {
      if (absAmount >= 1000000) {
        return `${sign}${meta.symbol}${(absAmount / 1000000).toFixed(1)}M`;
      }
      if (absAmount >= 1000) {
        return `${sign}${meta.symbol}${(absAmount / 1000).toFixed(1)}k`;
      }
    }
  }

  // Determine decimals based on size and currency
  const decimals = meta.decimals;
  const formatted = absAmount.toLocaleString(meta.locale, {
    minimumFractionDigits: absAmount % 1 === 0 ? 0 : Math.min(2, decimals),
    maximumFractionDigits: decimals,
  });

  if (options?.hideSymbol) {
    return `${sign}${formatted}`;
  }

  return `${sign}${meta.symbol}${formatted}`;
}

/**
 * Formats an exchange rate relation string (e.g. "1 USD ≈ ₹83.75" or "1 INR ≈ $0.012")
 */
export function formatExchangeRateRelation(
  fromCurrency: string,
  toCurrency: string
): string {
  const fromMeta = getCurrencyMeta(fromCurrency);
  const toMeta = getCurrencyMeta(toCurrency);
  const rate = getExchangeRate(fromCurrency, toCurrency);

  const formattedRate = rate < 0.01 ? rate.toFixed(4) : rate < 1 ? rate.toFixed(3) : rate.toFixed(2);
  return `1 ${fromMeta.code} ≈ ${toMeta.symbol}${formattedRate} ${toMeta.code}`;
}

/**
 * Storage helpers for Quick Action Display Currency
 */
export function getSavedDisplayCurrency(): CurrencyCode | null {
  try {
    const saved = localStorage.getItem(DISPLAY_CURRENCY_KEY);
    if (saved && SUPPORTED_CURRENCIES.some((c) => c.code === saved)) {
      return saved as CurrencyCode;
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveDisplayCurrency(currencyCode: CurrencyCode | null): void {
  try {
    if (currencyCode) {
      localStorage.setItem(DISPLAY_CURRENCY_KEY, currencyCode);
    } else {
      localStorage.removeItem(DISPLAY_CURRENCY_KEY);
    }
  } catch {
    // ignore
  }
}
