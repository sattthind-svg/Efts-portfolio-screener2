export interface ScreenerHolding {
  name: string;
  ticker: string;
  weight: number; // e.g. 8.5 for 8.5%
}

export interface DistributionRecord {
  date: string;
  amount: number; // e.g. 0.85 per share
  franking?: number; // e.g. 70 for 70% franked (for AU)
}

export interface ChartPoint {
  date: string;
  value: number; // Normalized price/performance starting near 100
}

export interface ScreenerETF {
  ticker: string;
  name: string;
  category: string;
  assetClass: 'Equity' | 'Fixed Income' | 'Commodities' | 'Multi-Asset' | 'Thematic';
  domicile: 'Australia' | 'US';
  mer: number; // e.g. 0.03 for 0.03%
  yield: number; // e.g. 3.8 for 3.8%
  return1Y: number; // e.g. 11.2 for 11.2%
  return3Y: number; // e.g. 7.5
  return5Y: number; // e.g. 8.2
  stdDev: number; // standard deviation e.g. 13.8 for 13.8%
  sharpeRatio: number; // e.g. 0.65
  fundSize: number; // in AUD Millions, e.g. 14200
  peRatio: number | null; // e.g. 16.2
  holdings: ScreenerHolding[];
  distributions: DistributionRecord[];
  history1Y: ChartPoint[];
  history3Y: ChartPoint[];
  history5Y: ChartPoint[];
}

// Generates simulated historical returns for 1Y, 3Y, 5Y based on annualized return and volatility
function generateHistoryPoints(annualReturn: number, volatility: number, periods: number): ChartPoint[] {
  const points: ChartPoint[] = [];
  let currentValue = 100;
  const today = new Date();
  
  for (let i = periods; i >= 0; i--) {
    const d = new Date(today);
    // subtract months
    d.setMonth(today.getMonth() - i);
    const dateStr = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
    
    // Monthly growth factor with a bit of random walk
    const trend = annualReturn / 12 / 100;
    const noise = (Math.sin(i * 0.5) * 0.4 + Math.cos(i * 1.1) * 0.3) * (volatility / 100);
    const growth = 1 + trend + noise;
    currentValue = currentValue * growth;
    
    points.push({
      date: dateStr,
      value: parseFloat(currentValue.toFixed(2))
    });
  }
  return points;
}

export const SCREENER_ETFS: ScreenerETF[] = [
  {
    ticker: 'IVV',
    name: 'iShares S&P 500 ETF',
    category: 'US Large Blend',
    assetClass: 'Equity',
    domicile: 'US',
    mer: 0.03,
    yield: 1.35,
    return1Y: 24.5,
    return3Y: 12.2,
    return5Y: 14.8,
    stdDev: 12.5,
    sharpeRatio: 1.10,
    fundSize: 6850,
    peRatio: 22.4,
    holdings: [
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
    distributions: [
      { date: '2026-06-30', amount: 0.92 },
      { date: '2026-03-31', amount: 0.88 },
      { date: '2025-12-31', amount: 0.95 },
      { date: '2025-09-30', amount: 0.81 }
    ],
    history1Y: generateHistoryPoints(24.5, 12.5, 12),
    history3Y: generateHistoryPoints(12.2, 13.0, 36),
    history5Y: generateHistoryPoints(14.8, 14.2, 60)
  },
  {
    ticker: 'VAS',
    name: 'Vanguard Australian Shares Index ETF',
    category: 'Australia Large Blend',
    assetClass: 'Equity',
    domicile: 'Australia',
    mer: 0.10,
    yield: 3.85,
    return1Y: 11.2,
    return3Y: 7.5,
    return5Y: 8.2,
    stdDev: 13.8,
    sharpeRatio: 0.65,
    fundSize: 14200,
    peRatio: 16.2,
    holdings: [
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
    distributions: [
      { date: '2026-07-01', amount: 1.12, franking: 75 },
      { date: '2026-04-01', amount: 0.85, franking: 78 },
      { date: '2026-01-02', amount: 0.98, franking: 71 },
      { date: '2025-10-01', amount: 0.72, franking: 83 }
    ],
    history1Y: generateHistoryPoints(11.2, 13.8, 12),
    history3Y: generateHistoryPoints(7.5, 14.0, 36),
    history5Y: generateHistoryPoints(8.2, 14.5, 60)
  },
  {
    ticker: 'A200',
    name: 'Betashares Australia 200 ETF',
    category: 'Australia Large Blend',
    assetClass: 'Equity',
    domicile: 'Australia',
    mer: 0.07,
    yield: 4.10,
    return1Y: 11.4,
    return3Y: 7.6,
    return5Y: 8.3,
    stdDev: 13.7,
    sharpeRatio: 0.66,
    fundSize: 3200,
    peRatio: 16.0,
    holdings: [
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
    distributions: [
      { date: '2026-07-01', amount: 1.34, franking: 81 },
      { date: '2026-04-01', amount: 1.02, franking: 85 },
      { date: '2026-01-02', amount: 1.15, franking: 80 },
      { date: '2025-10-01', amount: 0.89, franking: 84 }
    ],
    history1Y: generateHistoryPoints(11.4, 13.7, 12),
    history3Y: generateHistoryPoints(7.6, 13.9, 36),
    history5Y: generateHistoryPoints(8.3, 14.4, 60)
  },
  {
    ticker: 'VGS',
    name: 'Vanguard MSCI Index International Shares ETF',
    category: 'Global Large Blend',
    assetClass: 'Equity',
    domicile: 'Australia',
    mer: 0.18,
    yield: 1.80,
    return1Y: 18.2,
    return3Y: 9.8,
    return5Y: 11.5,
    stdDev: 12.0,
    sharpeRatio: 0.85,
    fundSize: 6800,
    peRatio: 20.3,
    holdings: [
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
    distributions: [
      { date: '2026-07-01', amount: 0.55, franking: 0 },
      { date: '2026-04-01', amount: 0.42, franking: 0 },
      { date: '2026-01-02', amount: 0.48, franking: 0 },
      { date: '2025-10-01', amount: 0.35, franking: 0 }
    ],
    history1Y: generateHistoryPoints(18.2, 12.0, 12),
    history3Y: generateHistoryPoints(9.8, 12.5, 36),
    history5Y: generateHistoryPoints(11.5, 13.0, 60)
  },
  {
    ticker: 'NDQ',
    name: 'Betashares Nasdaq 100 ETF',
    category: 'Technology Large Growth',
    assetClass: 'Equity',
    domicile: 'Australia',
    mer: 0.48,
    yield: 0.60,
    return1Y: 32.5,
    return3Y: 14.1,
    return5Y: 16.5,
    stdDev: 17.5,
    sharpeRatio: 1.25,
    fundSize: 4100,
    peRatio: 32.5,
    holdings: [
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
    distributions: [
      { date: '2026-07-01', amount: 0.15, franking: 0 },
      { date: '2026-01-02', amount: 0.12, franking: 0 },
      { date: '2025-07-01', amount: 0.14, franking: 0 },
      { date: '2025-01-02', amount: 0.11, franking: 0 }
    ],
    history1Y: generateHistoryPoints(32.5, 17.5, 12),
    history3Y: generateHistoryPoints(14.1, 18.0, 36),
    history5Y: generateHistoryPoints(16.5, 19.2, 60)
  },
  {
    ticker: 'VTS',
    name: 'Vanguard U.S. Total Market Shares Index ETF',
    category: 'US Large Blend',
    assetClass: 'Equity',
    domicile: 'US',
    mer: 0.03,
    yield: 1.40,
    return1Y: 23.8,
    return3Y: 11.8,
    return5Y: 14.1,
    stdDev: 12.8,
    sharpeRatio: 1.05,
    fundSize: 3900,
    peRatio: 24.1,
    holdings: [
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
    distributions: [
      { date: '2026-06-18', amount: 1.15 },
      { date: '2026-03-24', amount: 0.98 },
      { date: '2025-12-21', amount: 1.24 },
      { date: '2025-09-17', amount: 0.91 }
    ],
    history1Y: generateHistoryPoints(23.8, 12.8, 12),
    history3Y: generateHistoryPoints(11.8, 13.2, 36),
    history5Y: generateHistoryPoints(14.1, 14.5, 60)
  },
  {
    ticker: 'DHHF',
    name: 'Betashares Diversified All Growth ETF',
    category: 'Diversified Multi-Asset',
    assetClass: 'Multi-Asset',
    domicile: 'Australia',
    mer: 0.19,
    yield: 2.60,
    return1Y: 14.5,
    return3Y: 8.5,
    return5Y: 9.8,
    stdDev: 11.2,
    sharpeRatio: 0.78,
    fundSize: 450,
    peRatio: 17.5,
    holdings: [
      { name: 'Vanguard U.S. Total Market ETF', ticker: 'VTS', weight: 36.5 },
      { name: 'Betashares Australia 200 ETF', ticker: 'A200', weight: 35.2 },
      { name: 'SPDR S&P World ex-US ETF', ticker: 'VEU', weight: 20.3 },
      { name: 'iShares MSCI Emerging Markets ETF', ticker: 'IEM', weight: 8.0 }
    ],
    distributions: [
      { date: '2026-07-01', amount: 0.28, franking: 16 },
      { date: '2026-04-01', amount: 0.19, franking: 12 },
      { date: '2026-01-02', amount: 0.24, franking: 15 },
      { date: '2025-10-01', amount: 0.15, franking: 20 }
    ],
    history1Y: generateHistoryPoints(14.5, 11.2, 12),
    history3Y: generateHistoryPoints(8.5, 11.8, 36),
    history5Y: generateHistoryPoints(9.8, 12.2, 60)
  },
  {
    ticker: 'VHY',
    name: 'Vanguard Australian Shares High Yield ETF',
    category: 'Australia Dividend Equity',
    assetClass: 'Equity',
    domicile: 'Australia',
    mer: 0.25,
    yield: 5.20,
    return1Y: 10.5,
    return3Y: 8.1,
    return5Y: 7.9,
    stdDev: 14.2,
    sharpeRatio: 0.60,
    fundSize: 3400,
    peRatio: 14.1,
    holdings: [
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
    distributions: [
      { date: '2026-07-01', amount: 1.54, franking: 89 },
      { date: '2026-04-01', amount: 1.12, franking: 92 },
      { date: '2026-01-02', amount: 1.25, franking: 87 },
      { date: '2025-10-01', amount: 0.98, franking: 91 }
    ],
    history1Y: generateHistoryPoints(10.5, 14.2, 12),
    history3Y: generateHistoryPoints(8.1, 14.6, 36),
    history5Y: generateHistoryPoints(7.9, 15.1, 60)
  },
  {
    ticker: 'VGE',
    name: 'Vanguard FTSE Emerging Markets Shares ETF',
    category: 'Emerging Markets Blend',
    assetClass: 'Equity',
    domicile: 'Australia',
    mer: 0.48,
    yield: 2.50,
    return1Y: 6.8,
    return3Y: 2.1,
    return5Y: 3.5,
    stdDev: 15.5,
    sharpeRatio: 0.25,
    fundSize: 1100,
    peRatio: 12.8,
    holdings: [
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
    ],
    distributions: [
      { date: '2026-07-01', amount: 0.38, franking: 0 },
      { date: '2026-01-02', amount: 0.25, franking: 0 },
      { date: '2025-07-01', amount: 0.32, franking: 0 },
      { date: '2025-01-02', amount: 0.22, franking: 0 }
    ],
    history1Y: generateHistoryPoints(6.8, 15.5, 12),
    history3Y: generateHistoryPoints(2.1, 16.0, 36),
    history5Y: generateHistoryPoints(3.5, 16.8, 60)
  },
  {
    ticker: 'IOZ',
    name: 'iShares Core S&P/ASX 200 ETF',
    category: 'Australia Large Blend',
    assetClass: 'Equity',
    domicile: 'Australia',
    mer: 0.09,
    yield: 3.90,
    return1Y: 11.1,
    return3Y: 7.4,
    return5Y: 8.1,
    stdDev: 13.9,
    sharpeRatio: 0.64,
    fundSize: 4500,
    peRatio: 16.1,
    holdings: [
      { name: 'BHP Group Ltd', ticker: 'BHP', weight: 10.3 },
      { name: 'Commonwealth Bank of Australia', ticker: 'CBA', weight: 8.6 },
      { name: 'CSL Ltd', ticker: 'CSL', weight: 6.2 },
      { name: 'National Australia Bank Ltd', ticker: 'NAB', weight: 4.9 },
      { name: 'Westpac Banking Corp', ticker: 'WBC', weight: 4.3 }
    ],
    distributions: [
      { date: '2026-07-01', amount: 0.62, franking: 80 },
      { date: '2026-04-01', amount: 0.44, franking: 75 },
      { date: '2026-01-02', amount: 0.55, franking: 82 }
    ],
    history1Y: generateHistoryPoints(11.1, 13.9, 12),
    history3Y: generateHistoryPoints(7.4, 14.1, 36),
    history5Y: generateHistoryPoints(8.1, 14.6, 60)
  },
  {
    ticker: 'SUBD',
    name: 'Betashares AU Major Bank Subordinated Debt ETF',
    category: 'Australia Fixed Income - Credit',
    assetClass: 'Fixed Income',
    domicile: 'Australia',
    mer: 0.29,
    yield: 5.80,
    return1Y: 6.2,
    return3Y: 4.5,
    return5Y: 3.8,
    stdDev: 3.2,
    sharpeRatio: 0.45,
    fundSize: 1300,
    peRatio: null,
    holdings: [
      { name: 'ANZ Subordinated Bond 2033', ticker: 'ANZ-B', weight: 12.5 },
      { name: 'CBA Subordinated Bond 2034', ticker: 'CBA-B', weight: 12.2 },
      { name: 'NAB Subordinated Bond 2032', ticker: 'NAB-B', weight: 11.8 },
      { name: 'WBC Subordinated Bond 2035', ticker: 'WBC-B', weight: 11.5 },
      { name: 'Macquarie Bank Subordinated Bond 2031', ticker: 'MQG-B', weight: 8.5 }
    ],
    distributions: [
      { date: '2026-07-01', amount: 0.12, franking: 0 },
      { date: '2026-06-01', amount: 0.11, franking: 0 },
      { date: '2026-05-01', amount: 0.13, franking: 0 },
      { date: '2026-04-01', amount: 0.10, franking: 0 }
    ],
    history1Y: generateHistoryPoints(6.2, 3.2, 12),
    history3Y: generateHistoryPoints(4.5, 3.5, 36),
    history5Y: generateHistoryPoints(3.8, 4.0, 60)
  },
  {
    ticker: 'QPON',
    name: 'Betashares AU Bank Floating Rate Bond ETF',
    category: 'Australia Fixed Income - Short',
    assetClass: 'Fixed Income',
    domicile: 'Australia',
    mer: 0.22,
    yield: 4.80,
    return1Y: 5.1,
    return3Y: 3.8,
    return5Y: 3.1,
    stdDev: 1.5,
    sharpeRatio: 0.50,
    fundSize: 950,
    peRatio: null,
    holdings: [
      { name: 'CBA Floating Rate Note 2028', ticker: 'CBA-FRN', weight: 14.5 },
      { name: 'WBC Floating Rate Note 2027', ticker: 'WBC-FRN', weight: 13.8 },
      { name: 'NAB Floating Rate Note 2029', ticker: 'NAB-FRN', weight: 13.2 },
      { name: 'ANZ Floating Rate Note 2028', ticker: 'ANZ-FRN', weight: 12.9 }
    ],
    distributions: [
      { date: '2026-07-01', amount: 0.10, franking: 0 },
      { date: '2026-06-01', amount: 0.09, franking: 0 },
      { date: '2026-05-01', amount: 0.10, franking: 0 }
    ],
    history1Y: generateHistoryPoints(5.1, 1.5, 12),
    history3Y: generateHistoryPoints(3.8, 1.8, 36),
    history5Y: generateHistoryPoints(3.1, 2.0, 60)
  },
  {
    ticker: 'IAF',
    name: 'iShares Core Composite Bond ETF',
    category: 'Australia Fixed Income',
    assetClass: 'Fixed Income',
    domicile: 'Australia',
    mer: 0.15,
    yield: 3.60,
    return1Y: 4.8,
    return3Y: -0.5,
    return5Y: 0.2,
    stdDev: 5.8,
    sharpeRatio: 0.10,
    fundSize: 1850,
    peRatio: null,
    holdings: [
      { name: 'Australia Government Bond 2.75% 2035', ticker: 'AU-GOV', weight: 25.5 },
      { name: 'Australia Government Bond 4.25% 2040', ticker: 'AU-GOV2', weight: 18.2 },
      { name: 'NSW Treasury Corp 3.00% 2030', ticker: 'NSW-TC', weight: 8.5 },
      { name: 'Treasury Corp of Victoria 4.25% 2032', ticker: 'VIC-TC', weight: 6.2 }
    ],
    distributions: [
      { date: '2026-07-01', amount: 0.24, franking: 0 },
      { date: '2026-04-01', amount: 0.21, franking: 0 },
      { date: '2026-01-02', amount: 0.25, franking: 0 }
    ],
    history1Y: generateHistoryPoints(4.8, 5.8, 12),
    history3Y: generateHistoryPoints(-0.5, 6.2, 36),
    history5Y: generateHistoryPoints(0.2, 6.5, 60)
  },
  {
    ticker: 'GOLD',
    name: 'Global X Physical Gold ETF',
    category: 'Commodities Precious Metals',
    assetClass: 'Commodities',
    domicile: 'Australia',
    mer: 0.40,
    yield: 0.00,
    return1Y: 15.6,
    return3Y: 10.8,
    return5Y: 8.5,
    stdDev: 11.5,
    sharpeRatio: 0.70,
    fundSize: 2600,
    peRatio: null,
    holdings: [
      { name: 'Physical Gold Bullion Bars (Allocated)', ticker: 'GOLD-PHYS', weight: 100 }
    ],
    distributions: [],
    history1Y: generateHistoryPoints(15.6, 11.5, 12),
    history3Y: generateHistoryPoints(10.8, 12.0, 36),
    history5Y: generateHistoryPoints(8.5, 12.8, 60)
  },
  {
    ticker: 'ACDC',
    name: 'Global X Battery Tech & Lithium ETF',
    category: 'Thematic Equity',
    assetClass: 'Thematic',
    domicile: 'Australia',
    mer: 0.69,
    yield: 1.20,
    return1Y: -8.5,
    return3Y: 4.5,
    return5Y: 12.4,
    stdDev: 22.0,
    sharpeRatio: 0.40,
    fundSize: 420,
    peRatio: 18.2,
    holdings: [
      { name: 'Tesla Inc', ticker: 'TSLA', weight: 5.5 },
      { name: 'BYD Co Ltd', ticker: 'BYD', weight: 4.8 },
      { name: 'Panasonic Holdings Corp', ticker: '6752', weight: 4.2 },
      { name: 'LG Energy Solution Ltd', ticker: '373220', weight: 3.8 },
      { name: 'Albemarle Corp', ticker: 'ALB', weight: 3.5 }
    ],
    distributions: [
      { date: '2026-07-01', amount: 0.08, franking: 5 },
      { date: '2025-07-01', amount: 0.12, franking: 8 }
    ],
    history1Y: generateHistoryPoints(-8.5, 22.0, 12),
    history3Y: generateHistoryPoints(4.5, 23.5, 36),
    history5Y: generateHistoryPoints(12.4, 25.0, 60)
  },
  {
    ticker: 'QUAL',
    name: 'VanEck MSCI International Quality ETF',
    category: 'Global Large Growth',
    assetClass: 'Equity',
    domicile: 'Australia',
    mer: 0.40,
    yield: 1.50,
    return1Y: 22.1,
    return3Y: 13.4,
    return5Y: 15.2,
    stdDev: 11.8,
    sharpeRatio: 1.15,
    fundSize: 3800,
    peRatio: 23.5,
    holdings: [
      { name: 'NVIDIA Corp', ticker: 'NVDA', weight: 5.2 },
      { name: 'Microsoft Corp', ticker: 'MSFT', weight: 4.9 },
      { name: 'Apple Inc', ticker: 'AAPL', weight: 4.3 },
      { name: 'Meta Platforms Inc', ticker: 'META', weight: 3.8 },
      { name: 'Eli Lilly & Co', ticker: 'LLY', weight: 3.2 }
    ],
    distributions: [
      { date: '2026-07-01', amount: 0.35, franking: 0 },
      { date: '2025-07-01', amount: 0.28, franking: 0 }
    ],
    history1Y: generateHistoryPoints(22.1, 11.8, 12),
    history3Y: generateHistoryPoints(13.4, 12.2, 36),
    history5Y: generateHistoryPoints(15.2, 12.8, 60)
  },
  {
    ticker: 'MVW',
    name: 'VanEck MSCI Australian Equal Weight ETF',
    category: 'Australia Large Blend',
    assetClass: 'Equity',
    domicile: 'Australia',
    mer: 0.35,
    yield: 3.50,
    return1Y: 12.8,
    return3Y: 8.2,
    return5Y: 9.1,
    stdDev: 13.0,
    sharpeRatio: 0.72,
    fundSize: 2100,
    peRatio: 15.8,
    holdings: [
      { name: 'BHP Group Ltd', ticker: 'BHP', weight: 1.25 },
      { name: 'CBA Bank Ltd', ticker: 'CBA', weight: 1.22 },
      { name: 'Suncorp Group Ltd', ticker: 'SUN', weight: 1.18 },
      { name: 'Pilbara Minerals Ltd', ticker: 'PLS', weight: 1.15 }
    ],
    distributions: [
      { date: '2026-07-01', amount: 0.75, franking: 85 },
      { date: '2026-01-02', amount: 0.62, franking: 80 }
    ],
    history1Y: generateHistoryPoints(12.8, 13.0, 12),
    history3Y: generateHistoryPoints(8.2, 13.5, 36),
    history5Y: generateHistoryPoints(9.1, 14.1, 60)
  },
  {
    ticker: 'ETHI',
    name: 'Betashares Global Quality Leaders ETF (Hedged)',
    category: 'Global Large Growth',
    assetClass: 'Equity',
    domicile: 'Australia',
    mer: 0.43,
    yield: 1.40,
    return1Y: 19.5,
    return3Y: 10.5,
    return5Y: 12.8,
    stdDev: 13.2,
    sharpeRatio: 0.90,
    fundSize: 1800,
    peRatio: 22.1,
    holdings: [
      { name: 'NVIDIA Corp', ticker: 'NVDA', weight: 4.8 },
      { name: 'Apple Inc', ticker: 'AAPL', weight: 4.5 },
      { name: 'Home Depot Inc', ticker: 'HD', weight: 3.2 },
      { name: 'Adobe Inc', ticker: 'ADBE', weight: 2.8 },
      { name: 'Salesforce Inc', ticker: 'CRM', weight: 2.5 }
    ],
    distributions: [
      { date: '2026-07-01', amount: 0.18, franking: 0 },
      { date: '2025-07-01', amount: 0.15, franking: 0 }
    ],
    history1Y: generateHistoryPoints(19.5, 13.2, 12),
    history3Y: generateHistoryPoints(10.5, 13.8, 36),
    history5Y: generateHistoryPoints(12.8, 14.2, 60)
  },
  {
    ticker: 'VAF',
    name: 'Vanguard Australian Government Bond Index ETF',
    category: 'Australia Fixed Income - Gov',
    assetClass: 'Fixed Income',
    domicile: 'Australia',
    mer: 0.16,
    yield: 3.40,
    return1Y: 4.2,
    return3Y: -0.8,
    return5Y: 0.1,
    stdDev: 5.2,
    sharpeRatio: 0.05,
    fundSize: 1550,
    peRatio: null,
    holdings: [
      { name: 'Australia Government Bond 1.75% 2032', ticker: 'AU-GOV', weight: 28.5 },
      { name: 'Australia Government Bond 3.00% 2038', ticker: 'AU-GOV2', weight: 20.1 },
      { name: 'NSW Treasury Corp 4.00% 2031', ticker: 'NSW-TC', weight: 7.8 }
    ],
    distributions: [
      { date: '2026-07-01', amount: 0.22, franking: 0 },
      { date: '2026-04-01', amount: 0.18, franking: 0 },
      { date: '2026-01-02', amount: 0.19, franking: 0 }
    ],
    history1Y: generateHistoryPoints(4.2, 5.2, 12),
    history3Y: generateHistoryPoints(-0.8, 5.5, 36),
    history5Y: generateHistoryPoints(0.1, 5.8, 60)
  },
  {
    ticker: 'STW',
    name: 'SPDR S&P/ASX 200 Fund',
    category: 'Australia Large Blend',
    assetClass: 'Equity',
    domicile: 'Australia',
    mer: 0.13,
    yield: 3.70,
    return1Y: 11.0,
    return3Y: 7.3,
    return5Y: 8.0,
    stdDev: 14.0,
    sharpeRatio: 0.63,
    fundSize: 5200,
    peRatio: 16.2,
    holdings: [
      { name: 'BHP Group Ltd', ticker: 'BHP', weight: 10.4 },
      { name: 'Commonwealth Bank of Australia', ticker: 'CBA', weight: 8.6 },
      { name: 'CSL Ltd', ticker: 'CSL', weight: 6.2 }
    ],
    distributions: [
      { date: '2026-07-01', amount: 0.58, franking: 82 },
      { date: '2026-04-01', amount: 0.42, franking: 79 }
    ],
    history1Y: generateHistoryPoints(11.0, 14.0, 12),
    history3Y: generateHistoryPoints(7.3, 14.3, 36),
    history5Y: generateHistoryPoints(8.0, 14.8, 60)
  },
  {
    ticker: 'VEU',
    name: 'Vanguard All-World ex-US Shares Index ETF',
    category: 'Global Large Blend ex-US',
    assetClass: 'Equity',
    domicile: 'US',
    mer: 0.07,
    yield: 3.10,
    return1Y: 12.4,
    return3Y: 5.8,
    return5Y: 6.9,
    stdDev: 12.4,
    sharpeRatio: 0.52,
    fundSize: 2400,
    peRatio: 14.8,
    holdings: [
      { name: 'ASML Holding NV', ticker: 'ASML', weight: 2.1 },
      { name: 'Novo Nordisk A/S', ticker: 'NOVO', weight: 1.8 },
      { name: 'Nestle SA', ticker: 'NESN', weight: 1.5 },
      { name: 'Toyota Motor Corp', ticker: '7203', weight: 1.3 }
    ],
    distributions: [
      { date: '2026-06-22', amount: 0.45 },
      { date: '2026-03-20', amount: 0.32 },
      { date: '2025-12-18', amount: 0.52 }
    ],
    history1Y: generateHistoryPoints(12.4, 12.4, 12),
    history3Y: generateHistoryPoints(5.8, 12.8, 36),
    history5Y: generateHistoryPoints(6.9, 13.2, 60)
  },
  {
    ticker: 'IEM',
    name: 'iShares MSCI Emerging Markets ETF',
    category: 'Emerging Markets Blend',
    assetClass: 'Equity',
    domicile: 'US',
    mer: 0.69,
    yield: 2.20,
    return1Y: 7.2,
    return3Y: 1.8,
    return5Y: 3.2,
    stdDev: 16.0,
    sharpeRatio: 0.22,
    fundSize: 850,
    peRatio: 12.5,
    holdings: [
      { name: 'Taiwan Semiconductor Manufacturing Co', ticker: 'TSMC', weight: 8.5 },
      { name: 'Tencent Holdings Ltd', ticker: 'Tencent', weight: 4.8 },
      { name: 'Samsung Electronics Co Ltd', ticker: 'Samsung', weight: 3.5 }
    ],
    distributions: [
      { date: '2026-06-15', amount: 0.28 },
      { date: '2025-12-15', amount: 0.34 }
    ],
    history1Y: generateHistoryPoints(7.2, 16.0, 12),
    history3Y: generateHistoryPoints(1.8, 16.5, 36),
    history5Y: generateHistoryPoints(3.2, 17.2, 60)
  }
];
