import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, 
  RotateCcw, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  DollarSign, 
  Plus, 
  Minus, 
  Trash2, 
  Info, 
  ArrowRight, 
  HelpCircle,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Percent,
  CheckCircle2
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ETF } from '../types';
import { getDefaultWatchlist } from '../data';

interface RebalanceAsset {
  ticker: string;
  name: string;
  price: number;
  units: number;
  targetWeight: number; // in percent (0-100)
  type: 'Core' | 'Satellite';
}

const INITIAL_REBALANCE_ASSETS: RebalanceAsset[] = [
  { ticker: 'VAS', name: 'Vanguard Australian Shares', price: 95.50, units: 150, targetWeight: 40, type: 'Core' },
  { ticker: 'VGS', name: 'Vanguard Intl Shares Index', price: 119.30, units: 100, targetWeight: 40, type: 'Core' },
  { ticker: 'NDQ', name: 'Betashares Nasdaq 100', price: 32.40, units: 120, targetWeight: 15, type: 'Satellite' },
  { ticker: 'VGE', name: 'Vanguard FTSE Emerging Mkts', price: 71.10, units: 30, targetWeight: 5, type: 'Satellite' }
];

const COLORS_CORE_SATELLITE = {
  Core: '#4f46e5', // Indigo
  Satellite: '#ec4899' // Pink
};

export default function PortfolioRebalancer() {
  const [assets, setAssets] = useState<RebalanceAsset[]>(INITIAL_REBALANCE_ASSETS);
  const [newDeposit, setNewDeposit] = useState<number>(5000);
  const [brokerageFee, setBrokerageFee] = useState<number>(5.50);
  const [rebalanceMode, setRebalanceMode] = useState<'buyOnly' | 'full'>('buyOnly');
  const [selectedAssetTypeToggle, setSelectedAssetTypeToggle] = useState<string>('');
  
  // Custom asset creation
  const [newTicker, setNewTicker] = useState<string>('');
  const [newPrice, setNewPrice] = useState<number>(50);
  const [newUnits, setNewUnits] = useState<number>(10);
  const [newWeight, setNewWeight] = useState<number>(0);
  const [newType, setNewType] = useState<'Core' | 'Satellite'>('Core');

  // Sum of target weights
  const totalTargetWeight = assets.reduce((sum, item) => sum + item.targetWeight, 0);

  // Recalculate totals
  const totalActualValue = assets.reduce((sum, item) => sum + (item.units * item.price), 0);

  // Asset processing
  const processedAssets = assets.map(asset => {
    const actualValue = asset.units * asset.price;
    const actualWeight = totalActualValue > 0 ? (actualValue / totalActualValue) * 100 : 0;
    const drift = actualWeight - asset.targetWeight;
    
    return {
      ...asset,
      actualValue,
      actualWeight,
      drift
    };
  });

  // Calculate current Core vs Satellite balance
  const actualCoreValue = processedAssets.filter(a => a.type === 'Core').reduce((sum, a) => sum + a.actualValue, 0);
  const actualSatelliteValue = processedAssets.filter(a => a.type === 'Satellite').reduce((sum, a) => sum + a.actualValue, 0);
  const totalPortfolioValue = actualCoreValue + actualSatelliteValue;

  const actualCorePercent = totalPortfolioValue > 0 ? (actualCoreValue / totalPortfolioValue) * 100 : 0;
  const actualSatellitePercent = totalPortfolioValue > 0 ? (actualSatelliteValue / totalPortfolioValue) * 100 : 0;

  const targetCorePercent = assets.filter(a => a.type === 'Core').reduce((sum, a) => sum + a.targetWeight, 0);
  const targetSatellitePercent = assets.filter(a => a.type === 'Satellite').reduce((sum, a) => sum + a.targetWeight, 0);

  // Core vs Satellite Recharts Data
  const coreSatelliteChartData = [
    { name: 'Core', value: Math.round(actualCorePercent), color: '#4f46e5' },
    { name: 'Satellite', value: Math.round(actualSatellitePercent), color: '#f43f5e' }
  ];

  // Auto-scale target weights to exactly 100%
  const scaleTo100 = () => {
    if (totalTargetWeight === 0) {
      const equalWeight = 100 / assets.length;
      setAssets(assets.map(a => ({ ...a, targetWeight: parseFloat(equalWeight.toFixed(1)) })));
      return;
    }
    const factor = 100 / totalTargetWeight;
    setAssets(assets.map(a => ({
      ...a,
      targetWeight: parseFloat((a.targetWeight * factor).toFixed(1))
    })));
  };

  // Set weights equally
  const setEqualWeights = () => {
    const equalWeight = parseFloat((100 / assets.length).toFixed(1));
    setAssets(assets.map(a => ({ ...a, targetWeight: equalWeight })));
  };

  // Update target weight of an asset
  const updateWeight = (ticker: string, newWeight: number) => {
    setAssets(assets.map(a => a.ticker === ticker ? { ...a, targetWeight: Math.max(0, Math.min(100, newWeight)) } : a));
  };

  // Update units owned of an asset
  const updateUnits = (ticker: string, newUnits: number) => {
    setAssets(assets.map(a => a.ticker === ticker ? { ...a, units: Math.max(0, newUnits) } : a));
  };

  // Update asset price
  const updatePrice = (ticker: string, newPrice: number) => {
    setAssets(assets.map(a => a.ticker === ticker ? { ...a, price: Math.max(0.1, newPrice) } : a));
  };

  // Toggle asset type Core / Satellite
  const toggleAssetType = (ticker: string) => {
    setAssets(assets.map(a => a.ticker === ticker ? { ...a, type: a.type === 'Core' ? 'Satellite' : 'Core' } : a));
  };

  // Delete asset
  const deleteAsset = (ticker: string) => {
    setAssets(assets.filter(a => a.ticker !== ticker));
  };

  // Add custom asset
  const addAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker) return;
    const tickerUpper = newTicker.trim().toUpperCase();
    if (assets.some(a => a.ticker === tickerUpper)) {
      alert(`Asset ${tickerUpper} already exists!`);
      return;
    }

    const newAsset: RebalanceAsset = {
      ticker: tickerUpper,
      name: `Custom ${tickerUpper} ETF`,
      price: newPrice,
      units: newUnits,
      targetWeight: newWeight,
      type: newType
    };

    setAssets([...assets, newAsset]);
    setNewTicker('');
    setNewPrice(50);
    setNewUnits(10);
    setNewWeight(0);
  };

  // -------------------------------------------------------------
  // REBALANCING CALCULATIONS
  // -------------------------------------------------------------

  // 1. BUY-ONLY REBALANCING ("NO-TAX CGT SAVER")
  // Iteratively allocate cash to the most underweight assets first (heuristic water-filling algorithm)
  const calculateBuyOnlyRebalance = () => {
    let remainingCash = newDeposit;
    let tempUnits = assets.map(a => ({ ...a, originalUnits: a.units, bought: 0 }));
    
    // Safety break
    let iterations = 0;
    const maxIterations = 2000;
    const stepSize = 1; // Buy 1 unit at a time for calculation

    // Ensure we have assets and target weights sum to > 0
    if (assets.length === 0 || totalTargetWeight === 0) {
      return [];
    }

    // Run iterative water-filling simulation
    while (remainingCash > 0 && iterations < maxIterations) {
      iterations++;
      
      // Calculate current portfolio value in simulation
      const simPortfolioValue = tempUnits.reduce((sum, item) => sum + (item.units * item.price), 0);
      
      // Find asset that is MOST underweight compared to target weight
      let worstDrift = -999999;
      let worstAssetIdx = -1;

      tempUnits.forEach((asset, idx) => {
        if (asset.targetWeight <= 0) return;
        const currentVal = asset.units * asset.price;
        const currentWeight = simPortfolioValue > 0 ? (currentVal / simPortfolioValue) * 100 : 0;
        const drift = currentWeight - asset.targetWeight; // negative means underweight

        // Weight drift difference priority
        if (drift < worstDrift) {
          worstDrift = drift;
          worstAssetIdx = idx;
        }
      });

      // If no valid asset found, break
      if (worstAssetIdx === -1) break;

      const targetAsset = tempUnits[worstAssetIdx];
      const costPerUnit = targetAsset.price;

      // Check if we can afford to buy at least 1 unit
      if (remainingCash >= costPerUnit) {
        tempUnits[worstAssetIdx].units += 1;
        tempUnits[worstAssetIdx].bought += 1;
        remainingCash -= costPerUnit;
      } else {
        // Can't afford even 1 share of the most underweight asset.
        // Try to see if there is another underweight asset we can afford
        let boughtSomething = false;
        
        // Sort remaining underweight assets by drift
        const sortedAffordable = tempUnits
          .map((a, i) => ({ a, i, drift: (simPortfolioValue > 0 ? ((a.units * a.price) / simPortfolioValue) * 100 : 0) - a.targetWeight }))
          .filter(x => x.drift < 0 && x.a.price <= remainingCash)
          .sort((a, b) => a.drift - b.drift);

        if (sortedAffordable.length > 0) {
          const buyIdx = sortedAffordable[0].i;
          tempUnits[buyIdx].units += 1;
          tempUnits[buyIdx].bought += 1;
          remainingCash -= tempUnits[buyIdx].price;
          boughtSomething = true;
        }

        if (!boughtSomething) {
          // AFFORD NOTHING MORE
          break;
        }
      }
    }

    return tempUnits.filter(t => t.bought > 0).map(t => ({
      ticker: t.ticker,
      name: t.name,
      price: t.price,
      sharesToBuy: t.bought,
      cost: t.bought * t.price,
      newUnits: t.units
    }));
  };

  // 2. PERFECT FULL REBALANCE (Sells and Buys)
  const calculateFullRebalance = () => {
    if (totalTargetWeight === 0 || assets.length === 0) return [];
    
    // We assume perfect target percentages on the final portfolio value (Total + Deposit)
    const targetTotalValue = totalActualValue + newDeposit;
    
    return assets.map(asset => {
      const targetAllocationValue = (asset.targetWeight / 100) * targetTotalValue;
      const actualValue = asset.units * asset.price;
      const valueDiff = targetAllocationValue - actualValue;
      
      // units diff
      const targetUnits = targetAllocationValue / asset.price;
      const unitsDiff = targetUnits - asset.units;
      
      return {
        ticker: asset.ticker,
        name: asset.name,
        price: asset.price,
        valueDiff,
        unitsDiff,
        action: valueDiff > 0 ? 'BUY' : valueDiff < 0 ? 'SELL' : 'HOLD',
        amount: Math.abs(valueDiff),
        shares: Math.abs(unitsDiff)
      };
    }).filter(t => Math.abs(t.valueDiff) > 10); // ignore tiny adjustments under $10
  };

  const buyOnlyResults = calculateBuyOnlyRebalance();
  const fullRebalanceResults = calculateFullRebalance();

  const totalBuyOnlyCost = buyOnlyResults.reduce((sum, r) => sum + r.cost, 0);
  const buyOnlyLeftoverCash = newDeposit - totalBuyOnlyCost;
  const buyOnlyTradesCount = buyOnlyResults.length;
  const buyOnlyTotalFees = buyOnlyTradesCount * brokerageFee;

  const fullRebalanceTradesCount = fullRebalanceResults.length;
  const fullRebalanceTotalFees = fullRebalanceTradesCount * brokerageFee;

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-pink-950 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 translate-y-16 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-pink-500/20 text-pink-300 rounded-xl border border-pink-500/30">
            <Scale className="w-6 h-6" />
          </span>
          <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2.5 py-0.5 rounded-full border border-pink-500/30 font-black uppercase self-start">
            ASX Portfolio Shield
          </span>
        </div>
        
        <h2 id="rebalancer-title" className="text-xl sm:text-2xl font-black tracking-tight">Core-Satellite Target Allocation &amp; Drift Rebalancer</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-3xl">
          Maintain your ideal balance between cheap broad index funds (Core) and high-octane thematic bets (Satellites). Our rebalancer detects drift and runs a smart <span className="text-emerald-400 font-bold">"Buy-Only" algorithm</span> to align your portfolio using your next cash deposit, completely avoiding Capital Gains Tax (CGT) triggers!
        </p>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Setup Assets and weights (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-pink-600" />
              <h3 className="font-black text-slate-900 text-base">Your Target Portfolio</h3>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={scaleTo100}
                className="px-2.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg hover:bg-indigo-100 transition flex items-center gap-1"
              >
                <Percent className="w-3 h-3" />
                Scale Target to 100%
              </button>
              <button
                onClick={setEqualWeights}
                className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black rounded-lg hover:bg-slate-200 transition flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Equal Weight
              </button>
            </div>
          </div>

          {/* Validation Warning if target != 100% */}
          {Math.abs(totalTargetWeight - 100) > 0.01 && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 p-3.5 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold block">Weights do not sum to 100%</span>
                <p className="text-amber-700">
                  Your current targets add up to <span className="font-black font-mono">{totalTargetWeight.toFixed(1)}%</span>. Click the <strong>Scale Target to 100%</strong> button to auto-adjust weights proportionally.
                </p>
              </div>
            </div>
          )}

          {/* Asset List Block */}
          <div className="space-y-4">
            {processedAssets.map((asset) => (
              <div 
                key={asset.ticker} 
                className="border border-slate-150 rounded-xl p-4 hover:shadow-xs transition duration-200 bg-slate-50/50"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  
                  {/* Left Side Info */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-slate-900 text-sm">{asset.ticker}</span>
                      <span className="text-xs text-slate-400 truncate max-w-[200px]">{asset.name}</span>
                      <button
                        onClick={() => toggleAssetType(asset.ticker)}
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full border transition uppercase ${
                          asset.type === 'Core'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'bg-pink-50 border-pink-200 text-pink-700'
                        }`}
                        title="Click to toggle Core / Satellite class"
                      >
                        {asset.type}
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold font-mono">
                      <span>Price: ${asset.price.toFixed(2)}</span>
                      <span>Value: ${(asset.actualValue).toLocaleString(undefined, {maximumFractionDigits: 0})} AUD</span>
                      <span>Weight: {asset.actualWeight.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Weight Slide Selector & Unit Editor */}
                  <div className="flex items-center gap-4 w-full sm:w-auto shrink-0">
                    
                    {/* Units owned */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-slate-400 font-black block uppercase">Units Owned</span>
                      <input 
                        type="number"
                        value={asset.units}
                        onChange={(e) => updateUnits(asset.ticker, parseInt(e.target.value) || 0)}
                        aria-label={`Units Owned for ${asset.ticker}`}
                        className="w-16 bg-white border border-slate-200 rounded-lg px-1.5 py-1 text-center font-mono font-bold text-xs"
                      />
                    </div>

                    {/* Target Weight Slider */}
                    <div className="space-y-1 flex-1 sm:flex-initial">
                      <div className="flex justify-between text-[9px] font-black uppercase text-slate-400">
                        <span>Target %</span>
                        <span className="font-mono text-slate-900">{asset.targetWeight}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={asset.targetWeight}
                        onChange={(e) => updateWeight(asset.ticker, parseInt(e.target.value) || 0)}
                        aria-label={`Target Weight Percentage for ${asset.ticker}`}
                        className="w-24 sm:w-28 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>

                    {/* Trash Delete button */}
                    <button
                      onClick={() => deleteAsset(asset.ticker)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition self-end"
                      title="Remove ETF from portfolio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Form */}
          <form onSubmit={addAsset} className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Add Custom ETF / Asset</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="Ticker (e.g. DHHF)"
                value={newTicker}
                onChange={(e) => setNewTicker(e.target.value)}
                aria-label="New Asset Ticker"
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 placeholder-slate-400 uppercase"
                required
              />
              <input
                type="number"
                placeholder="Price AUD"
                value={newPrice || ''}
                onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                aria-label="New Asset Price AUD"
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
                required
              />
              <input
                type="number"
                placeholder="Units owned"
                value={newUnits || ''}
                onChange={(e) => setNewUnits(parseInt(e.target.value) || 0)}
                aria-label="New Asset Units Owned"
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
                required
              />
              <select
                value={newType}
                onChange={(e: any) => setNewType(e.target.value)}
                aria-label="New Asset Structure Type"
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-black text-slate-700 cursor-pointer"
              >
                <option value="Core">Core</option>
                <option value="Satellite">Satellite</option>
              </select>
              <button
                type="submit"
                className="bg-slate-900 text-white rounded-lg text-xs font-black py-1.5 hover:bg-slate-800 transition flex items-center justify-center gap-1 col-span-2 sm:col-span-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </form>

        </div>

        {/* Right Side: Rebalancing Optimization Results (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Portfolio Breakdown Summary and Charts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-900 text-base">Drift &amp; Core-Satellite Split</h3>
            </div>

            {/* Core vs Satellite Split Visual */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-500">Core vs. Satellite Mix</span>
                <span className="font-mono font-black text-slate-800">
                  {actualCorePercent.toFixed(0)}% Core / {actualSatellitePercent.toFixed(0)}% Satellite
                </span>
              </div>
              
              {/* Dual bar representing splits */}
              <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden">
                <div 
                  className="bg-indigo-600 transition-all duration-300"
                  style={{ width: `${actualCorePercent}%` }}
                  title={`Core: ${actualCorePercent.toFixed(1)}%`}
                />
                <div 
                  className="bg-pink-500 transition-all duration-300"
                  style={{ width: `${actualSatellitePercent}%` }}
                  title={`Satellite: ${actualSatellitePercent.toFixed(1)}%`}
                />
              </div>

              {/* Targets Comparison */}
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>Target Core: {targetCorePercent}%</span>
                <span>Target Satellite: {targetSatellitePercent}%</span>
              </div>
            </div>

            {/* Target vs Actual Comparison Chart */}
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Target vs Actual Weights</label>
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processedAssets} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="ticker" fontSize={9} fontStyle="bold" stroke="#94a3b8" />
                    <YAxis fontSize={9} fontStyle="bold" stroke="#94a3b8" unit="%" />
                    <Tooltip 
                      formatter={(val) => [`${val}%`, '']}
                      contentStyle={{ borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="targetWeight" name="Target" fill="#94a3b8" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="actualWeight" name="Actual" fill="#4f46e5" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Rebalancing Inputs & Engine */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Scale className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-slate-900 text-base">Rebalance Engine</h3>
            </div>

            {/* Cash Deposit Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">New Cash Deposit</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                  <input 
                    type="number"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Brokerage Trade Fee</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                  <input 
                    type="number"
                    step="0.01"
                    value={brokerageFee}
                    onChange={(e) => setBrokerageFee(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-7 pr-3 text-xs font-bold text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Toggle Modes */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
              <button
                type="button"
                onClick={() => setRebalanceMode('buyOnly')}
                className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all ${
                  rebalanceMode === 'buyOnly'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Buy-Only (No CGT Tax)
              </button>
              <button
                type="button"
                onClick={() => setRebalanceMode('full')}
                className={`flex-1 text-center py-2 text-xs font-black rounded-lg transition-all ${
                  rebalanceMode === 'full'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Perfect Full Rebalance
              </button>
            </div>

            {/* Action Output List */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Recommended Action Steps</span>
              
              {rebalanceMode === 'buyOnly' ? (
                // Buy-Only Results Panel
                <div className="space-y-3">
                  {buyOnlyResults.length === 0 ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center text-xs text-emerald-800 font-semibold">
                      Your portfolio is in excellent alignment! No buying adjustments needed.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {buyOnlyResults.map((r) => (
                        <div key={r.ticker} className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-black text-slate-900 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px]">BUY</span>
                              <span className="font-bold text-slate-800">{r.ticker}</span>
                            </div>
                            <span className="text-slate-400 text-[10px] font-semibold block">Add {r.sharesToBuy} units at ${r.price.toFixed(2)}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-slate-900 block">${r.cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            <span className="text-[9px] text-slate-400 block">approx. purchase value</span>
                          </div>
                        </div>
                      ))}

                      {/* Summary calculations */}
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Cash to Invest:</span>
                          <span className="font-mono font-bold text-slate-800">${totalBuyOnlyCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Estimated Brokerage Fees:</span>
                          <span className="font-mono font-bold text-red-500">${buyOnlyTotalFees.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-slate-950">
                          <span>Unspent Leftover Cash:</span>
                          <span className="font-mono text-emerald-600">${buyOnlyLeftoverCash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informational tip */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-indigo-800 leading-normal font-medium">
                      <strong>Tax Savior Benefit</strong>: Buying underweight assets instead of selling overweight ones avoids capital gains realization. Your cash is allocated optimally to drag you closer to your {targetCorePercent}% / {targetSatellitePercent}% target!
                    </p>
                  </div>
                </div>
              ) : (
                // Full Rebalance Results Panel (Buys and Sells)
                <div className="space-y-3">
                  {fullRebalanceResults.length === 0 ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center text-xs text-emerald-800 font-semibold">
                      Your portfolio is perfectly aligned with targets. No trades needed!
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {fullRebalanceResults.map((r) => (
                        <div key={r.ticker} className="bg-slate-50 border border-slate-150 rounded-xl p-3 flex justify-between items-center text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-mono font-black px-1.5 py-0.5 rounded text-[10px] ${
                                r.action === 'BUY'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}>
                                {r.action}
                              </span>
                              <span className="font-bold text-slate-800">{r.ticker}</span>
                            </div>
                            <span className="text-slate-400 text-[10px] font-semibold block">
                              {r.action === 'BUY' ? 'Purchase' : 'Liquidate'} {r.shares.toFixed(1)} units at ${r.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono font-black text-slate-900 block">${r.amount.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                            <span className="text-[9px] text-slate-400 block">estimated value</span>
                          </div>
                        </div>
                      ))}

                      {/* Summary calculations */}
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-3.5 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-medium">Trades Required:</span>
                          <span className="font-mono font-bold text-slate-800">{fullRebalanceTradesCount} trades</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 font-black text-slate-950">
                          <span>Brokerage Cost:</span>
                          <span className="font-mono text-red-500">${fullRebalanceTotalFees.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Warning on tax */}
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-amber-800 leading-normal font-medium space-y-1">
                      <strong className="block">ATO Capital Gains Tax (CGT) Alert!</strong>
                      <p>
                        Selling overweight ETFs will trigger capital gains events. Any gains made on shares held under 12 months do not receive the 50% CGT discount and are taxed at your full marginal income tax rate.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
