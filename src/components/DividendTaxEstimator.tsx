import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Percent, 
  Calculator, 
  ShieldCheck, 
  TrendingUp, 
  Award, 
  PiggyBank, 
  Calendar, 
  Scale, 
  ArrowRight,
  ChevronRight,
  Info,
  HelpCircle,
  Briefcase,
  Users,
  Target
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ETF } from '../types';

interface DividendTaxEstimatorProps {
  watchlist: ETF[];
}

type HoldingEntity = 'Individual' | 'Joint' | 'SMSF' | 'Company';

export default function DividendTaxEstimator({ watchlist }: DividendTaxEstimatorProps) {
  // Inputs
  const [portfolioValue, setPortfolioValue] = useState<number>(150000);
  const [dividendYield, setDividendYield] = useState<number>(4.2); // Default to a reasonable blended yield
  const [frankingLevel, setFrankingLevel] = useState<number>(75); // % of dividends that are franked
  const [otherTaxableIncome, setOtherTaxableIncome] = useState<number>(85000); // Standard individual annual salary
  const [holdingEntity, setHoldingEntity] = useState<HoldingEntity>('Individual');
  const [monthlyTargetIncome, setMonthlyTargetIncome] = useState<number>(3000); // Target passive income
  const [monthlySavings, setMonthlySavings] = useState<number>(1000); // Monthly savings to compound

  // Try to pre-fill average yield from watchlist if available
  useEffect(() => {
    if (watchlist.length > 0) {
      const totalYield = watchlist.reduce((sum, etf) => sum + (etf.currentData.yield || 0), 0);
      const avgYield = totalYield / watchlist.length;
      if (avgYield > 0) {
        setDividendYield(parseFloat(avgYield.toFixed(2)));
      }
      
      const totalFranking = watchlist.reduce((sum, etf) => sum + (etf.currentData.frankingCredits || 0), 0);
      const avgFranking = totalFranking / watchlist.length;
      if (avgFranking > 0) {
        setFrankingLevel(Math.round(avgFranking));
      }
    }
  }, [watchlist]);

  // Calculations
  const rawDividends = portfolioValue * (dividendYield / 100);
  
  // Franking credits: Franked dividends represent the "net" cash distribution after 30% company tax has been paid.
  // The grossed-up dividend = cash dividend + franking credits.
  // Franking credit = Cash Dividend * (Franking Level / 100) * (0.30 / 0.70)
  const frankingCredits = rawDividends * (frankingLevel / 100) * (0.30 / 0.70);
  const grossedUpDividends = rawDividends + frankingCredits;
  const blendedGrossYield = (grossedUpDividends / portfolioValue) * 100;

  // Australian Marginal Income Tax Brackets (FY 2024-2025 & FY 2025-2026 Stage 3 Cuts)
  const calculateIndividualTax = (taxableIncome: number): { tax: number; medicare: number; netTax: number } => {
    let tax = 0;
    
    // Brackets:
    // $0 – $18,200: Nil
    // $18,201 – $45,000: 16c for each $1 over $18,200
    // $45,001 – $135,000: $4,288 plus 30c for each $1 over $45,000
    // $135,001 – $190,000: $31,288 plus 37c for each $1 over $135,000
    // $190,001 and over: $51,638 plus 45c for each $1 over $190,000
    if (taxableIncome <= 18200) {
      tax = 0;
    } else if (taxableIncome <= 45000) {
      tax = (taxableIncome - 18200) * 0.16;
    } else if (taxableIncome <= 135000) {
      tax = 4288 + (taxableIncome - 45000) * 0.30;
    } else if (taxableIncome <= 190000) {
      tax = 31288 + (taxableIncome - 135000) * 0.37;
    } else {
      tax = 51638 + (taxableIncome - 190000) * 0.45;
    }

    const medicare = taxableIncome > 26000 ? taxableIncome * 0.02 : 0; // 2% Medicare levy with general threshold check
    return { tax, medicare, netTax: tax + medicare };
  };

  // Calculate tax based on selected holding entity
  let totalIncomeWithDividends = 0;
  let taxOnOtherIncomeOnly = 0;
  let taxOnCombinedIncome = 0;
  let rawTaxLiabilityOnDividends = 0;
  let finalTaxLiability = 0; // Negative means refund
  let medicareLevyOnDividends = 0;

  if (holdingEntity === 'Individual') {
    totalIncomeWithDividends = otherTaxableIncome + grossedUpDividends;
    
    const otherIncomeTaxRes = calculateIndividualTax(otherTaxableIncome);
    const combinedIncomeTaxRes = calculateIndividualTax(totalIncomeWithDividends);
    
    taxOnOtherIncomeOnly = otherIncomeTaxRes.netTax;
    taxOnCombinedIncome = combinedIncomeTaxRes.netTax;
    
    // The incremental tax liability caused by adding dividends
    rawTaxLiabilityOnDividends = taxOnCombinedIncome - taxOnOtherIncomeOnly;
    
    // Under Australian tax system, franking credits are applied as a tax offset (dollar-for-dollar reduction in liability)
    finalTaxLiability = rawTaxLiabilityOnDividends - frankingCredits;
  } 
  else if (holdingEntity === 'Joint') {
    // Splits the income and dividends perfectly 50/50 between two partners
    const halfOther = otherTaxableIncome / 2;
    const halfDividends = grossedUpDividends / 2;
    
    const singleOtherTax = calculateIndividualTax(halfOther).netTax;
    const singleCombinedTax = calculateIndividualTax(halfOther + halfDividends).netTax;
    
    rawTaxLiabilityOnDividends = (singleCombinedTax - singleOtherTax) * 2;
    finalTaxLiability = rawTaxLiabilityOnDividends - frankingCredits;
    totalIncomeWithDividends = otherTaxableIncome + grossedUpDividends;
  } 
  else if (holdingEntity === 'SMSF') {
    // Self-Managed Super Fund (Accumulation phase flat tax rate of 15% on income, no Medicare levy)
    rawTaxLiabilityOnDividends = grossedUpDividends * 0.15;
    finalTaxLiability = rawTaxLiabilityOnDividends - frankingCredits;
    totalIncomeWithDividends = grossedUpDividends; // Separate super tax entity
  } 
  else if (holdingEntity === 'Company') {
    // Standard Base Rate Company flat tax of 25% or standard 30% (we'll use 25% base rate threshold for investment company)
    rawTaxLiabilityOnDividends = grossedUpDividends * 0.25;
    finalTaxLiability = rawTaxLiabilityOnDividends - frankingCredits;
    totalIncomeWithDividends = grossedUpDividends;
  }

  // Net Cash in Pocket after dividend tax and franking credits
  // If finalTaxLiability is negative, it's a tax refund from the ATO! This is a unique superpower of the Australian tax system.
  const netDividendIncome = rawDividends - (finalTaxLiability > 0 ? finalTaxLiability : 0) + (finalTaxLiability < 0 ? Math.abs(finalTaxLiability) : 0);
  const netDividendYield = (netDividendIncome / portfolioValue) * 100;

  // Passive Income Target calculations (FIRE Plan)
  const annualTargetIncome = monthlyTargetIncome * 12;
  // Capital needed to generate target cash flow based on Net Yield
  const targetPortfolioNeeded = netDividendYield > 0 ? (annualTargetIncome / (netDividendYield / 100)) : 0;
  
  // Calculate years to reach target with current portfolio & monthly contributions at a nominal 8% compound growth rate
  const annualGrowthRate = 0.08;
  const monthlyRate = Math.pow(1 + annualGrowthRate, 1 / 12) - 1;
  
  let yearsToTarget = 0;
  if (targetPortfolioNeeded > portfolioValue && monthlySavings > 0) {
    let tempBalance = portfolioValue;
    let months = 0;
    while (tempBalance < targetPortfolioNeeded && months < 600) { // Limit to 50 years max
      tempBalance = (tempBalance * (1 + monthlyRate)) + monthlySavings;
      months++;
    }
    yearsToTarget = parseFloat((months / 12).toFixed(1));
  }

  // Recharts Data
  const taxScenarioData = [
    {
      name: 'Dividends & Franking',
      'Cash Distributed': Math.round(rawDividends),
      'Franking Credits': Math.round(frankingCredits),
      'ATO Tax / Credit Offset': Math.round(finalTaxLiability),
      'Net Cash Kept': Math.round(netDividendIncome)
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 translate-y-16 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
            <Calculator className="w-6 h-6" />
          </span>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 font-black uppercase self-start">
            ASX Specific
          </span>
        </div>
        
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">Dividend Tax & Franking Credit Refund Estimator</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-3xl">
          Australian dividends carry a unique superpower: **Franking Credits**. Analyze your net payouts, compute ATO Stage 3 marginal tax brackets, model different investment entities, and map your path to financial independence.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Dynamic Inputs */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-slate-900 text-base">Model Variables</h3>
          </div>

          {/* Input 1: Portfolio Size */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-500">Portfolio Market Value</span>
              <span className="font-mono font-black text-slate-900">${portfolioValue.toLocaleString()} AUD</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
              <input 
                type="number"
                value={portfolioValue}
                onChange={(e) => setPortfolioValue(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-slate-800"
              />
            </div>
            <input 
              type="range"
              min="10000"
              max="2000000"
              step="10000"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Input 2: Holding Entity Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Holding Entity Structure</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Individual', 'Joint', 'SMSF', 'Company'] as HoldingEntity[]).map((entity) => (
                <button
                  key={entity}
                  onClick={() => setHoldingEntity(entity)}
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
                    holdingEntity === entity 
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-extrabold' 
                      : 'border-slate-200 bg-slate-50/40 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">{entity}</span>
                  <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
                    {entity === 'Individual' && 'Marginal rates'}
                    {entity === 'Joint' && 'Split tax bracket'}
                    {entity === 'SMSF' && '15% Flat super tax'}
                    {entity === 'Company' && '25% Flat rate'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input 3: Other Taxable Income (Conditional on Individual/Joint) */}
          {(holdingEntity === 'Individual' || holdingEntity === 'Joint') && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-500">
                  {holdingEntity === 'Joint' ? 'Combined Other Taxable Income' : 'Personal Taxable Income (Salary)'}
                </span>
                <span className="font-mono font-black text-slate-900">${otherTaxableIncome.toLocaleString()} p.a.</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                <input 
                  type="number"
                  value={otherTaxableIncome}
                  onChange={(e) => setOtherTaxableIncome(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-slate-800"
                />
              </div>
              <input 
                type="range"
                min="0"
                max="300000"
                step="5000"
                value={otherTaxableIncome}
                onChange={(e) => setOtherTaxableIncome(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          )}

          {/* Dividend Inputs */}
          <div className="grid grid-cols-2 gap-4">
            {/* Yield */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Blended Yield %</label>
              <div className="relative">
                <input 
                  type="number"
                  step="0.1"
                  value={dividendYield}
                  onChange={(e) => setDividendYield(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-black text-slate-800"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            {/* Franking */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Franking Share %</label>
              <div className="relative">
                <input 
                  type="number"
                  min="0"
                  max="100"
                  value={frankingLevel}
                  onChange={(e) => setFrankingLevel(Math.min(100, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-black text-slate-800"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-500 leading-normal">
            <span className="font-extrabold text-slate-700 block mb-1">💡 What are Franking Credits?</span>
            Australian corporations pay 30% corporate tax before distributing dividends. A "100% Franked" dividend means the corporation has already paid tax on your behalf, sending you a "franked offset" credit. At tax time, this offset reduces your personal tax bill. If your personal rate is below 30%, the ATO refunds the difference directly in cash!
          </div>

        </div>

        {/* Right Column: Calculations and Visual Outcomes */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6 flex flex-col justify-between">
          
          <div className="space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <Scale className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-900 text-base">ATO Taxation Outcome & Yield Boost</h3>
            </div>

            {/* Key Summary Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Gross Distributed</span>
                <span className="text-base font-black text-slate-900 block mt-0.5">${Math.round(rawDividends).toLocaleString()} p.a.</span>
                <span className="text-[9px] text-slate-400 font-bold block">excluding franking</span>
              </div>

              <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-150">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">ATO Offset Offset</span>
                <span className="text-base font-black text-indigo-600 block mt-0.5">+${Math.round(frankingCredits).toLocaleString()} p.a.</span>
                <span className="text-[9px] text-slate-400 font-bold block">franking tax credits</span>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-150">
                <span className="text-[9px] text-emerald-800 font-black uppercase tracking-wider">Blended Net Kept</span>
                <span className="text-base font-black text-emerald-600 block mt-0.5">${Math.round(netDividendIncome).toLocaleString()} p.a.</span>
                <span className="text-[9px] text-emerald-800 font-bold block">
                  {finalTaxLiability < 0 ? 'includes cash refund!' : 'after tax paid'}
                </span>
              </div>

            </div>

            {/* Comparison Bar Chart */}
            <div className="h-[180px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taxScenarioData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} fontStyle="bold" stroke="#94a3b8" />
                  <YAxis fontSize={10} fontStyle="bold" stroke="#94a3b8" tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    formatter={(val) => [`$${val.toLocaleString()}`, '']}
                    contentStyle={{ borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                  <Bar dataKey="Cash Distributed" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Franking Credits" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Net Cash Kept" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tax breakdown message */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>ATO Tax Calculation Summary</span>
              </h4>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Grossed-up income taxable by ATO:</span>
                  <span className="font-mono font-semibold">${Math.round(grossedUpDividends).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Base tax on this portion:</span>
                  <span className="font-mono font-semibold">${Math.round(rawTaxLiabilityOnDividends).toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1 mt-1 font-black">
                  <span className="text-slate-800">Final ATO Tax Liability / Net Offset:</span>
                  <span className={finalTaxLiability < 0 ? 'text-emerald-600' : 'text-amber-600'}>
                    {finalTaxLiability < 0 
                      ? `-$${Math.round(Math.abs(finalTaxLiability)).toLocaleString()} ATO CASH REFUND` 
                      : `$${Math.round(finalTaxLiability).toLocaleString()} PAYABLE`}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Module: Passive Income Goal Planner */}
          <div className="border-t border-slate-100 pt-4 space-y-4">
            <h4 className="font-black text-slate-950 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" />
              FIRE Goals & Passive Income Milestone Planner
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Savings goal inputs */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-500">Target Passive Income</span>
                    <span className="font-mono font-black text-slate-900">${monthlyTargetIncome.toLocaleString()}/mo</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                    <input 
                      type="number"
                      value={monthlyTargetIncome}
                      onChange={(e) => setMonthlyTargetIncome(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-1 pl-6 pr-3 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-500">Monthly Contribution</span>
                    <span className="font-mono font-black text-slate-900">${monthlySavings.toLocaleString()}/mo</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                    <input 
                      type="number"
                      value={monthlySavings}
                      onChange={(e) => setMonthlySavings(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-lg py-1 pl-6 pr-3 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Target Milestones */}
              <div className="bg-indigo-900 text-white rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-indigo-200 font-black uppercase tracking-wider block">Target Portfolio Size Needed</span>
                  <span className="text-xl font-black text-white block mt-0.5">${Math.round(targetPortfolioNeeded).toLocaleString()}</span>
                  <p className="text-[10px] text-indigo-200 font-medium leading-relaxed mt-1">
                    Based on your calculated **{netDividendYield.toFixed(2)}% net blended yield**, you need this portfolio size to deliver **${monthlyTargetIncome.toLocaleString()} monthly cash pocket-money** after all income taxes.
                  </p>
                </div>

                <div className="border-t border-indigo-800/80 pt-2 mt-2 flex justify-between items-center text-xs">
                  <span className="text-indigo-200 font-medium">Estimated Timeframe:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm bg-indigo-950 px-2 py-0.5 rounded-md">
                    {yearsToTarget > 0 ? `${yearsToTarget} Years` : 'Achieved! 🎉'}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
