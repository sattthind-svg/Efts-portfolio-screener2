export interface ETFRules {
  ntaDiscount: number;       // Target discount in percent, e.g. 0.5 means 0.5% discount
  expenseRatio: number;      // Max expense ratio in percent, e.g. 0.3%
  fundSize: number;          // Min fund size in AUD Millions, e.g. 100M
  yield: number;             // Min dividend yield in percent, e.g. 2.5%
}

export interface ETFCurrentData {
  price: number | null;
  nta: number | null;
  premiumDiscount: number | null;
  pe: number | null;
  yield: number | null;
  expenseRatio: number | null;
  fundSize: number | null;   // in AUD Millions
  rsi?: number | null;
  sma100Status?: 'Bullish ↗' | 'Bearish ↘' | null;
  bidAskSpread?: number | null;       // in percent, e.g. 0.04 for 0.04%
  distributionFreq?: 'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Annually' | null;
  frankingCredits?: number | null;    // in percent, e.g. 75 for 75%
  trackingError?: number | null;      // in percent, e.g. 0.03 for 0.03%
  drpActive?: boolean | null;
}

export interface ETF {
  ticker: string;
  name: string;
  domicile: 'Australia' | 'US';
  rules: ETFRules;
  currentData: ETFCurrentData;
  lastUpdated: string | null;
  purchasePrice?: number | null;
  sharesOwned?: number | null;
  source?: string | null;
  scrapeLogs?: string[] | null;
}

export interface HistoryEntry {
  date: string;
  ticker: string;
  price: number;
  nta: number;
  premiumDiscount: number;
}
