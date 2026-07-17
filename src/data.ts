import { ETF, HistoryEntry } from './types';

export function checkRules(etf: ETF) {
  const { rules, currentData } = etf;
  const results = {
    // Rule passed if we have a discount and it is deeper (more negative) than or equal to the target threshold
    ntaDiscount: currentData.premiumDiscount !== null && currentData.premiumDiscount <= -rules.ntaDiscount,
    expenseRatio: currentData.expenseRatio !== null && currentData.expenseRatio <= rules.expenseRatio,
    fundSize: currentData.fundSize !== null && currentData.fundSize >= rules.fundSize,
    yield: currentData.yield !== null && currentData.yield >= rules.yield,
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  return { results, passed, total };
}

export function getDefaultWatchlist(): ETF[] {
  const todayStr = new Date().toLocaleDateString() + ' 09:30 AM';
  return [
    {
      ticker: 'VAS',
      name: 'Vanguard Australian Shares Index ETF',
      domicile: 'Australia',
      rules: { ntaDiscount: 0.5, expenseRatio: 0.15, fundSize: 200, yield: 3.5 },
      currentData: { 
        price: 95.50, 
        nta: 96.10, 
        premiumDiscount: -0.62, 
        pe: 16.2, 
        yield: 3.8, 
        expenseRatio: 0.10, 
        fundSize: 14200, 
        rsi: 48, 
        sma100Status: 'Bullish ↗',
        bidAskSpread: 0.03,
        distributionFreq: 'Quarterly',
        frankingCredits: 72,
        trackingError: 0.02,
        drpActive: true
      },
      lastUpdated: todayStr,
      purchasePrice: 91.20,
      sharesOwned: 150,
    },
    {
      ticker: 'A200',
      name: 'Betashares Australia 200 ETF',
      domicile: 'Australia',
      rules: { ntaDiscount: 0.3, expenseRatio: 0.08, fundSize: 100, yield: 3.5 },
      currentData: { 
        price: 128.40, 
        nta: 128.55, 
        premiumDiscount: -0.12, 
        pe: 16.0, 
        yield: 4.1, 
        expenseRatio: 0.07, 
        fundSize: 3200, 
        rsi: 45, 
        sma100Status: 'Bullish ↗',
        bidAskSpread: 0.04,
        distributionFreq: 'Quarterly',
        frankingCredits: 81,
        trackingError: 0.01,
        drpActive: true
      },
      lastUpdated: todayStr,
      purchasePrice: 130.50,
      sharesOwned: 80,
    },
    {
      ticker: 'VGS',
      name: 'Vanguard MSCI Index International Shares ETF',
      domicile: 'Australia',
      rules: { ntaDiscount: 0.2, expenseRatio: 0.20, fundSize: 500, yield: 1.5 },
      currentData: { 
        price: 119.30, 
        nta: 119.50, 
        premiumDiscount: -0.17, 
        pe: 20.3, 
        yield: 1.8, 
        expenseRatio: 0.18, 
        fundSize: 6800, 
        rsi: 58, 
        sma100Status: 'Bullish ↗',
        bidAskSpread: 0.05,
        distributionFreq: 'Quarterly',
        frankingCredits: 0,
        trackingError: 0.04,
        drpActive: true
      },
      lastUpdated: todayStr,
      purchasePrice: 110.00,
      sharesOwned: 100,
    },
    {
      ticker: 'NDQ',
      name: 'Betashares Nasdaq 100 ETF',
      domicile: 'Australia',
      rules: { ntaDiscount: 0.5, expenseRatio: 0.50, fundSize: 250, yield: 0.5 },
      currentData: { 
        price: 43.20, 
        nta: 43.10, 
        premiumDiscount: 0.23, 
        pe: 32.5, 
        yield: 0.6, 
        expenseRatio: 0.48, 
        fundSize: 4100, 
        rsi: 72, 
        sma100Status: 'Bullish ↗',
        bidAskSpread: 0.07,
        distributionFreq: 'Semi-Annually',
        frankingCredits: 0,
        trackingError: 0.05,
        drpActive: true
      },
      lastUpdated: todayStr,
      purchasePrice: null,
      sharesOwned: null,
    },
    {
      ticker: 'VTS',
      name: 'Vanguard U.S. Total Market Shares Index ETF',
      domicile: 'US',
      rules: { ntaDiscount: 0.5, expenseRatio: 0.10, fundSize: 100, yield: 1.0 },
      currentData: { 
        price: 345.20, 
        nta: 345.80, 
        premiumDiscount: -0.17, 
        pe: 24.1, 
        yield: 1.4, 
        expenseRatio: 0.03, 
        fundSize: 3900, 
        rsi: 61, 
        sma100Status: 'Bullish ↗',
        bidAskSpread: 0.11,
        distributionFreq: 'Quarterly',
        frankingCredits: 0,
        trackingError: 0.03,
        drpActive: false
      },
      lastUpdated: todayStr,
      purchasePrice: null,
      sharesOwned: null,
    },
    {
      ticker: 'DHHF',
      name: 'Betashares Diversified All Growth ETF',
      domicile: 'Australia',
      rules: { ntaDiscount: 0.3, expenseRatio: 0.25, fundSize: 100, yield: 2.0 },
      currentData: { 
        price: 33.80, 
        nta: 33.95, 
        premiumDiscount: -0.44, 
        pe: 17.5, 
        yield: 2.6, 
        expenseRatio: 0.19, 
        fundSize: 450, 
        rsi: 51, 
        sma100Status: 'Bullish ↗',
        bidAskSpread: 0.09,
        distributionFreq: 'Quarterly',
        frankingCredits: 16,
        trackingError: 0.08,
        drpActive: true
      },
      lastUpdated: todayStr,
      purchasePrice: 32.00,
      sharesOwned: 200,
    },
  ];
}

export function generateDefaultHistory(): HistoryEntry[] {
  const history: HistoryEntry[] = [];
  const tickers = ['VAS', 'A200', 'VGS', 'NDQ', 'VTS', 'DHHF'];
  const basePrices: Record<string, number> = { VAS: 95.50, A200: 128.40, VGS: 119.30, NDQ: 43.20, VTS: 345.20, DHHF: 33.80 };
  const baseNTAs: Record<string, number> = { VAS: 96.10, A200: 128.55, VGS: 119.50, NDQ: 43.10, VTS: 345.80, DHHF: 33.95 };

  const today = new Date();
  for (let i = 30; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    tickers.forEach(ticker => {
      const basePrice = basePrices[ticker];
      const baseNTA = baseNTAs[ticker];

      // Introduce natural-looking sinusoidal noise walks
      const angle = (30 - i) * 0.2;
      const priceWalk = basePrice * (1 + Math.sin(angle) * 0.03 + (Math.cos(angle * 1.5) * 0.01) + (i % 3 === 0 ? 0.005 : -0.005));
      const ntaWalk = baseNTA * (1 + Math.sin(angle * 0.9) * 0.025 + (Math.cos(angle * 1.3) * 0.008));
      const premiumDiscount = parseFloat((((priceWalk - ntaWalk) / ntaWalk) * 100).toFixed(2));

      history.push({
        date: dateStr,
        ticker,
        price: parseFloat(priceWalk.toFixed(2)),
        nta: parseFloat(ntaWalk.toFixed(2)),
        premiumDiscount,
      });
    });
  }
  return history;
}

export interface Holding {
  name: string;
  ticker: string;
  weight: number; // in percent, e.g. 10.2
}

export const ETF_HOLDINGS: Record<string, Holding[]> = {
  'VAS': [
    { name: 'BHP Group Ltd', ticker: 'BHP', weight: 10.2 },
    { name: 'Commonwealth Bank of Australia', ticker: 'CBA', weight: 8.5 },
    { name: 'CSL Ltd', ticker: 'CSL', weight: 6.1 },
    { name: 'National Australia Bank Ltd', ticker: 'NAB', weight: 4.8 },
    { name: 'Westpac Banking Corp', ticker: 'WBC', weight: 4.2 },
    { name: 'ANZ Group Holdings Ltd', ticker: 'ANZ', weight: 3.8 },
    { name: 'Macquarie Group Ltd', ticker: 'MQG', weight: 3.2 },
    { name: 'Wesfarmers Ltd', ticker: 'WES', weight: 2.8 },
    { name: 'Woodside Energy Group Ltd', ticker: 'WDS', weight: 2.4 },
    { name: 'Telstra Group Ltd', ticker: 'TLS', weight: 2.1 }
  ],
  'A200': [
    { name: 'BHP Group Ltd', ticker: 'BHP', weight: 10.1 },
    { name: 'Commonwealth Bank of Australia', ticker: 'CBA', weight: 8.4 },
    { name: 'CSL Ltd', ticker: 'CSL', weight: 6.0 },
    { name: 'National Australia Bank Ltd', ticker: 'NAB', weight: 4.7 },
    { name: 'Westpac Banking Corp', ticker: 'WBC', weight: 4.1 },
    { name: 'ANZ Group Holdings Ltd', ticker: 'ANZ', weight: 3.7 },
    { name: 'Macquarie Group Ltd', ticker: 'MQG', weight: 3.1 },
    { name: 'Wesfarmers Ltd', ticker: 'WES', weight: 2.7 },
    { name: 'Woodside Energy Group Ltd', ticker: 'WDS', weight: 2.3 },
    { name: 'Telstra Group Ltd', ticker: 'TLS', weight: 2.0 }
  ],
  'VGS': [
    { name: 'Microsoft Corp', ticker: 'MSFT', weight: 4.8 },
    { name: 'Apple Inc', ticker: 'AAPL', weight: 4.5 },
    { name: 'NVIDIA Corp', ticker: 'NVDA', weight: 3.9 },
    { name: 'Amazon.com Inc', ticker: 'AMZN', weight: 2.8 },
    { name: 'Meta Platforms Inc', ticker: 'META', weight: 1.8 },
    { name: 'Alphabet Inc', ticker: 'GOOGL', weight: 1.6 },
    { name: 'Eli Lilly & Co', ticker: 'LLY', weight: 1.4 },
    { name: 'Broadcom Inc', ticker: 'AVGO', weight: 1.2 },
    { name: 'Tesla Inc', ticker: 'TSLA', weight: 1.1 },
    { name: 'JPMorgan Chase & Co', ticker: 'JPM', weight: 1.0 }
  ],
  'NDQ': [
    { name: 'Microsoft Corp', ticker: 'MSFT', weight: 8.8 },
    { name: 'Apple Inc', ticker: 'AAPL', weight: 8.2 },
    { name: 'NVIDIA Corp', ticker: 'NVDA', weight: 7.5 },
    { name: 'Amazon.com Inc', ticker: 'AMZN', weight: 5.2 },
    { name: 'Meta Platforms Inc', ticker: 'META', weight: 4.8 },
    { name: 'Alphabet Inc', ticker: 'GOOGL', weight: 4.2 },
    { name: 'Broadcom Inc', ticker: 'AVGO', weight: 3.1 },
    { name: 'Tesla Inc', ticker: 'TSLA', weight: 2.8 },
    { name: 'Costco Wholesale Corp', ticker: 'COST', weight: 2.4 },
    { name: 'Netflix Inc', ticker: 'NFLX', weight: 2.0 }
  ],
  'VTS': [
    { name: 'Microsoft Corp', ticker: 'MSFT', weight: 5.8 },
    { name: 'Apple Inc', ticker: 'AAPL', weight: 5.4 },
    { name: 'NVIDIA Corp', ticker: 'NVDA', weight: 4.9 },
    { name: 'Amazon.com Inc', ticker: 'AMZN', weight: 3.2 },
    { name: 'Meta Platforms Inc', ticker: 'META', weight: 2.0 },
    { name: 'Alphabet Inc', ticker: 'GOOGL', weight: 1.8 },
    { name: 'Eli Lilly & Co', ticker: 'LLY', weight: 1.5 },
    { name: 'Broadcom Inc', ticker: 'AVGO', weight: 1.3 },
    { name: 'Tesla Inc', ticker: 'TSLA', weight: 1.2 },
    { name: 'JPMorgan Chase & Co', ticker: 'JPM', weight: 1.0 }
  ],
  'IVV': [
    { name: 'Microsoft Corp', ticker: 'MSFT', weight: 6.8 },
    { name: 'Apple Inc', ticker: 'AAPL', weight: 6.2 },
    { name: 'NVIDIA Corp', ticker: 'NVDA', weight: 5.9 },
    { name: 'Amazon.com Inc', ticker: 'AMZN', weight: 3.8 },
    { name: 'Meta Platforms Inc', ticker: 'META', weight: 2.5 },
    { name: 'Alphabet Inc', ticker: 'GOOGL', weight: 2.2 },
    { name: 'Eli Lilly & Co', ticker: 'LLY', weight: 1.8 },
    { name: 'Broadcom Inc', ticker: 'AVGO', weight: 1.5 },
    { name: 'Tesla Inc', ticker: 'TSLA', weight: 1.4 },
    { name: 'JPMorgan Chase & Co', ticker: 'JPM', weight: 1.3 }
  ],
  'DHHF': [
    { name: 'Microsoft Corp', ticker: 'MSFT', weight: 2.4 },
    { name: 'Apple Inc', ticker: 'AAPL', weight: 2.2 },
    { name: 'BHP Group Ltd', ticker: 'BHP', weight: 3.7 },
    { name: 'Commonwealth Bank of Australia', ticker: 'CBA', weight: 3.1 },
    { name: 'CSL Ltd', ticker: 'CSL', weight: 2.2 },
    { name: 'NVIDIA Corp', ticker: 'NVDA', weight: 2.0 },
    { name: 'National Australia Bank Ltd', ticker: 'NAB', weight: 1.7 },
    { name: 'Westpac Banking Corp', ticker: 'WBC', weight: 1.5 },
    { name: 'ANZ Group Holdings Ltd', ticker: 'ANZ', weight: 1.4 },
    { name: 'Amazon.com Inc', ticker: 'AMZN', weight: 1.3 }
  ],
  'VHY': [
    { name: 'Commonwealth Bank of Australia', ticker: 'CBA', weight: 10.5 },
    { name: 'BHP Group Ltd', ticker: 'BHP', weight: 9.8 },
    { name: 'National Australia Bank Ltd', ticker: 'NAB', weight: 8.2 },
    { name: 'Westpac Banking Corp', ticker: 'WBC', weight: 7.5 },
    { name: 'ANZ Group Holdings Ltd', ticker: 'ANZ', weight: 6.8 },
    { name: 'Woodside Energy Group Ltd', ticker: 'WDS', weight: 5.2 },
    { name: 'Telstra Group Ltd', ticker: 'TLS', weight: 4.5 },
    { name: 'Woolworths Group Ltd', ticker: 'WOW', weight: 3.8 },
    { name: 'Coles Group Ltd', ticker: 'COL', weight: 3.2 },
    { name: 'Wesfarmers Ltd', ticker: 'WES', weight: 3.0 }
  ],
  'VGE': [
    { name: 'Taiwan Semiconductor Manufacturing Co', ticker: 'TSMC', weight: 7.8 },
    { name: 'Tencent Holdings Ltd', ticker: 'Tencent', weight: 4.5 },
    { name: 'Alibaba Group Holding Ltd', ticker: 'Alibaba', weight: 3.2 },
    { name: 'Samsung Electronics Co Ltd', ticker: 'Samsung', weight: 3.0 },
    { name: 'Meituan', ticker: 'Meituan', weight: 1.8 },
    { name: 'Reliance Industries Ltd', ticker: 'Reliance', weight: 1.5 },
    { name: 'Infosys Ltd', ticker: 'Infosys', weight: 1.2 },
    { name: 'ICICI Bank Ltd', ticker: 'ICICI', weight: 1.1 },
    { name: 'PDD Holdings Inc', ticker: 'PDD', weight: 1.0 },
    { name: 'JD.com Inc', ticker: 'JD', weight: 0.8 }
  ]
};
