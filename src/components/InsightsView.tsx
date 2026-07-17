import React, { useState } from 'react';
import { 
  Info, 
  AlertCircle, 
  Percent, 
  PieChart as PieIcon, 
  TrendingDown, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  Award,
  CircleDollarSign
} from 'lucide-react';
import { ETF } from '../types';
import { checkRules } from '../data';

interface InsightsViewProps {
  watchlist: ETF[];
}

export default function InsightsView({ watchlist }: InsightsViewProps) {
  const [portfolioValue, setPortfolioValue] = useState<number>(50000);
  const [selectedEtfTicker, setSelectedEtfTicker] = useState<string>(watchlist[0]?.ticker || 'VAS');
  const [investmentSlippageAmount, setInvestmentSlippageAmount] = useState<number>(10000);

  const etfsWithSignals = watchlist.filter(e => checkRules(e).passed >= 3);

  // Total fees analysis
  const eligibleETFs = watchlist.filter(e => e.currentData.expenseRatio !== null);
  const avgExpenseRatio = eligibleETFs.reduce((acc, e) => acc + (e.currentData.expenseRatio || 0), 0) / (eligibleETFs.length || 1);

  // Highest yielding and deepest discounted
  const deepestDiscounted = [...watchlist]
    .filter(e => e.currentData.premiumDiscount !== null)
    .sort((a, b) => (a.currentData.premiumDiscount || 0) - (b.currentData.premiumDiscount || 0))[0];

  return (
    <div className="space-y-6">
      
      {/* 1. Active Buy Signals Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Info className="w-5 h-5 text-slate-950" />
          Active Buy Signals Log
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Sentinel tracks ETFs that meet 3 or more of your rules. These represent premium assets trading below fair value.
        </p>

        {etfsWithSignals.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl text-center">
            <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No Target Buy Signals Found</p>
            <p className="text-xs text-slate-500 mt-1">
              All watchlist options are currently above your configured target entry thresholds. Try updating your target settings.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {etfsWithSignals.map(etf => {
              const { results, passed, total } = checkRules(etf);
              return (
                <div 
                  key={etf.ticker} 
                  className="border border-emerald-200 bg-emerald-50/10 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-extrabold text-slate-900">{etf.ticker}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                        🎯 BUY ALERT ({passed}/{total} MET)
                      </span>
                      {etf.domicile === 'Australia' ? (
                        <span className="text-xs text-slate-400">🇦🇺 Australian Domiciled</span>
                      ) : (
                        <span className="text-xs text-slate-400">🇺🇸 US Domiciled</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-600">{etf.name}</p>
                    
                    {/* List of met rules */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs">
                      {results.ntaDiscount && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          ✓ Discount ({etf.currentData.premiumDiscount}%)
                        </span>
                      )}
                      {results.expenseRatio && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          ✓ Expense Ratio ({etf.currentData.expenseRatio}%)
                        </span>
                      )}
                      {results.fundSize && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          ✓ AuM (${etf.currentData.fundSize}M)
                        </span>
                      )}
                      {results.yield && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          ✓ Div Yield ({etf.currentData.yield}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-emerald-200/60 p-3.5 rounded-xl text-center min-w-[130px] shadow-2xs self-stretch md:self-auto flex flex-col justify-center">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Market Price</span>
                    <span className="font-mono text-base font-extrabold text-slate-800">${etf.currentData.price?.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-600 block font-bold mt-0.5">({etf.currentData.premiumDiscount}% below NTA)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Bento Grid of Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* MER Expense Calculator Block */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
          <h4 className="font-bold text-slate-950 flex items-center gap-2">
            <Percent className="w-5 h-5 text-slate-950" />
            Management Expense Ratio (MER) Calculator
          </h4>
          <p className="text-xs text-slate-500">
            Compare annual fee costs based on expense ratios. Lower fee indexes compound significantly larger savings over long holding horizons.
          </p>

          {/* Interactive Calculator Input */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-600 block">Estimated Investment Principal:</label>
              <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                ${portfolioValue.toLocaleString()} AUD
              </span>
            </div>
            <input 
              type="range" 
              min="5000" 
              max="500000" 
              step="5000"
              value={portfolioValue}
              onChange={(e) => setPortfolioValue(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$5,000</span>
              <span>$250,000</span>
              <span>$500,000</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {watchlist.map(e => {
              const fee = e.currentData.expenseRatio;
              if (fee === null) return null;
              const maxRule = e.rules.expenseRatio;
              const isFavorable = fee <= maxRule;
              const dollarCost = ((portfolioValue * fee) / 100).toFixed(0);

              return (
                <div key={e.ticker} className="space-y-1 bg-slate-50/40 p-2.5 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span className="font-mono flex items-center gap-1.5">
                      <span className="font-bold">{e.ticker}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-sm font-bold ${
                        e.domicile === 'Australia' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {e.domicile === 'Australia' ? '🇦🇺' : '🇺🇸'}
                      </span>
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {fee}% MER <span className="font-bold text-slate-950">(${dollarCost}/yr)</span>
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full ${isFavorable ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, (fee / 1) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Australia Domicile Tax Advantages Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
          <h4 className="font-bold text-slate-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Australian Domicile Tax Sentinel
          </h4>
          <p className="text-xs text-slate-500">
            Holding ETFs structured as <strong>Australian domiciled trusts</strong> provides massive operational and fiscal relief compared to foreign-domiciled listings (such as direct US funds).
          </p>

          <div className="space-y-3.5 pt-2">
            
            {/* Benefit 1 */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">No W-8BEN Tax Forms Required</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Australian-domiciled funds do not require filling out double-taxation declarations with the US IRS every 3 years.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">No US Estate Tax Vulnerability</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Protects Australian estate executors from complex US federal probate and withholding taxes on assets over $60,000 USD.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100">
                <CircleDollarSign className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Direct MyGov ATO Tax Integration</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Distributions use AMMA tax statements which pre-fill automatically into your Australian MyTax system!
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Automated Dividend Reinvestment (DRP)</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Seamlessly support compound growth via direct registrar DRP programs without currency conversions or US drag.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. Interactive Australian Buy Decision & Tax-Effective Yield Gross-Up Optimizer */}
      {watchlist.length > 0 && (
        (() => {
          const selectedEtf = watchlist.find(e => e.ticker === selectedEtfTicker) || watchlist[0];
          const yieldVal = selectedEtf?.currentData.yield || 0;
          const frankingVal = selectedEtf?.currentData.frankingCredits !== undefined && selectedEtf?.currentData.frankingCredits !== null
            ? selectedEtf.currentData.frankingCredits
            : selectedEtf?.domicile === 'Australia'
              ? selectedEtf.ticker === 'VAS' ? 72 : selectedEtf.ticker === 'A200' ? 81 : selectedEtf.ticker === 'DHHF' ? 16 : 0
              : 0;
          
          // Australian Gross-Up tax effective yield formula
          // Grossed up rate = Yield * (1 + (Franking% / 100) * 0.42857)
          const grossedUpYield = yieldVal * (1 + (frankingVal / 100) * 0.42857);
          const yieldBoost = grossedUpYield - yieldVal;

          const spreadVal = selectedEtf?.currentData.bidAskSpread !== undefined && selectedEtf?.currentData.bidAskSpread !== null
            ? selectedEtf.currentData.bidAskSpread
            : selectedEtf?.ticker === 'VAS' ? 0.03 : selectedEtf?.ticker === 'A200' ? 0.04 : selectedEtf?.ticker === 'VGS' ? 0.05 : 0.07;
          
          const slippageCost = investmentSlippageAmount * (spreadVal / 100);
          const hasDrp = selectedEtf?.currentData.drpActive !== false && selectedEtf?.domicile !== 'US';

          return (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="font-bold text-slate-950 text-lg flex items-center gap-2">
                    <CircleDollarSign className="w-5.5 h-5.5 text-slate-950" />
                    Buy Sentinel: Tax-Effective Yield &amp; Slippage Optimizer
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Calculate true grossed-up dividend yields from Australian franking credits and estimate entry slippage costs.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <label className="text-xs font-bold text-slate-600">Analyze ETF:</label>
                  <select
                    value={selectedEtfTicker}
                    onChange={(e) => setSelectedEtfTicker(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-hidden focus:bg-white focus:border-slate-950 transition"
                  >
                    {watchlist.map(e => (
                      <option key={e.ticker} value={e.ticker}>{e.ticker} - {e.name.split(' ')[0]}...</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Inputs & Settings column */}
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/60 space-y-4">
                  <span className="text-xs font-extrabold text-slate-700 block uppercase tracking-wider">Investment Parameters</span>
                  
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Investment Size:</span>
                      <span className="font-mono text-slate-950 font-bold">${investmentSlippageAmount.toLocaleString()} AUD</span>
                    </div>
                    <input 
                      type="range" 
                      min="1000" 
                      max="100000" 
                      step="1000"
                      value={investmentSlippageAmount}
                      onChange={(e) => setInvestmentSlippageAmount(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-950"
                    />
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>$1,000</span>
                      <span>$50,000</span>
                      <span>$100,000</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">ETF Structure:</span>
                      <span className="font-semibold text-slate-800">{selectedEtf?.domicile} Domiciled</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Declared Div Yield:</span>
                      <span className="font-mono font-bold text-slate-800">{yieldVal.toFixed(2)}% p.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Franking Credit Level:</span>
                      <span className="font-mono font-bold text-slate-800">{frankingVal}% Franked</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Average Bid-Ask Spread:</span>
                      <span className="font-mono font-bold text-slate-800">{spreadVal.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                {/* Grossed-Up Dividend Yield Display column */}
                <div className="border border-slate-150 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <Award className="w-4 h-4 text-emerald-600" />
                      True Tax-Effective Yield
                    </div>
                    <p className="text-xs text-slate-400">
                      Franking credits prevent double-taxing by attaching corporate taxes already paid directly to your dividend.
                    </p>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-center space-y-1">
                    <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest">Grossed-Up Yield</span>
                    <span className="block font-mono text-3xl font-extrabold text-emerald-800">
                      {grossedUpYield.toFixed(2)}%
                    </span>
                    {yieldBoost > 0 ? (
                      <span className="text-[11px] text-emerald-700 font-semibold block">
                        Includes <span className="font-mono">+{yieldBoost.toFixed(2)}%</span> Franking Tax Bonus
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-semibold block">
                        No franking credits (International asset)
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 italic leading-relaxed">
                    *Based on standard 30% Australian company tax gross-up rates. Ideal for middle/upper ATO individual tax brackets.
                  </p>
                </div>

                {/* Entry Cost & Slippage Drag column */}
                <div className="border border-slate-150 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                      <TrendingDown className="w-4 h-4 text-amber-600" />
                      Buy Liquidity &amp; Slippage Cost
                    </div>
                    <p className="text-xs text-slate-400">
                      Market spreads represent the hidden cost of executing trades. High spreads eat into day-one investment returns.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 text-center space-y-1 border border-slate-150">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Estimated Spread Drag</span>
                    <span className="block font-mono text-3xl font-extrabold text-slate-800">
                      ${slippageCost.toFixed(2)}
                    </span>
                    <span className={`text-[11px] font-semibold block ${spreadVal <= 0.05 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {spreadVal <= 0.05 ? '⚡ Excellent Liquidity' : '⚠️ Moderate Liquidity Drag'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/50 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Auto DRP Compounding:</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${hasDrp ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {hasDrp ? '✓ Supported' : '✗ Manual Only'}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          );
        })()
      )}

    </div>
  );
}
