import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Info, AlertTriangle, CheckCircle2, Search, ArrowRight, TrendingUp } from 'lucide-react';
import { ETF } from '../types';
import { ETF_HOLDINGS, Holding } from '../data';

interface OverlapViewProps {
  watchlist: ETF[];
  onNavigateToBlog?: (postId: string) => void;
}

const ALL_ETF_NAMES: Record<string, string> = {
  VAS: 'Vanguard Australian Shares Index ETF',
  A200: 'Betashares Australia 200 ETF',
  VGS: 'Vanguard MSCI Index International Shares ETF',
  NDQ: 'Betashares Nasdaq 100 ETF',
  VTS: 'Vanguard U.S. Total Market Shares Index ETF',
  IVV: 'iShares S&P 500 ETF',
  DHHF: 'Betashares Diversified All Growth ETF',
  VHY: 'Vanguard Australian Shares High Yield ETF',
  VGE: 'Vanguard FTSE Emerging Markets Shares ETF',
};

export function OverlapView({ watchlist, onNavigateToBlog }: OverlapViewProps) {
  // Combine all known system ETFs and custom watchlist ETFs
  const knownTickers = Object.keys(ETF_HOLDINGS);
  const watchlistTickers = watchlist.map(e => e.ticker);
  const allTickers = Array.from(new Set([...knownTickers, ...watchlistTickers]));
  
  const [etfA, setEtfA] = useState<string>(() => {
    return allTickers.includes('VAS') ? 'VAS' : (allTickers[0] || 'VAS');
  });
  const [etfB, setEtfB] = useState<string>(() => {
    const defaultB = 'A200';
    if (etfA !== defaultB && allTickers.includes(defaultB)) return defaultB;
    return allTickers.find(t => t !== etfA) || defaultB;
  });

  const getEtfName = (ticker: string) => {
    const fromWatchlist = watchlist.find(e => e.ticker === ticker);
    if (fromWatchlist) return fromWatchlist.name;
    return ALL_ETF_NAMES[ticker] || `${ticker} Fund`;
  };

  const holdingsA = ETF_HOLDINGS[etfA] || [];
  const holdingsB = ETF_HOLDINGS[etfB] || [];

  // Calculate overlap
  const commonHoldings: Array<{
    ticker: string;
    name: string;
    weightA: number;
    weightB: number;
    overlap: number;
  }> = [];

  let totalOverlapPercent = 0;

  // We check matches by ticker (normalized)
  holdingsA.forEach(hA => {
    const match = holdingsB.find(hB => hB.ticker.toUpperCase() === hA.ticker.toUpperCase());
    if (match) {
      const overlapWeight = Math.min(hA.weight, match.weight);
      totalOverlapPercent += overlapWeight;
      commonHoldings.push({
        ticker: hA.ticker,
        name: hA.name,
        weightA: hA.weight,
        weightB: match.weight,
        overlap: overlapWeight
      });
    }
  });

  // Sort common holdings descending by overlap size
  commonHoldings.sort((a, b) => b.overlap - a.overlap);

  // Generate decision advice based on overlap
  const getAdvice = (overlap: number, tA: string, tB: string) => {
    if (overlap >= 80) {
      return {
        level: 'critical',
        title: 'EXTREMELY HIGH DUPLICATION RISK',
        color: 'text-rose-800 bg-rose-50 border-rose-200',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        message: `Holding both ${tA} and ${tB} is highly redundant (Overlap is ${overlap.toFixed(1)}%). These two ETFs track virtually the same index with near-identical constituents. You are paying multiple sets of management fees for the exact same underlying exposure. It is strongly advised to choose the one with the lower management expense ratio.`
      };
    } else if (overlap >= 25) {
      return {
        level: 'warning',
        title: 'SIGNIFICANT OVERLAP DETECTED',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        message: `Moderate to high index duplication detected (${overlap.toFixed(1)}% overlap). This is very common between broad-market US indices (like Apple, Microsoft, and NVIDIA matching between VGS, VTS, or NDQ). While not completely identical, buying both will heavily concentrate your portfolio in these top heavyweights, negating diversification advantages.`
      };
    } else if (overlap > 0) {
      return {
        level: 'safe',
        title: 'EXCELLENT COMPLEMENTARY MIX',
        color: 'text-emerald-800 bg-emerald-50 border-emerald-200',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        message: `Minimal overlapping detected (${overlap.toFixed(1)}% overlap). These ETFs provide complementary exposure across different geographic markets or sector classes. Combining them offers great diversification benefits without accidental single-stock concentration!`
      };
    } else {
      return {
        level: 'perfect',
        title: 'ZERO ACCIDENTAL DENSITY',
        color: 'text-indigo-800 bg-indigo-50 border-indigo-200',
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        message: `Zero stock overlap detected (0.0%). These funds target completely disjoint stock classes or geographies (e.g., local ASX equities vs international US megacaps). Perfect for establishing a balanced, isolated multi-asset class allocation.`
      };
    }
  };

  const advice = getAdvice(totalOverlapPercent, etfA, etfB);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Intro Header Card */}
      <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-xl border border-slate-900 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-12 translate-y-12">
          <Layers className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-md border border-white/20 text-slate-300 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            Anti-Redundancy Safeguard
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">ETF Stock-Overlap & Density Analyzer</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Avoid paying duplicate management fees or accidentally over-concentrating in the same giant tech stocks (e.g. Apple, BHP, Microsoft) across different funds. Select any two ETFs from the comprehensive ASX catalog or your active watchlist to audit their top underlying stock collisions.
          </p>
        </div>
      </div>

      {/* Selectors and Gauge Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Selector Panel (Left side 1/3) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-2xs">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Fund Comparison Selection</h3>
          
          {/* ETF A Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">First ETF (A)</label>
            <div className="relative">
              <select
                value={etfA}
                onChange={(e) => setEtfA(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-3.5 py-3 text-sm font-extrabold text-slate-800 focus:bg-white outline-hidden focus:ring-2 focus:ring-slate-950/25 focus:border-slate-950 transition appearance-none cursor-pointer"
              >
                {allTickers.map(ticker => (
                  <option key={`a-${ticker}`} value={ticker} disabled={ticker === etfB}>
                    {ticker} - {getEtfName(ticker)}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-mono text-xs font-black shadow-xs">
              vs
            </div>
          </div>

          {/* ETF B Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Second ETF (B)</label>
            <div className="relative">
              <select
                value={etfB}
                onChange={(e) => setEtfB(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-3.5 py-3 text-sm font-extrabold text-slate-800 focus:bg-white outline-hidden focus:ring-2 focus:ring-slate-950/25 focus:border-slate-950 transition appearance-none cursor-pointer"
              >
                {allTickers.map(ticker => (
                  <option key={`b-${ticker}`} value={ticker} disabled={ticker === etfA}>
                    {ticker} - {getEtfName(ticker)}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
            </div>
          </div>

          {/* Quick Stats side-by-side */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-150 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{etfA} Top Stocks</span>
              <span className="font-mono font-extrabold text-slate-800">{holdingsA.length} mapped</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{etfB} Top Stocks</span>
              <span className="font-mono font-extrabold text-slate-800">{holdingsB.length} mapped</span>
            </div>
          </div>
        </div>

        {/* Overlap Gauge and Diagnostic (Right side 2/3) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            
            {/* Visual Overlap Gauge Circle */}
            <div className="relative flex-shrink-0 w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  stroke={
                    totalOverlapPercent >= 80 ? '#f43f5e' :
                    totalOverlapPercent >= 25 ? '#f59e0b' : '#10b981'
                  }
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 * (1 - Math.min(100, totalOverlapPercent) / 100)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">
                  {totalOverlapPercent.toFixed(1)}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Overlap
                </span>
              </div>
            </div>

            {/* Metric explanations */}
            <div className="space-y-2 flex-1">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                Overlap Index Diagnostic
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${advice.badgeColor}`}>
                  {advice.level.toUpperCase()}
                </span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                The overlap represents the exact minimum intersection weight of all underlying stock shares. For instance, if ETF A holds 10% BHP and ETF B holds 8% BHP, they share <strong className="text-slate-700">8% common duplication</strong>.
              </p>
              
              {/* Overlap spectrum slider */}
              <div className="space-y-1 pt-1">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="w-1/4 h-full bg-emerald-500" title="Low Overlap"></div>
                  <div className="w-2/4 h-full bg-amber-500" title="Moderate Overlap"></div>
                  <div className="w-1/4 h-full bg-rose-500" title="Critical Overlap"></div>
                </div>
                <div className="flex justify-between text-[8px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                  <span>0% Safe</span>
                  <span>25% Warning</span>
                  <span>80%+ Critical Redundancy</span>
                </div>
              </div>
            </div>

          </div>

          {/* Advice Warning Block */}
          <div className={`p-4 rounded-xl border ${advice.color} flex gap-3 text-xs leading-relaxed`}>
            {advice.level === 'critical' && <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />}
            {advice.level === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />}
            {advice.level === 'safe' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />}
            {advice.level === 'perfect' && <CheckCircle2 className="w-5 h-5 shrink-0 text-indigo-500" />}
            <div>
              <strong className="block text-[11px] font-black tracking-wide mb-0.5">{advice.title}</strong>
              <span className="font-medium">{advice.message}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Collision Analysis Stock Table Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-150 pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-900" />
              Constituent Collision Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              A comprehensive audit showing the top overlapping companies currently residing in both portfolios.
            </p>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-center">
            {commonHoldings.length} overlapping stocks found
          </span>
        </div>

        {commonHoldings.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-800">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No Common Duplications Found</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              These two funds have zero common stock holdings based on their top underlying allocations. Perfect for portfolio diversity!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="py-3 font-semibold">Stock Details</th>
                  <th className="py-3 text-right font-semibold">{etfA} Weight</th>
                  <th className="py-3 text-right font-semibold">{etfB} Weight</th>
                  <th className="py-3 text-right font-semibold">Duplicate Collision (Min)</th>
                  <th className="py-3 text-right font-semibold hidden sm:table-cell">Intersection Meter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {commonHoldings.map((h, idx) => (
                  <tr key={h.ticker} className="hover:bg-slate-50/50 transition">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 font-mono text-[9px] font-bold flex items-center justify-center">
                          {h.ticker}
                        </span>
                        <div>
                          <span className="text-slate-800 font-bold block">{h.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono">{h.ticker}:AX</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-700">
                      {h.weightA.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-700">
                      {h.weightB.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right font-mono font-black text-rose-600">
                      {h.overlap.toFixed(1)}%
                    </td>
                    <td className="py-3 text-right pl-6 hidden sm:table-cell w-48">
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden relative">
                        {/* A vs B bars overlapping */}
                        <div 
                          className="bg-slate-300 h-full absolute left-0"
                          style={{ width: `${Math.min(100, (h.weightA / 12) * 100)}%`, opacity: 0.5 }}
                          title={`${etfA}: ${h.weightA}%`}
                        ></div>
                        <div 
                          className="bg-slate-700 h-full absolute left-0"
                          style={{ width: `${Math.min(100, (h.weightB / 12) * 100)}%`, opacity: 0.3 }}
                          title={`${etfB}: ${h.weightB}%`}
                        ></div>
                        <div 
                          className="bg-rose-500 h-full absolute left-0"
                          style={{ width: `${Math.min(100, (h.overlap / 12) * 100)}%` }}
                          title={`Overlap: ${h.overlap}%`}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Broad market advisory and guidance */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row gap-4 items-start text-xs text-slate-500">
        <Info className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1">
          <h4 className="font-extrabold text-slate-800">What should you do about overlapping ETFs?</h4>
          <p className="leading-relaxed font-medium">
            Overlapping is not always bad if you intentionally want to tilt or overweight your portfolio towards certain sectors (like US Technology). However, having more than 30% overlap usually means you are paying double fees for the exact same market movement. 
          </p>
          <ul className="list-disc pl-4 space-y-1 leading-relaxed font-medium">
            <li><strong>VAS vs A200:</strong> Almost 100% overlap. Do not hold both; sell one and hold the other to streamline.</li>
            <li><strong>NDQ vs VGS:</strong> Around 20% overlap. Suitable if you want to tilt heavier into big-tech (Apple, Microsoft) while keeping global diversified foundations.</li>
            <li><strong>VAS vs VGS:</strong> Perfect 0% overlap. Excellent combo pairing for Australian dividends + Global international growth!</li>
          </ul>

          {onNavigateToBlog && (
            <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-150">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-850 flex items-center gap-1.5 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                  Deep-Dive: S&P 500 (IVV) vs ASX 300 (VAS) Analysis
                </span>
                <p className="text-[10px] text-slate-400 font-medium">
                  We compared dividends, performance, and taxation between these two giant core assets in detail.
                </p>
              </div>
              <button
                onClick={() => onNavigateToBlog('ivv-vs-vas-comparison')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer self-start sm:self-center shrink-0"
              >
                Read Duel Guide
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

    </motion.div>
  );
}
