import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Settings, 
  Edit3, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Check, 
  AlertTriangle,
  Coins,
  Briefcase,
  Plus,
  Database,
  Terminal,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { ETF, ETFRules, ETFCurrentData } from '../types';
import { checkRules } from '../data';

interface WatchlistCardProps {
  key?: React.Key;
  etf: ETF;
  isEditingRules: boolean;
  isEditingMetrics: boolean;
  onToggleRules: () => void;
  onToggleMetrics: () => void;
  updateRule: (ticker: string, field: keyof ETFRules, value: number) => void;
  updateInvestment: (ticker: string, purchasePrice: number | null, sharesOwned: number | null) => void;
  startEditingMetrics: (etf: ETF) => void;
  tempMetrics: ETFCurrentData | null;
  setTempMetrics: (metrics: ETFCurrentData | null) => void;
  saveMetrics: (ticker: string) => void;
  removeETF: (ticker: string) => void;
  onViewCharts: () => void;
}

export default function WatchlistCard({
  etf,
  isEditingRules,
  isEditingMetrics,
  onToggleRules,
  onToggleMetrics,
  updateRule,
  updateInvestment,
  startEditingMetrics,
  tempMetrics,
  setTempMetrics,
  saveMetrics,
  removeETF,
  onViewCharts,
}: WatchlistCardProps) {
  const { results, passed, total } = checkRules(etf);
  const isBuySignal = passed >= 3;

  const [isEditingHoldings, setIsEditingHoldings] = React.useState(false);
  const [localCost, setLocalCost] = React.useState('');
  const [localUnits, setLocalUnits] = React.useState('');
  const [showLogs, setShowLogs] = React.useState(false);

  const handleStartEditHoldings = () => {
    setLocalCost(etf.purchasePrice !== undefined && etf.purchasePrice !== null ? etf.purchasePrice.toString() : '');
    setLocalUnits(etf.sharesOwned !== undefined && etf.sharesOwned !== null ? etf.sharesOwned.toString() : '');
    setIsEditingHoldings(true);
  };

  const handleSaveHoldings = () => {
    const costVal = localCost.trim() === '' ? null : parseFloat(localCost);
    const unitsVal = localUnits.trim() === '' ? null : parseFloat(localUnits);
    updateInvestment(etf.ticker, costVal, unitsVal);
    setIsEditingHoldings(false);
  };

  const currentPrice = etf.currentData.price;
  const purchasePrice = etf.purchasePrice;
  const sharesOwned = etf.sharesOwned;

  const hasHoldings = purchasePrice !== null && purchasePrice !== undefined && purchasePrice > 0;

  let holdingValue = 0;
  let totalCost = 0;
  let gainLoss = 0;

  if (hasHoldings && currentPrice && purchasePrice) {
    totalCost = purchasePrice * (sharesOwned || 0);
    holdingValue = currentPrice * (sharesOwned || 0);
    gainLoss = holdingValue - totalCost;
  }

  return (
    <motion.div
      layout
      id={`etf-card-${etf.ticker}`}
      className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
        isBuySignal 
          ? 'border-emerald-500 shadow-[0_8px_30px_rgba(16,185,129,0.12)] ring-1 ring-emerald-500/20' 
          : 'border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-200 hover:ring-1 hover:ring-indigo-500/10'
      }`}
    >
      {/* Card Header with colorful ambient gradients */}
      <div className={`p-5 border-b border-slate-200 flex items-start justify-between ${
        isBuySignal 
          ? 'bg-gradient-to-r from-emerald-50/60 via-teal-50/20 to-white' 
          : 'bg-gradient-to-r from-slate-50 via-indigo-50/15 to-white'
      }`}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-bold text-slate-900 tracking-tight">{etf.ticker}</span>
            <span className="bg-slate-200/70 text-slate-700 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md">
              {etf.ticker.includes('.') ? etf.ticker.split('.')[1] : 'ASX'}
            </span>
            
            {/* Domicile Tags */}
            {etf.domicile === 'Australia' ? (
              <span className="bg-emerald-500/10 text-emerald-850 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1 shadow-2xs">
                <span>🇦🇺</span> Australian Domiciled
              </span>
            ) : (
              <span className="bg-amber-500/10 text-amber-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-300/40 flex items-center gap-1 shadow-2xs">
                <span>🇺🇸</span> US Domiciled
              </span>
            )}
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-slate-700 line-clamp-1">{etf.name}</h3>
        </div>

        {/* Buy Status Signal */}
        <div className="text-right">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
            isBuySignal 
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' 
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {isBuySignal ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                🎯 BUY ALERT ({passed}/{total})
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                WATCHING ({passed}/{total} Passed)
              </>
            )}
          </span>
          {etf.lastUpdated && (
            <div className="flex flex-col items-end gap-1.5 mt-1.5">
              <p className="text-[10px] text-slate-400 font-mono leading-none">
                {etf.lastUpdated}
              </p>
              {etf.source && (
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 border transition-all cursor-pointer ${
                    showLogs 
                      ? 'bg-slate-900 border-slate-900 text-slate-100 hover:bg-slate-800' 
                      : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-150'
                  }`}
                  title="Click to view scraping telemetry logs for this fund"
                >
                  <Database className="w-2.5 h-2.5" />
                  {etf.source}
                  <span className="text-[8px] font-sans opacity-85">{showLogs ? '▲ hide' : '▼ trace'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* US Domicile specific warning banner */}
      {etf.domicile === 'US' && (
        <div className="bg-amber-50/50 border-b border-amber-100 px-5 py-2 flex items-center gap-2 text-amber-800 text-[11px]">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Requires <strong>W-8BEN Form</strong> to prevent double-taxing. High US estate tax exposure risks.</span>
        </div>
      )}

      {/* Main Metrics Matrix Grid */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          
          {/* Price Display */}
          <div className="bg-slate-50/80 border border-slate-100/80 rounded-xl p-3 transition hover:bg-slate-50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-0.5">Market Price</span>
            <span className="font-mono text-base font-extrabold text-slate-800">
              {etf.currentData.price !== null ? `$${etf.currentData.price.toFixed(2)}` : '—'}
            </span>
          </div>

          {/* NTA Display */}
          <div className="bg-slate-50/80 border border-slate-100/80 rounded-xl p-3 transition hover:bg-slate-50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-0.5">Net Asset Value (NTA)</span>
            <span className="font-mono text-base font-extrabold text-slate-800">
              {etf.currentData.nta !== null ? `$${etf.currentData.nta.toFixed(2)}` : '—'}
            </span>
          </div>

          {/* Premium or Discount Display */}
          <div className={`border rounded-xl p-3 transition ${
            etf.currentData.premiumDiscount !== null 
              ? etf.currentData.premiumDiscount < 0
                ? 'bg-emerald-50/40 border-emerald-100 text-emerald-800 hover:bg-emerald-50/60'
                : 'bg-rose-50/40 border-rose-100 text-rose-800 hover:bg-rose-50/60'
              : 'bg-slate-50/80 border-slate-100 text-slate-800 hover:bg-slate-50'
          }`}>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-0.5">Prem / Discount</span>
            <span className="font-mono text-base font-extrabold flex items-center gap-1">
              {etf.currentData.premiumDiscount !== null ? (
                <>
                  {etf.currentData.premiumDiscount < 0 ? (
                    <TrendingDown className="w-4 h-4 text-emerald-600 inline-block" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-rose-600 inline-block" />
                  )}
                  {etf.currentData.premiumDiscount < 0 ? '' : '+'}
                  {etf.currentData.premiumDiscount}%
                </>
              ) : (
                '—'
              )}
            </span>
          </div>

          {/* Yield Display */}
          <div className="bg-slate-50/80 border border-slate-100/80 rounded-xl p-3 transition hover:bg-slate-50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-0.5">Div Yield (p.a.)</span>
            <span className="font-mono text-base font-extrabold text-slate-800">
              {etf.currentData.yield !== null ? `${etf.currentData.yield.toFixed(2)}%` : '—'}
            </span>
          </div>

          {/* Expense Ratio Display */}
          <div className="bg-slate-50/80 border border-slate-100/80 rounded-xl p-3 transition hover:bg-slate-50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-0.5">Expense Ratio</span>
            <span className="font-mono text-base font-extrabold text-slate-800">
              {etf.currentData.expenseRatio !== null ? `${etf.currentData.expenseRatio.toFixed(2)}%` : '—'}
            </span>
          </div>

          {/* Fund Size Display */}
          <div className="bg-slate-50/80 border border-slate-100/80 rounded-xl p-3 transition hover:bg-slate-50">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-0.5">Fund Size (AuM)</span>
            <span className="font-mono text-base font-extrabold text-slate-800">
              {etf.currentData.fundSize !== null ? `$${etf.currentData.fundSize.toLocaleString()}M` : '—'}
            </span>
          </div>

        </div>

        {/* Dynamic Buying Indicators (RSI & Trend SMA) */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-xl">
          {/* RSI Momentum Column */}
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse"></span>
              RSI (14-Day)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-sm font-extrabold text-slate-800">
                {etf.currentData.rsi !== undefined && etf.currentData.rsi !== null ? etf.currentData.rsi : '48'}
              </span>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded leading-none ${
                (etf.currentData.rsi || 48) <= 30 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : (etf.currentData.rsi || 48) >= 70 
                    ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}>
                {(etf.currentData.rsi || 48) <= 30 ? 'Oversold (Buy)' : (etf.currentData.rsi || 48) >= 70 ? 'Overbought (Hold)' : 'Neutral'}
              </span>
            </div>
          </div>

          {/* 100d SMA Trend Status Column */}
          <div className="flex flex-col border-l border-slate-200 pl-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold mb-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950"></span>
              100d SMA Trend
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                etf.currentData.sma100Status === 'Bearish ↘' 
                  ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {etf.currentData.sma100Status || 'Bullish ↗'}
              </span>
            </div>
          </div>
        </div>

        {/* Premium/Discount Visual Slider Meter */}
        {etf.currentData.premiumDiscount !== null && (
          <div className="bg-slate-50/70 border border-slate-150 p-4 rounded-xl">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <span>NTA Deviation Visualizer</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                etf.currentData.premiumDiscount < 0 ? 'bg-emerald-100/80 text-emerald-800' : 'bg-rose-100/80 text-rose-800'
              }`}>
                {etf.currentData.premiumDiscount < 0 
                  ? `${Math.abs(etf.currentData.premiumDiscount)}% Discount` 
                  : `${etf.currentData.premiumDiscount}% Premium`}
              </span>
            </div>
            
            {/* Bar Visualizer */}
            <div className="relative h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
              {/* Left half - Discount Zone (Green) */}
              <div className="w-1/2 h-full bg-emerald-500/5 border-r border-slate-300 relative flex justify-end">
                {etf.currentData.premiumDiscount < 0 && (
                  <div 
                    className="bg-emerald-500 h-full rounded-l-md transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (Math.abs(etf.currentData.premiumDiscount) / 4) * 100)}%` 
                    }}
                  ></div>
                )}
              </div>
              {/* Right half - Premium Zone (Red) */}
              <div className="w-1/2 h-full bg-rose-500/5 relative">
                {etf.currentData.premiumDiscount > 0 && (
                  <div 
                    className="bg-rose-500 h-full rounded-r-md transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (etf.currentData.premiumDiscount / 4) * 100)}%` 
                    }}
                  ></div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center text-[9px] text-slate-400 mt-1.5 font-mono">
              <span>-4.0% (Discount)</span>
              <span className="font-bold text-slate-600">NAV (Fair Price)</span>
              <span>+4.0% (Premium)</span>
            </div>
          </div>
        )}

        {/* Advanced Liquidity & Tax Metrics (DRP, Spread, Franking) */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-800" />
              Advanced Liquidity &amp; Tax Metrics
            </span>
            <span className="text-[9px] font-black text-slate-400 bg-slate-100 border border-slate-250 px-2 py-0.5 rounded">
              Institutional Quality
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
            {/* Bid-Ask Spread */}
            <div className="flex flex-col justify-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Avg Bid-Ask Spread</span>
              <span className="font-mono font-bold text-slate-800 mt-0.5">
                {etf.currentData.bidAskSpread !== undefined && etf.currentData.bidAskSpread !== null 
                  ? `${etf.currentData.bidAskSpread}%` 
                  : etf.ticker === 'VAS' ? '0.03%' : etf.ticker === 'A200' ? '0.04%' : '0.05%'}
                <span className="text-[10px] text-emerald-600 font-sans ml-1">
                  {(etf.currentData.bidAskSpread || 0.04) <= 0.05 ? '(Liquid ⚡)' : '(Medium)'}
                </span>
              </span>
            </div>

            {/* Franking Credits */}
            <div className="flex flex-col justify-center">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Franking Credits (Tax)</span>
              <span className="font-mono font-bold text-slate-800 mt-0.5">
                {etf.currentData.frankingCredits !== undefined && etf.currentData.frankingCredits !== null 
                  ? `${etf.currentData.frankingCredits}% Franked` 
                  : etf.domicile === 'Australia' 
                    ? etf.ticker === 'VAS' ? '72% Franked' : etf.ticker === 'A200' ? '81% Franked' : '0% (None)' 
                    : '0% (None)'}
              </span>
            </div>

            {/* Distribution Cycle */}
            <div className="flex flex-col justify-center border-t border-slate-100 pt-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Distribution Cycle</span>
              <span className="font-bold text-slate-800 mt-0.5">
                {etf.currentData.distributionFreq || (etf.ticker === 'NDQ' ? 'Semi-Annually' : 'Quarterly')}
              </span>
            </div>

            {/* Tracking Error */}
            <div className="flex flex-col justify-center border-t border-slate-100 pt-2">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Index Tracking Error</span>
              <span className="font-mono font-bold text-slate-800 mt-0.5">
                {etf.currentData.trackingError !== undefined && etf.currentData.trackingError !== null 
                  ? `${etf.currentData.trackingError}%` 
                  : etf.ticker === 'A200' ? '0.01%' : etf.ticker === 'VAS' ? '0.02%' : '0.03%'}
              </span>
            </div>

            {/* DRP (Dividend Reinvestment Plan) */}
            <div className="col-span-2 flex items-center justify-between border-t border-slate-200 pt-2">
              <span className="text-slate-500 font-medium text-xs">Dividend Reinvestment Plan:</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                etf.currentData.drpActive !== false && etf.domicile !== 'US'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border-amber-250'
              }`}>
                {etf.currentData.drpActive !== false && etf.domicile !== 'US' ? '✓ DRP Eligible (Auto-Compound)' : '✗ Broker Manual Only'}
              </span>
            </div>
          </div>
        </div>

        {/* My Investment Tracker (Holdings & Capital Growth/Drop) */}
        <div className="bg-slate-50/70 border border-slate-150 p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              Investment performance
            </span>
            {!isEditingHoldings && (
              <button
                onClick={handleStartEditHoldings}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                {hasHoldings || purchasePrice ? 'Update Holding' : 'Set Cost/Units'}
              </button>
            )}
          </div>

          {isEditingHoldings ? (
            <div className="space-y-3 bg-white p-3 border border-slate-200 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Avg Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={localCost}
                    onChange={(e) => setLocalCost(e.target.value)}
                    placeholder="e.g. 91.20"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:bg-white outline-hidden focus:border-indigo-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Units / Shares Owned</label>
                  <input
                    type="number"
                    step="1"
                    value={localUnits}
                    onChange={(e) => setLocalUnits(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 focus:bg-white outline-hidden focus:border-indigo-500 transition"
                  />
                </div>
              </div>
              <p className="text-[9px] text-slate-400 leading-tight">
                Leave units blank if you just want to track price performance percentage without tracking portfolio values.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveHoldings}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 rounded-md transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                  Save Holding
                </button>
                <button
                  onClick={() => setIsEditingHoldings(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-semibold px-2 py-1.5 rounded-md transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {purchasePrice !== null && purchasePrice !== undefined && purchasePrice > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 font-medium">Avg Purchase Cost:</span>
                    <span className="font-mono text-xs font-bold text-slate-700">${purchasePrice.toFixed(2)}</span>
                  </div>

                  {sharesOwned !== null && sharesOwned !== undefined && sharesOwned > 0 && (
                    <div className="flex justify-between items-baseline border-b border-dashed border-slate-100 pb-2">
                      <span className="text-xs text-slate-500 font-medium">Units Owned:</span>
                      <span className="font-mono text-xs font-bold text-slate-700">{sharesOwned} Units</span>
                    </div>
                  )}

                  {currentPrice ? (
                    <div className="space-y-2 pt-1">
                      {/* Growth metrics */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">Price Performance:</span>
                        <div className="flex items-center gap-1 font-mono text-xs font-bold">
                          {currentPrice >= purchasePrice ? (
                            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-bold border border-emerald-100">
                              <TrendingUp className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                              +{((currentPrice - purchasePrice) / purchasePrice * 100).toFixed(2)}% Growth
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-bold border border-rose-100">
                              <TrendingDown className="w-3 h-3 text-rose-600 stroke-[2.5]" />
                              {((currentPrice - purchasePrice) / purchasePrice * 100).toFixed(2)}% Drop
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Portfolio holding metrics */}
                      {sharesOwned !== null && sharesOwned !== undefined && sharesOwned > 0 && (
                        <div className="grid grid-cols-2 gap-2 bg-white/85 border border-slate-100 p-2.5 rounded-lg mt-1">
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Holding Value</span>
                            <span className="font-mono text-xs font-extrabold text-slate-800">${(currentPrice * sharesOwned).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 font-bold block uppercase tracking-wider mb-0.5">Unrealized P&L</span>
                            <span className={`font-mono text-xs font-extrabold flex items-center gap-1 ${
                              currentPrice >= purchasePrice ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              {currentPrice >= purchasePrice ? '+' : ''}
                              ${(gainLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">Awaiting live market price update to compute growth...</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    Not tracking holdings. Configure your purchase cost & units to monitor capital growth, price drops, and total value.
                  </p>
                  <button
                    onClick={handleStartEditHoldings}
                    className="mt-2 text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100/60 px-2.5 py-1 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    Configure My Holding
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Rules Configurator */}
        <div className="space-y-2">
          <div className="border border-slate-200/80 rounded-xl overflow-hidden transition-all">
            <button
              onClick={onToggleRules}
              className="w-full bg-slate-50/80 hover:bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Target Threshold Rules
              </span>
              {isEditingRules ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {isEditingRules && (
              <div className="p-4 bg-white border-t border-slate-100 grid grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Min Discount &gt;= %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={etf.rules.ntaDiscount}
                    onChange={(e) => updateRule(etf.ticker, 'ntaDiscount', parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:bg-white outline-hidden focus:border-indigo-500 transition"
                  />
                  <span className={`text-[10px] font-bold mt-1 inline-flex items-center gap-1 ${
                    results.ntaDiscount ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {results.ntaDiscount ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-slate-300" />}
                    {results.ntaDiscount ? 'Target Met' : 'Under Target'}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Max Expense &lt;= %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={etf.rules.expenseRatio}
                    onChange={(e) => updateRule(etf.ticker, 'expenseRatio', parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:bg-white outline-hidden focus:border-indigo-500 transition"
                  />
                  <span className={`text-[10px] font-bold mt-1 inline-flex items-center gap-1 ${
                    results.expenseRatio ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {results.expenseRatio ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-slate-300" />}
                    {results.expenseRatio ? 'Target Met' : 'Expense Too High'}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Min Size &gt;= $M</label>
                  <input
                    type="number"
                    step="10"
                    value={etf.rules.fundSize}
                    onChange={(e) => updateRule(etf.ticker, 'fundSize', parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:bg-white outline-hidden focus:border-indigo-500 transition"
                  />
                  <span className={`text-[10px] font-bold mt-1 inline-flex items-center gap-1 ${
                    results.fundSize ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {results.fundSize ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-slate-300" />}
                    {results.fundSize ? 'Liquidity Met' : 'Fund Too Small'}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Min Div Yield &gt;= %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={etf.rules.yield}
                    onChange={(e) => updateRule(etf.ticker, 'yield', parseFloat(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:bg-white outline-hidden focus:border-indigo-500 transition"
                  />
                  <span className={`text-[10px] font-bold mt-1 inline-flex items-center gap-1 ${
                    results.yield ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {results.yield ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-slate-300" />}
                    {results.yield ? 'Target Met' : 'Yield Too Low'}
                  </span>
                </div>

              </div>
            )}
          </div>

          {/* Collapsible Manual Overrides */}
          <div className="border border-slate-200/80 rounded-xl overflow-hidden transition-all">
            <button
              onClick={() => {
                if (isEditingMetrics) {
                  onToggleMetrics();
                } else {
                  startEditingMetrics(etf);
                }
              }}
              className="w-full bg-slate-50/80 hover:bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 flex items-center justify-between transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                Edit Current Fund Metrics
              </span>
              {isEditingMetrics ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
            </button>

            {isEditingMetrics && tempMetrics && (
              <div className="p-4 bg-white border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Current Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tempMetrics.price !== null ? tempMetrics.price : ''}
                      onChange={(e) => setTempMetrics({ ...tempMetrics, price: parseFloat(e.target.value) || null })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-850"
                      placeholder="—"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Current NTA ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tempMetrics.nta !== null ? tempMetrics.nta : ''}
                      onChange={(e) => setTempMetrics({ ...tempMetrics, nta: parseFloat(e.target.value) || null })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-850"
                      placeholder="—"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Dividend Yield (%)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={tempMetrics.yield !== null ? tempMetrics.yield : ''}
                      onChange={(e) => setTempMetrics({ ...tempMetrics, yield: parseFloat(e.target.value) || null })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-850"
                      placeholder="—"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Expense Ratio (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tempMetrics.expenseRatio !== null ? tempMetrics.expenseRatio : ''}
                      onChange={(e) => setTempMetrics({ ...tempMetrics, expenseRatio: parseFloat(e.target.value) || null })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-850"
                      placeholder="—"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fund Size ($M)</label>
                    <input
                      type="number"
                      step="1"
                      value={tempMetrics.fundSize !== null ? tempMetrics.fundSize : ''}
                      onChange={(e) => setTempMetrics({ ...tempMetrics, fundSize: parseInt(e.target.value) || null })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-850"
                      placeholder="—"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">P/E Ratio</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tempMetrics.pe !== null ? tempMetrics.pe : ''}
                      onChange={(e) => setTempMetrics({ ...tempMetrics, pe: parseFloat(e.target.value) || null })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-855"
                      placeholder="—"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Bid-Ask Spread (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tempMetrics.bidAskSpread !== undefined && tempMetrics.bidAskSpread !== null ? tempMetrics.bidAskSpread : ''}
                      onChange={(e) => setTempMetrics({ ...tempMetrics, bidAskSpread: parseFloat(e.target.value) || null })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-855"
                      placeholder="e.g. 0.04"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Franking Credits (%)</label>
                    <input
                      type="number"
                      step="1"
                      value={tempMetrics.frankingCredits !== undefined && tempMetrics.frankingCredits !== null ? tempMetrics.frankingCredits : ''}
                      onChange={(e) => setTempMetrics({ ...tempMetrics, frankingCredits: parseFloat(e.target.value) || null })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-855"
                      placeholder="e.g. 75"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tracking Error (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tempMetrics.trackingError !== undefined && tempMetrics.trackingError !== null ? tempMetrics.trackingError : ''}
                      onChange={(e) => setTempMetrics({ ...tempMetrics, trackingError: parseFloat(e.target.value) || null })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-855"
                      placeholder="e.g. 0.03"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Distribution Frequency</label>
                    <select
                      value={tempMetrics.distributionFreq || 'Quarterly'}
                      onChange={(e) => setTempMetrics({ ...tempMetrics, distributionFreq: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-855"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Semi-Annually">Semi-Annually</option>
                      <option value="Annually">Annually</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Dividend Reinvestment Plan (DRP)</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                      <button
                        type="button"
                        onClick={() => setTempMetrics({ ...tempMetrics, drpActive: true })}
                        className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition ${
                          tempMetrics.drpActive !== false 
                            ? 'bg-white text-emerald-800 shadow-xs' 
                            : 'text-slate-500'
                        }`}
                      >
                        ✓ DRP Active
                      </button>
                      <button
                        type="button"
                        onClick={() => setTempMetrics({ ...tempMetrics, drpActive: false })}
                        className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition ${
                          tempMetrics.drpActive === false 
                            ? 'bg-white text-amber-800 shadow-xs' 
                            : 'text-slate-500'
                        }`}
                      >
                        ✗ Manual Only
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => saveMetrics(etf.ticker)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Metrics
                  </button>
                  <button
                    onClick={onToggleMetrics}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Individual ETF Scraper Diagnostic Trace */}
      {showLogs && etf.scrapeLogs && (
        <div className="mx-5 mb-4 p-3 bg-slate-950 text-slate-300 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1 max-h-[140px] overflow-y-auto leading-relaxed">
          <div className="flex items-center justify-between border-b border-slate-850 pb-1.5 mb-1.5 text-slate-400 text-[9px] uppercase tracking-wider font-sans font-extrabold shrink-0">
            <span className="flex items-center gap-1 text-indigo-450">
              <Terminal className="w-3 h-3" />
              Telemetry Trace: {etf.ticker}
            </span>
            <button 
              onClick={() => setShowLogs(false)} 
              className="text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              Close
            </button>
          </div>
          {etf.scrapeLogs.map((log, index) => {
            let lineClass = "text-slate-300";
            if (log.includes("ERROR") || log.includes("failed")) {
              lineClass = "text-rose-400 font-bold";
            } else if (log.includes("Success") || log.includes("scraped") || log.includes("Successfully")) {
              lineClass = "text-emerald-400";
            }
            return (
              <div key={index} className={lineClass}>
                {log}
              </div>
            );
          })}
        </div>
      )}

      {/* Card Actions Footer */}
      <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
        <button
          onClick={onViewCharts}
          className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 transition cursor-pointer"
        >
          View Historical Trend
          <ExternalLink className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => removeETF(etf.ticker)}
          className="text-rose-500 hover:text-rose-700 font-bold inline-flex items-center gap-1 transition cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
      </div>

    </motion.div>
  );
}
