import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Percent, 
  TrendingUp, 
  Coins, 
  Scale, 
  RefreshCw, 
  Sliders, 
  Calendar, 
  DollarSign, 
  Layers, 
  ShieldCheck, 
  Calculator,
  Briefcase,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ETF } from '../types';
import { ETF_HOLDINGS, Holding } from '../data';

interface PortfolioBuilderProps {
  watchlist: ETF[];
}

interface PortfolioItem {
  ticker: string;
  weight: number; // percentage (0-100)
}

// Sensible historical CAGR projections for index returns based on 10-year track records
const HISTORICAL_CAGR: Record<string, number> = {
  VAS: 7.8,   // ASX 300 (higher yield, moderate growth)
  A200: 7.9,  // ASX 200
  VGS: 9.6,   // MSCI World
  NDQ: 14.2,  // Nasdaq 100 (high growth, low yield)
  VTS: 10.1,  // US Total Market
  IVV: 10.4,  // S&P 500
  DHHF: 8.8,  // All Growth Diversified
  VHY: 7.2,   // High dividend yield, lower price CAGR
  VGE: 6.1,   // Emerging markets
};

export default function PortfolioBuilder({ watchlist }: PortfolioBuilderProps) {
  // Use watchlist ETFs as default items
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const defaults = watchlist.slice(0, 3);
    if (defaults.length === 0) return [];
    
    // Distribute weights evenly initially
    const weight = Math.floor(100 / defaults.length);
    let remaining = 100 - (weight * defaults.length);
    
    return defaults.map((etf, index) => ({
      ticker: etf.ticker,
      weight: weight + (index === 0 ? remaining : 0)
    }));
  });

  const [initialPrincipal, setInitialPrincipal] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [horizonYears, setHorizonYears] = useState<number>(15);
  const [customCAGR, setCustomCAGR] = useState<number | null>(null);

  // Available ETFs to add that are not already in the portfolio
  const availableToAdd = watchlist.filter(
    etf => !portfolio.some(item => item.ticker === etf.ticker)
  );

  // Set weights evenly
  const handleEvenWeights = () => {
    if (portfolio.length === 0) return;
    const weight = Math.floor(100 / portfolio.length);
    let remaining = 100 - (weight * portfolio.length);
    
    const updated = portfolio.map((item, index) => ({
      ...item,
      weight: weight + (index === 0 ? remaining : 0)
    }));
    setPortfolio(updated);
  };

  const handleWeightChange = (ticker: string, value: number) => {
    const updated = portfolio.map(item => {
      if (item.ticker === ticker) {
        return { ...item, weight: Math.max(0, Math.min(100, value)) };
      }
      return item;
    });
    setPortfolio(updated);
  };

  const handleAddETF = (ticker: string) => {
    if (portfolio.some(item => item.ticker === ticker)) return;
    
    // Distribute space from current items or start with a sensible size
    const count = portfolio.length + 1;
    const newWeight = Math.floor(100 / count);
    
    // Scale existing down proportionally
    const multiplier = (100 - newWeight) / 100;
    const scaledExisting = portfolio.map(item => ({
      ...item,
      weight: Math.round(item.weight * multiplier)
    }));

    const sumCurrent = scaledExisting.reduce((acc, i) => acc + i.weight, 0);
    const remainder = 100 - sumCurrent - newWeight;

    const finalExisting = scaledExisting.map((item, index) => {
      if (index === 0) return { ...item, weight: item.weight + remainder };
      return item;
    });

    setPortfolio([...finalExisting, { ticker, weight: newWeight }]);
  };

  const handleRemoveETF = (ticker: string) => {
    const filtered = portfolio.filter(item => item.ticker !== ticker);
    if (filtered.length === 0) {
      setPortfolio([]);
      return;
    }
    // Scale up remaining to sum to 100%
    const currentSum = filtered.reduce((acc, i) => acc + i.weight, 0);
    if (currentSum === 0) {
      const even = Math.floor(100 / filtered.length);
      setPortfolio(filtered.map((item, index) => ({
        ticker: item.ticker,
        weight: even + (index === 0 ? 100 - (even * filtered.length) : 0)
      })));
      return;
    }

    const scale = 100 / currentSum;
    const scaled = filtered.map(item => ({
      ...item,
      weight: Math.round(item.weight * scale)
    }));

    const newSum = scaled.reduce((acc, i) => acc + i.weight, 0);
    const adjustment = 100 - newSum;
    if (scaled.length > 0) {
      scaled[0].weight += adjustment;
    }
    setPortfolio(scaled);
  };

  const totalWeight = portfolio.reduce((acc, item) => acc + item.weight, 0);
  const isBalanced = totalWeight === 100;

  // Calculate weighted metrics
  let weightedMER = 0;
  let weightedYield = 0;
  let weightedDiscount = 0;
  let weightedPE = 0;
  let weightedFranking = 0;
  let weightedCAGR = 0;
  let auWeight = 0;
  let usWeight = 0;

  portfolio.forEach(item => {
    const etf = watchlist.find(e => e.ticker === item.ticker);
    if (!etf) return;

    const wFraction = item.weight / 100;
    weightedMER += (etf.currentData.expenseRatio || 0) * wFraction;
    weightedYield += (etf.currentData.yield || 0) * wFraction;
    weightedDiscount += (etf.currentData.premiumDiscount || 0) * wFraction;
    weightedPE += (etf.currentData.pe || 15) * wFraction;
    weightedFranking += (etf.currentData.frankingCredits || 0) * wFraction;
    
    // CAGR calculation
    const baseCAGR = HISTORICAL_CAGR[item.ticker] || 8.5;
    weightedCAGR += baseCAGR * wFraction;

    if (etf.domicile === 'Australia') {
      auWeight += item.weight;
    } else {
      usWeight += item.weight;
    }
  });

  // Calculate Blended Top Stock Concentrations
  const consolidatedHoldingsMap: Record<string, { name: string, ticker: string, weight: number }> = {};
  
  portfolio.forEach(item => {
    const holdings = ETF_HOLDINGS[item.ticker] || [];
    holdings.forEach(h => {
      // Contribution is the ETF's weight in portfolio * the Stock's weight in the ETF
      const stockContribution = (item.weight / 100) * h.weight;
      const key = h.ticker.toUpperCase();
      if (consolidatedHoldingsMap[key]) {
        consolidatedHoldingsMap[key].weight += stockContribution;
      } else {
        consolidatedHoldingsMap[key] = {
          name: h.name,
          ticker: h.ticker,
          weight: stockContribution
        };
      }
    });
  });

  const consolidatedHoldings = Object.values(consolidatedHoldingsMap)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 10);

  // Simulator Engine
  const effectiveCAGR = customCAGR !== null ? customCAGR : weightedCAGR;
  const annualGrowthRate = effectiveCAGR / 100;
  const monthlyRate = Math.pow(1 + annualGrowthRate, 1 / 12) - 1;
  const activeManagerRate = (effectiveCAGR - 1.25) / 100; // Manager charges 1.25% fee drag
  const activeManagerMonthlyRate = Math.pow(1 + activeManagerRate, 1 / 12) - 1;

  // Generate Simulation Data for Area Chart
  const generateChartData = () => {
    const data = [];
    let portfolioBalance = initialPrincipal;
    let contributionOnly = initialPrincipal;
    let activeManagerBalance = initialPrincipal;

    // Monthly compound simulation
    const totalMonths = horizonYears * 12;

    // Push initial year 0 state
    data.push({
      year: 'Year 0',
      'Portfolio Value': Math.round(portfolioBalance),
      'Contributions Only': Math.round(contributionOnly),
      'Active Mutual Fund': Math.round(activeManagerBalance),
    });

    for (let m = 1; m <= totalMonths; m++) {
      // Compound portfolio
      portfolioBalance = (portfolioBalance * (1 + monthlyRate)) + monthlyContribution;
      // Compound mutual fund alternative
      activeManagerBalance = (activeManagerBalance * (1 + activeManagerMonthlyRate)) + monthlyContribution;
      // Cash alternative
      contributionOnly += monthlyContribution;

      if (m % 12 === 0) {
        const yearNum = m / 12;
        data.push({
          year: `Yr ${yearNum}`,
          'Portfolio Value': Math.round(portfolioBalance),
          'Contributions Only': Math.round(contributionOnly),
          'Active Mutual Fund': Math.round(activeManagerBalance),
        });
      }
    }
    return data;
  };

  const chartData = generateChartData();
  const finalPortfolioValue = chartData[chartData.length - 1]['Portfolio Value'];
  const finalContributionOnly = chartData[chartData.length - 1]['Contributions Only'];
  const finalActiveManagerValue = chartData[chartData.length - 1]['Active Mutual Fund'];
  
  const passiveOutperformance = finalPortfolioValue - finalActiveManagerValue;
  const interestEarned = finalPortfolioValue - finalContributionOnly;
  const estimatedYearlyDividends = finalPortfolioValue * (weightedYield / 100);

  return (
    <div className="space-y-6">
      
      {/* Visual Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 translate-y-16 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
            <Briefcase className="w-6 h-6" />
          </span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-black uppercase self-start">
            Premium Tool
          </span>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">Interactive ETF Portfolio Backtester</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-3xl">
          Build and stress-test your ultimate multi-asset ASX portfolio. Specify customized asset weights, consolidate multi-fund overlapping holdings, and run a high-precision historical index simulator to see how your money compounds over time.
        </p>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Portfolio Allocation Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-900 text-base">Asset Allocation</h3>
            </div>
            {portfolio.length > 0 && (
              <button 
                onClick={handleEvenWeights}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-lg transition"
              >
                Distribute Evenly
              </button>
            )}
          </div>

          {/* Allocation Sliders */}
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
            {portfolio.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 border border-slate-200/60 rounded-2xl text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="font-bold text-sm text-slate-700">Portfolio is empty</p>
                <p className="text-xs text-slate-400 mt-1">Select and add ASX funds from the list below to build your core portfolio.</p>
              </div>
            ) : (
              portfolio.map(item => {
                const etf = watchlist.find(e => e.ticker === item.ticker);
                if (!etf) return null;
                return (
                  <div key={item.ticker} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900 text-sm">{item.ticker}</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[120px] sm:max-w-[160px] font-bold">
                          {etf.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={item.weight}
                          onChange={(e) => handleWeightChange(item.ticker, parseInt(e.target.value) || 0)}
                          aria-label={`Weight percentage for ${item.ticker}`}
                          className="w-12 text-center bg-white border border-slate-250 rounded-md py-0.5 text-xs font-extrabold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                        />
                        <span className="text-xs font-black text-slate-600">%</span>
                        <button
                          onClick={() => handleRemoveETF(item.ticker)}
                          className="text-slate-400 hover:text-rose-600 transition p-1 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={item.weight}
                        onChange={(e) => handleWeightChange(item.ticker, parseInt(e.target.value) || 0)}
                        aria-label={`Weight slider for ${item.ticker}`}
                        className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <span className="text-[10px] font-bold text-slate-400 min-w-[50px] text-right font-mono">
                        MER: {etf.currentData.expenseRatio}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Allocation Verification / Balancing Check */}
          {portfolio.length > 0 && (
            <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              isBalanced 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="flex items-center gap-2">
                <Scale className={`w-4 h-4 ${isBalanced ? 'text-emerald-500' : 'text-amber-500 animate-bounce'}`} />
                <div>
                  <h4 className="text-xs font-black">
                    {isBalanced ? 'PROPORTIONS PERFECTLY BALANCED' : 'PORTFOLIO OUT OF BALANCE'}
                  </h4>
                  <p className="text-[10px] opacity-90 mt-0.5">
                    {isBalanced 
                      ? 'Constituents sum up to exactly 100%. Simulator active.' 
                      : `Total allocation is currently ${totalWeight}%. Adjust weights to sum to exactly 100%.`}
                  </p>
                </div>
              </div>
              <span className="font-mono font-black text-sm">{totalWeight}%</span>
            </div>
          )}

          {/* Add Funds Dropdown / Selector */}
          {availableToAdd.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Add available ETF to portfolio:</label>
              <div className="flex gap-2">
                <select 
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddETF(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  aria-label="Add available ETF to portfolio"
                  className="flex-1 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-700 focus:bg-white outline-hidden transition cursor-pointer"
                  defaultValue=""
                >
                  <option value="" disabled>-- Choose a fund from Watchlist --</option>
                  {availableToAdd.map(e => (
                    <option key={e.ticker} value={e.ticker}>
                      {e.ticker} - {e.name} ({e.currentData.expenseRatio}% MER)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Backtester Simulator */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-900 text-base">Growth & Monthly Backtest Simulator</h3>
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Control 1: Principal */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-150 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Initial Capital</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">$</span>
                  <input 
                    type="number"
                    value={initialPrincipal}
                    onChange={(e) => setInitialPrincipal(Math.max(0, parseInt(e.target.value) || 0))}
                    aria-label="Initial Capital Amount"
                    className="w-full bg-white border border-slate-200 pl-6 pr-2 py-1.5 rounded-lg text-xs font-black text-slate-800"
                  />
                </div>
                <input 
                  type="range"
                  min="1000"
                  max="100000"
                  step="1000"
                  value={initialPrincipal}
                  onChange={(e) => setInitialPrincipal(parseInt(e.target.value))}
                  aria-label="Initial Capital Slider"
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Control 2: Monthly Deposit */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-150 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Monthly Deposit</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">$</span>
                  <input 
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Math.max(0, parseInt(e.target.value) || 0))}
                    aria-label="Monthly Deposit Amount"
                    className="w-full bg-white border border-slate-200 pl-6 pr-2 py-1.5 rounded-lg text-xs font-black text-slate-800"
                  />
                </div>
                <input 
                  type="range"
                  min="0"
                  max="5000"
                  step="100"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(parseInt(e.target.value))}
                  aria-label="Monthly Deposit Slider"
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Control 3: Time Horizon */}
              <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-150 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Investment Term</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={horizonYears}
                    onChange={(e) => setHorizonYears(Math.max(1, Math.min(40, parseInt(e.target.value) || 1)))}
                    aria-label="Investment Term in Years"
                    className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-black text-slate-800"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">Yrs</span>
                </div>
                <input 
                  type="range"
                  min="1"
                  max="40"
                  value={horizonYears}
                  onChange={(e) => setHorizonYears(parseInt(e.target.value))}
                  aria-label="Investment Term Slider"
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

            </div>

            {/* Custom CAGR slider */}
            <div className="bg-slate-50/40 px-4 py-3 border border-slate-150 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>Simulated Portfolio Return Rate:</span>
              </span>
              <div className="flex items-center gap-4 flex-1 sm:max-w-md">
                <input 
                  type="range"
                  min="3"
                  max="18"
                  step="0.1"
                  value={effectiveCAGR}
                  onChange={(e) => setCustomCAGR(parseFloat(e.target.value))}
                  aria-label="Simulated Portfolio Return Rate"
                  className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="font-mono font-black text-slate-900 bg-white border border-slate-250 px-2 py-0.5 rounded-md">
                  {effectiveCAGR.toFixed(1)}% p.a.
                </span>
                {customCAGR !== null && (
                  <button 
                    onClick={() => setCustomCAGR(null)}
                    className="text-[10px] text-indigo-600 font-extrabold hover:underline"
                    title="Reset to weighted index average"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Simulation Chart */}
            {!isBalanced ? (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-6 text-center">
                <Scale className="w-8 h-8 text-amber-400 animate-pulse mb-2" />
                <p className="text-sm font-extrabold text-slate-700">Simulator Paused</p>
                <p className="text-xs text-slate-400 max-w-sm mt-1">Please balance your portfolio to sum up to exactly 100% to run calculations and generate compound curves.</p>
              </div>
            ) : (
              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01}/>
                      </linearGradient>
                      <linearGradient id="colorMutual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d946ef" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#d946ef" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#64748b" stopOpacity={0.05}/>
                        <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" fontSize={10} fontStyle="bold" stroke="#94a3b8" />
                    <YAxis 
                      fontSize={10} 
                      fontStyle="bold" 
                      stroke="#94a3b8" 
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`$${parseInt(value).toLocaleString()}`, '']}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="Portfolio Value" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPortfolio)" />
                    <Area type="monotone" dataKey="Active Mutual Fund" stroke="#d946ef" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorMutual)" />
                    <Area type="monotone" dataKey="Contributions Only" stroke="#64748b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCash)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick Metrics Outcomes Row */}
          {isBalanced && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 block uppercase font-black tracking-wider">Compound Growth</span>
                <span className="text-sm font-black text-emerald-600 block mt-0.5">+${interestEarned.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                <span className="text-[9px] text-slate-400 block font-bold">interest generated</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 block uppercase font-black tracking-wider">Total Future Value</span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">${finalPortfolioValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                <span className="text-[9px] text-slate-400 block font-bold">ending balance</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 block uppercase font-black tracking-wider">Passive Edge</span>
                <span className="text-sm font-black text-indigo-600 block mt-0.5">+${passiveOutperformance.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                <span className="text-[9px] text-slate-400 block font-bold">vs active funds</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 block uppercase font-black tracking-wider">Blended Div Income</span>
                <span className="text-sm font-black text-slate-900 block mt-0.5">${estimatedYearlyDividends.toLocaleString(undefined, {maximumFractionDigits: 0})}/yr</span>
                <span className="text-[9px] text-slate-400 block font-bold">distribution payout</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Aggregate Portfolio Diagnostics Bento Grid */}
      {isBalanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Diagnostic 1: Blended Fee & Yield Metrics */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h4 className="font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm">
              <Percent className="w-4 h-4 text-slate-950" />
              Blended Cost & Distributions
            </h4>
            
            <div className="space-y-4 pt-1">
              {/* MER Detail */}
              <div className="flex items-center justify-between bg-slate-50/60 p-3 rounded-xl border border-slate-150">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Blended MER Fee</span>
                  <span className="font-mono text-base font-black text-slate-800">{weightedMER.toFixed(3)}% p.a.</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Annual Fee Cost</span>
                  <span className="text-xs font-black text-slate-950">${((initialPrincipal * weightedMER) / 100).toFixed(0)} AUD/yr</span>
                </div>
              </div>

              {/* Yield Detail */}
              <div className="flex items-center justify-between bg-slate-50/60 p-3 rounded-xl border border-slate-150">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Portfolio Distribution Yield</span>
                  <span className="font-mono text-base font-black text-emerald-600">{weightedYield.toFixed(2)}% p.a.</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-semibold">Dividend Franking</span>
                  <span className="text-xs font-black text-emerald-600">~{weightedFranking.toFixed(0)}% credits</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3 text-[10px] text-emerald-800 leading-normal">
                <strong>Tax Advice:</strong> This blend averages a high <strong>{weightedFranking.toFixed(0)}% Franking Credit share</strong>. If held in an Australian name or SMSF, you can reclaim these tax offsets directly from the ATO, magnifying your true yield further.
              </div>
            </div>
          </div>

          {/* Diagnostic 2: Consolidated Holding & Overlap Analyzer */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h4 className="font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm">
              <Layers className="w-4 h-4 text-slate-950" />
              Consolidated Top Holdings
            </h4>
            
            <div className="space-y-2.5 pt-1">
              {consolidatedHoldings.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No constituent stock holdings available.</p>
              ) : (
                consolidatedHoldings.map(sh => (
                  <div key={sh.ticker} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5 truncate max-w-[200px]">
                      <span className="font-mono font-black text-slate-950 bg-slate-100 px-1.5 py-0.5 rounded-sm text-[10px]">
                        {sh.ticker}
                      </span>
                      <span className="truncate">{sh.name}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="bg-indigo-600 h-1.5 rounded-full" 
                          style={{ width: `${Math.min(100, (sh.weight / 10) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-black text-slate-800">{sh.weight.toFixed(2)}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Diagnostic 3: Real-time Premium / Discount & Domicile Split */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h4 className="font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 text-sm">
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              Margin of Safety & Domicile
            </h4>

            <div className="space-y-4 pt-1">
              {/* Premium/Discount aggregate */}
              <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-150 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 uppercase font-black block">Aggregated NTA Pricing</span>
                  <span className={`text-xs font-black ${weightedDiscount <= 0 ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md' : 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md'}`}>
                    {weightedDiscount < 0 ? `${Math.abs(weightedDiscount).toFixed(2)}% Discount` : `${weightedDiscount.toFixed(2)}% Premium`}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full relative overflow-hidden">
                  <div 
                    className={`absolute h-full top-0 ${weightedDiscount <= 0 ? 'bg-emerald-500 right-1/2' : 'bg-rose-500 left-1/2'}`}
                    style={{ width: `${Math.min(50, (Math.abs(weightedDiscount) / 2) * 50)}%` }}
                  ></div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 w-0.5 h-1.5 bg-slate-400"></div>
                </div>
              </div>

              {/* Domicile weights */}
              <div className="bg-slate-50/60 p-3.5 rounded-xl border border-slate-150 space-y-2">
                <span className="text-[10px] text-slate-400 uppercase font-black block">Tax Jurisdiction Exposure</span>
                <div className="flex justify-between text-xs font-black text-slate-800">
                  <span className="flex items-center gap-1">🇦🇺 AU Domiciled: {auWeight}%</span>
                  <span className="flex items-center gap-1">🇺🇸 US Domiciled: {usWeight}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${auWeight}%` }}></div>
                  <div className="bg-amber-500 h-full" style={{ width: `${usWeight}%` }}></div>
                </div>
              </div>

              {/* Security advice */}
              <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-3 text-[10px] text-indigo-800 leading-normal">
                <strong>Tax Compliance Warning:</strong> US Domiciled holdings require you to file a US tax form (<strong>W-8BEN</strong>) every 3 years to claim tax withholding rate reductions. Ensure your paperwork is up to date to protect foreign distributions.
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
