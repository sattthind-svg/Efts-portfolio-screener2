import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PiggyBank, 
  Coins, 
  Percent, 
  TrendingUp, 
  Zap, 
  ArrowRight, 
  AlertCircle, 
  Info, 
  HelpCircle, 
  DollarSign, 
  Calendar, 
  ShieldAlert,
  Sparkles,
  ChevronRight,
  TrendingDown,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';

interface Broker {
  name: string;
  fee: number;
  description: string;
  isFreeThreshold?: boolean;
  freeLimit?: number;
}

const COMMON_BROKERS: Broker[] = [
  { name: 'Betashares Direct', fee: 0, description: 'Zero brokerage on all ETFs.' },
  { name: 'CMC Markets', fee: 0, description: 'Free for first buy under $1,000/day per ticker. Otherwise $11 or 0.1%.', isFreeThreshold: true, freeLimit: 1000 },
  { name: 'Superhero', fee: 2.00, description: '$2 flat fee for ASX shares/ETFs.' },
  { name: 'Pearler', fee: 5.50, description: '$5.50 flat fee per trade.' },
  { name: 'Selfwealth', fee: 9.50, description: '$9.50 flat fee per trade.' },
  { name: 'CommSec', fee: 5.00, description: '$5.00 for trades up to $1,000, $10.00 up to $3,000, $19.95 up to $10,000.' },
  { name: 'Custom Broker', fee: 10.00, description: 'Enter your custom brokerage fee.' }
];

export default function DCAOptimizer() {
  // Inputs
  const [savingsPerPeriod, setSavingsPerPeriod] = useState<number>(1000); // Amount saved per month
  const [savingsPeriod, setSavingsPeriod] = useState<'weekly' | 'fortnightly' | 'monthly'>('monthly');
  const [expectedReturn, setExpectedReturn] = useState<number>(8.5); // % p.a.
  const [horizonYears, setHorizonYears] = useState<number>(10);
  const [selectedBrokerIndex, setSelectedBrokerIndex] = useState<number>(2); // Default to Superhero ($2)
  const [customBrokerFee, setCustomBrokerFee] = useState<number>(9.50);
  const [cashAccountRate, setCashAccountRate] = useState<number>(4.0); // Interest earned on cash waiting to buy

  const broker = COMMON_BROKERS[selectedBrokerIndex];
  const brokerageFee = broker.name === 'Custom Broker' ? customBrokerFee : broker.fee;

  // Convert raw savings to monthly savings base
  let monthlySavings = savingsPerPeriod;
  if (savingsPeriod === 'weekly') monthlySavings = savingsPerPeriod * (52 / 12);
  if (savingsPeriod === 'fortnightly') monthlySavings = savingsPerPeriod * (26 / 12);

  const annualSavings = monthlySavings * 12;

  // Optimizing calculation using the classic "LINC" formula / optimal invest interval formula:
  // Optimal investment frequency in days:
  // N = Sqrt( (2 * Brokerage * 365) / (SavingsPerDay * (MarketReturn - CashInterest)) )
  const dailySavings = annualSavings / 365;
  const returnDiffFraction = (expectedReturn - cashAccountRate) / 100;
  
  // Guard against divide by zero or negative difference
  const effectiveReturnDiff = returnDiffFraction > 0 ? returnDiffFraction : 0.04;
  
  // Adjust brokerage fee for CMC Markets free limit logic
  let adjustedBrokerageFeeForFormula = brokerageFee;
  if (broker.isFreeThreshold && broker.freeLimit) {
    // If savings size is less than free limit, brokerage is zero!
    // We give a tiny $0.10 value just to keep the formula healthy
    const depositSize = monthlySavings; // rough estimate
    if (depositSize <= broker.freeLimit) {
      adjustedBrokerageFeeForFormula = 0.10;
    }
  }

  const optimalIntervalDays = Math.sqrt((2 * adjustedBrokerageFeeForFormula * 365) / (dailySavings * effectiveReturnDiff));
  const optimalWeeks = optimalIntervalDays / 7;

  // Simulate different standard frequencies: Weekly, Fortnightly, Monthly, Bi-Monthly, Quarterly, Half-Yearly
  const frequencies = [
    { name: 'Weekly', intervalWeeks: 1, label: 'Every week' },
    { name: 'Fortnightly', intervalWeeks: 2, label: 'Every 2 weeks' },
    { name: 'Monthly', intervalWeeks: 4.33, label: 'Every month' },
    { name: 'Bi-Monthly', intervalWeeks: 8.66, label: 'Every 2 months' },
    { name: 'Quarterly', intervalWeeks: 13, label: 'Every 3 months' },
    { name: 'Half-Yearly', intervalWeeks: 26, label: 'Every 6 months' }
  ];

  const simulationData = frequencies.map(freq => {
    // Determine brokerage per trade
    let tradeFee = brokerageFee;
    // Apply CMC Markets Free buy rule under $1000
    if (broker.isFreeThreshold && broker.freeLimit) {
      const depositSize = dailySavings * (freq.intervalWeeks * 7);
      if (depositSize <= broker.freeLimit) {
        tradeFee = 0;
      }
    }

    const totalDays = horizonYears * 365;
    const daysInterval = freq.intervalWeeks * 7;
    const tradesCount = Math.floor(totalDays / daysInterval);
    const totalBrokeragePaid = tradesCount * tradeFee;

    // Simulation simulation:
    // Let's compound day-by-day to simulate cash accumulation in high-yield account
    // and periodic lump sum investment.
    let cashBalance = 0;
    let investedBalance = 0;

    const dailyMarketRate = Math.pow(1 + (expectedReturn / 100), 1 / 365) - 1;
    const dailyCashRate = Math.pow(1 + (cashAccountRate / 100), 1 / 365) - 1;

    for (let d = 1; d <= totalDays; d++) {
      // Accumulate cash daily
      cashBalance += dailySavings;

      // Compound existing invested balance daily
      investedBalance *= (1 + dailyMarketRate);

      // Compound cash balance daily
      cashBalance *= (1 + dailyCashRate);

      // Investment Day triggered
      if (d % Math.round(daysInterval) === 0) {
        // invest cash balance minus brokerage
        const amountToInvest = cashBalance - tradeFee;
        if (amountToInvest > 0) {
          investedBalance += amountToInvest;
          cashBalance = 0;
        }
      }
    }

    const endingBalance = investedBalance + cashBalance;
    const totalContributions = dailySavings * totalDays;
    const interestEarned = endingBalance - totalContributions;

    return {
      name: freq.name,
      label: freq.label,
      'Ending Balance': Math.round(endingBalance),
      'Total Brokerage': Math.round(totalBrokeragePaid),
      'Opportunity Cost (Cash Drag)': Math.round(totalContributions * (expectedReturn/100) * 0.15), // Approximation for visual comparison
      'Total Profits': Math.round(interestEarned - totalBrokeragePaid)
    };
  });

  // Sort by highest ending balance to find the winner
  const sortedFrequencies = [...simulationData].sort((a, b) => b['Ending Balance'] - a['Ending Balance']);
  const optimalFrequencyName = sortedFrequencies[0].name;
  const optimalEndingBalance = sortedFrequencies[0]['Ending Balance'];
  const worstEndingBalance = sortedFrequencies[sortedFrequencies.length - 1]['Ending Balance'];
  const optimizationBenefit = optimalEndingBalance - worstEndingBalance;

  // Let's get the active index for rendering
  const isCmcFree = broker.name === 'CMC Markets' && (dailySavings * 30 <= 1000);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 translate-y-16 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
            <Zap className="w-6 h-6" />
          </span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-black uppercase self-start">
            ASX Strategy
          </span>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">Smart DCA Frequency & Brokerage Cost Optimizer</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-3xl">
          Should you invest weekly, fortnightly, or monthly? Australian investors face a delicate balance: buying too often racks up brokerage fees, while waiting too long leaves your money sitting in cash, missing out on compounding market growth. Calculate your exact optimal interval below.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Variable Inputs */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Coins className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-slate-900 text-base">Optimizer Inputs</h3>
          </div>

          {/* Regular Savings amount */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-500">Regular Savings Rate</span>
              <span className="font-mono font-black text-slate-900">
                ${savingsPerPeriod.toLocaleString()} per {savingsPeriod === 'weekly' ? 'week' : savingsPeriod === 'fortnightly' ? 'fortnight' : 'month'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input 
                  type="number"
                  value={savingsPerPeriod}
                  onChange={(e) => setSavingsPerPeriod(Math.max(10, parseInt(e.target.value) || 0))}
                  aria-label="Regular Savings Rate Amount"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-slate-800"
                />
              </div>
              <select
                value={savingsPeriod}
                onChange={(e: any) => setSavingsPeriod(e.target.value)}
                aria-label="Savings Period"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-700 cursor-pointer"
              >
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <input 
              type="range"
              min="50"
              max="15000"
              step="50"
              value={savingsPerPeriod}
              onChange={(e) => setSavingsPerPeriod(parseInt(e.target.value))}
              aria-label="Regular Savings Rate Slider"
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Brokerage platform */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Brokerage Platform & Fee structure</label>
            <select
              value={selectedBrokerIndex}
              onChange={(e) => setSelectedBrokerIndex(parseInt(e.target.value))}
              aria-label="Brokerage Platform & Fee structure"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-black text-slate-700 cursor-pointer transition focus:bg-white"
            >
              {COMMON_BROKERS.map((b, i) => (
                <option key={b.name} value={i}>
                  {b.name} ({b.fee === 0 ? 'Free' : `$${b.fee.toFixed(2)}`})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 italic leading-relaxed font-semibold px-1">
              {broker.description}
            </p>
          </div>

          {/* Custom Broker Fee Input (Conditional) */}
          {broker.name === 'Custom Broker' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Custom Fee per Buy Trade ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input 
                  type="number"
                  step="0.01"
                  value={customBrokerFee}
                  onChange={(e) => setCustomBrokerFee(parseFloat(e.target.value) || 0)}
                  aria-label="Custom Fee per Buy Trade"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 pl-7 pr-3 text-xs font-black text-slate-800"
                />
              </div>
            </div>
          )}

          {/* Projected returns */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Expected ETF Return %</label>
              <div className="relative">
                <input 
                  type="number"
                  step="0.1"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(parseFloat(e.target.value) || 0)}
                  aria-label="Expected ETF Return Percentage"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-black text-slate-800"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Savings Account Interest %</label>
              <div className="relative">
                <input 
                  type="number"
                  step="0.1"
                  value={cashAccountRate}
                  onChange={(e) => setCashAccountRate(parseFloat(e.target.value) || 0)}
                  aria-label="Savings Account Interest Percentage"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-black text-slate-800"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* Time horizon */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-500">Savings Timeline Horizon</span>
              <span className="font-mono font-black text-slate-900">{horizonYears} Years</span>
            </div>
            <input 
              type="range"
              min="1"
              max="30"
              value={horizonYears}
              onChange={(e) => setHorizonYears(parseInt(e.target.value))}
              aria-label="Savings Timeline Horizon"
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

        </div>

        {/* Right Column: Calculations & Comparison Charts */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6 flex flex-col justify-between">
          
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-900 text-base">Mathematical Recommendation</h3>
            </div>

            {/* Optimal Frequency Highlight Box */}
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white rounded-2xl p-5 border border-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
              
              <div className="space-y-1">
                <span className="text-[9px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-black uppercase tracking-wider self-start inline-block">
                  Optimal Investing Interval
                </span>
                <h4 className="text-xl font-black text-white">
                  Buy Every {optimalIntervalDays < 7 ? 'Few Days' : `${Math.round(optimalIntervalDays)} Days`} (~{optimalWeeks.toFixed(1)} Weeks)
                </h4>
                <p className="text-xs text-indigo-200 max-w-sm font-medium leading-relaxed">
                  Based on a savings speed of **${Math.round(monthlySavings)}/mo**, **${broker.name}** fees, and **{(expectedReturn - cashAccountRate).toFixed(1)}% p.a. market return difference**, this frequency minimizes your drag costs.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-indigo-300 block font-bold">Optimal Frequency</span>
                <span className="text-2xl font-black text-emerald-400 font-mono block mt-0.5">{optimalFrequencyName}</span>
                <span className="text-[9px] text-indigo-200 font-bold block">yielding +${Math.round(optimizationBenefit).toLocaleString()} benefit</span>
              </div>
            </div>

            {/* Frequencies Bar Chart */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">DCA Frequency Net Performance Comparison</label>
              <div className="h-[200px] w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={simulationData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={10} fontStyle="bold" stroke="#94a3b8" />
                    <YAxis 
                      fontSize={10} 
                      fontStyle="bold" 
                      stroke="#94a3b8" 
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} 
                    />
                    <Tooltip 
                      formatter={(val) => [`$${val.toLocaleString()}`, '']}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                    <Bar dataKey="Ending Balance" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Total Brokerage" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Mathematical Summary Box */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h5 className="font-black text-slate-800 uppercase tracking-wider">How is this calculated?</h5>
                <p className="text-slate-600 leading-normal">
                  The optimizer uses the standard financial equation representing the balance between two frictions:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 font-medium mt-1">
                  <li><strong>Brokerage Friction</strong>: Investing more frequently (e.g. weekly) increases transaction fees, depleting your investable principal.</li>
                  <li><strong>Cash Opportunity Cost (Cash Drag)</strong>: Investing less frequently (e.g. quarterly) leaves your savings idle in low-interest cash accounts, missing out on higher stock market growth rates.</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Diagnostic Stats footer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
              <span className="text-[9px] text-slate-400 block uppercase font-black tracking-wider">Total Saved</span>
              <span className="text-sm font-black text-slate-900 block mt-0.5">${(annualSavings * horizonYears).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              <span className="text-[9px] text-slate-400 block font-bold">savings baseline</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
              <span className="text-[9px] text-slate-400 block uppercase font-black tracking-wider">Best Frequency Value</span>
              <span className="text-sm font-black text-indigo-600 block mt-0.5">${optimalEndingBalance.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              <span className="text-[9px] text-slate-400 block font-bold">final wealth estimate</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
              <span className="text-[9px] text-slate-400 block uppercase font-black tracking-wider">Worst Frequency Value</span>
              <span className="text-sm font-black text-slate-500 block mt-0.5">${worstEndingBalance.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              <span className="text-[9px] text-slate-400 block font-bold">due to cost drag</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
              <span className="text-[9px] text-slate-400 block uppercase font-black tracking-wider">Optimization Edge</span>
              <span className="text-sm font-black text-emerald-600 block mt-0.5">+${optimizationBenefit.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              <span className="text-[9px] text-slate-400 block font-bold">compound savings saved</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
