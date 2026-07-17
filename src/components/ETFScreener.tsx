import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight,
  Check, 
  Search, 
  SlidersHorizontal, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  X, 
  Scale, 
  ListFilter, 
  Zap, 
  Award, 
  Activity, 
  PieChart, 
  Coins,
  ArrowUpDown,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Plus
} from 'lucide-react';
import { SCREENER_ETFS, ScreenerETF, ScreenerHolding, DistributionRecord } from '../screenerData';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState
} from '@tanstack/react-table';
import AdPlacement from './AdPlacement';

const ETF_COMP_METADATA: Record<string, {
  totalHoldings: string;
  distFrequency: string;
  taxEfficiency: string;
  avgFranking: string;
  structure: string;
}> = {
  IVV: {
    totalHoldings: '503',
    distFrequency: 'Quarterly',
    taxEfficiency: 'US Domiciled. Dual-listed on ASX. No W-8BEN required for ASX units, but subject to US estate laws for very large holdings.',
    avgFranking: '0%',
    structure: 'Index CDI'
  },
  VAS: {
    totalHoldings: '200',
    distFrequency: 'Quarterly',
    taxEfficiency: 'Australian Domiciled. Fully compatible with local tax pre-filling. High franking credits directly offset personal income tax.',
    avgFranking: '75%',
    structure: 'Traditional ETF'
  },
  A200: {
    totalHoldings: '200',
    distFrequency: 'Quarterly',
    taxEfficiency: 'Australian Domiciled. Local tax pre-filling. High franking credits provide tax-effective income cash flows.',
    avgFranking: '82%',
    structure: 'Traditional ETF'
  },
  VGS: {
    totalHoldings: '1,500+',
    distFrequency: 'Quarterly',
    taxEfficiency: 'Australian Domiciled (holds global shares). No W-8BEN needed, eligible for Foreign Income Tax Offsets (FITO) on foreign withholding taxes.',
    avgFranking: '0%',
    structure: 'Feeder Fund'
  },
  NDQ: {
    totalHoldings: '101',
    distFrequency: 'Semi-Annually',
    taxEfficiency: 'Australian Domiciled. Simple local tax reporting. Foreign taxes paid are generally offsettable via FITO.',
    avgFranking: '0%',
    structure: 'Traditional ETF'
  },
  VTS: {
    totalHoldings: '3,500+',
    distFrequency: 'Quarterly',
    taxEfficiency: 'US Domiciled (Cross-listed). Requires filing a W-8BEN form every 3 years to reduce US dividend withholding tax from 30% to 15%.',
    avgFranking: '0%',
    structure: 'Cross-listed'
  },
  DHHF: {
    totalHoldings: '4 underlying ETFs (8,000+ holdings)',
    distFrequency: 'Quarterly',
    taxEfficiency: 'Australian Domiciled. Handles all internal rebalancing tax-efficiently. Receives mixed franking from underlying AU sleeve.',
    avgFranking: '16%',
    structure: 'Fund-of-Funds'
  },
  VHY: {
    totalHoldings: '70+',
    distFrequency: 'Quarterly',
    taxEfficiency: 'Australian Domiciled. High concentration of heavily franked ASX dividend stocks. Outstanding tax efficiency for low-tax brackets.',
    avgFranking: '90%',
    structure: 'Rules-based Dividend'
  },
  VGE: {
    totalHoldings: '1,200+',
    distFrequency: 'Semi-Annually',
    taxEfficiency: 'Australian Domiciled. Holds US-domiciled Vanguard emerging markets ETF. Some multi-tier withholding tax drag applies.',
    avgFranking: '0%',
    structure: 'Feeder Fund'
  },
  IOZ: {
    totalHoldings: '200',
    distFrequency: 'Quarterly',
    taxEfficiency: 'Australian Domiciled. Standard local tax reporting with robust franking credits from the ASX 200.',
    avgFranking: '79%',
    structure: 'Traditional ETF'
  },
  SUBD: {
    totalHoldings: '25-30 floating-rate bonds',
    distFrequency: 'Monthly',
    taxEfficiency: 'Australian Domiciled. Returns paid as regular interest income. No franking credits available.',
    avgFranking: '0%',
    structure: 'Fixed Income Bond'
  },
  QPON: {
    totalHoldings: '15-20 bank notes',
    distFrequency: 'Monthly',
    taxEfficiency: 'Australian Domiciled. Income treated as interest rather than dividends. Fully taxable at marginal rates.',
    avgFranking: '0%',
    structure: 'Floating Rate FRN'
  },
  IAF: {
    totalHoldings: '500+ investment-grade bonds',
    distFrequency: 'Quarterly',
    taxEfficiency: 'Australian Domiciled. Bond coupon income is fully taxable with zero franking. No currency hedging needed.',
    avgFranking: '0%',
    structure: 'Composite Bond'
  },
  GOLD: {
    totalHoldings: '1 (Allocated physical bullion)',
    distFrequency: 'None',
    taxEfficiency: 'Australian Domiciled. No dividends are paid. Capital gains tax (CGT) applies only upon unit sale.',
    avgFranking: '0%',
    structure: 'Physical Commodity'
  },
  ACDC: {
    totalHoldings: '30 global battery stocks',
    distFrequency: 'Annually',
    taxEfficiency: 'Australian Domiciled. Holds global thematic stocks. Capital gains can be volatile; minimal income distributions.',
    avgFranking: '5%',
    structure: 'Thematic ETF'
  },
  QUAL: {
    totalHoldings: '300 high-quality companies',
    distFrequency: 'Annually',
    taxEfficiency: 'Australian Domiciled. Holds global quality equities. Foreign income taxes offsettable via FITO.',
    avgFranking: '0%',
    structure: 'Smart-Beta Equity'
  },
  MVW: {
    totalHoldings: '80 equal-weighted ASX stocks',
    distFrequency: 'Semi-Annually',
    taxEfficiency: 'Australian Domiciled. Higher turnover than VAS due to equal-weight rebalancing, leading to slightly more CGT events.',
    avgFranking: '82%',
    structure: 'Equal-Weight Equity'
  },
  ETHI: {
    totalHoldings: '200 climate-leader global stocks',
    distFrequency: 'Semi-Annually',
    taxEfficiency: 'Australian Domiciled. Currency hedged. Simple tax pre-filling; FITO applies to global withholding taxes.',
    avgFranking: '0%',
    structure: 'Ethical Smart-Beta'
  },
  VAF: {
    totalHoldings: '200+ government bonds',
    distFrequency: 'Quarterly',
    taxEfficiency: 'Australian Domiciled. Coupon interest is paid quarterly. Standard local interest income taxation.',
    avgFranking: '0%',
    structure: 'Government Bond'
  },
  STW: {
    totalHoldings: '200',
    distFrequency: 'Quarterly',
    taxEfficiency: 'Australian Domiciled. High franking credits passed through directly to investors.',
    avgFranking: '80%',
    structure: 'Traditional ETF'
  },
  VEU: {
    totalHoldings: '3,500+ non-US stocks',
    distFrequency: 'Quarterly',
    taxEfficiency: 'US Domiciled (Cross-listed). Requires W-8BEN filing every 3 years. Investors can claim US tax credits on Australian returns.',
    avgFranking: '0%',
    structure: 'Cross-listed'
  },
  IEM: {
    totalHoldings: '1,200+ emerging market stocks',
    distFrequency: 'Semi-Annually',
    taxEfficiency: 'US Domiciled (Cross-listed). Requires W-8BEN filing. Subject to foreign withholding taxes and estate tax provisions.',
    avgFranking: '0%',
    structure: 'Cross-listed'
  }
};

interface ETFScreenerProps {
  onAddToWatchlist?: (ticker: string) => void;
  watchlistTickers?: string[];
  onNavigateToBlog?: (postId: string) => void;
}

export default function ETFScreener({ onAddToWatchlist, watchlistTickers = [], onNavigateToBlog }: ETFScreenerProps) {
  // --- Landing State Presets ---
  // Default filters as described: Asset Class = Equity, MER < 0.2%, Yield > 3%
  const [assetClassFilter, setAssetClassFilter] = useState<string>('Equity');
  const [maxMerFilter, setMaxMerFilter] = useState<number>(0.2);
  const [minYieldFilter, setMinYieldFilter] = useState<number>(3.0);
  
  // Secondary Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [minReturn1Y, setMinReturn1Y] = useState<number>(-10);
  const [domicileFilter, setDomicileFilter] = useState<string>('All');

  // Sorting State with TanStack Table
  const [sorting, setSorting] = useState<SortingState>([{ id: 'yield', desc: true }]);

  // Compared ETFs (State of Tickers)
  const [comparedTickers, setComparedTickers] = useState<string[]>([]);
  const [showComparisonPanel, setShowComparisonPanel] = useState<boolean>(false);
  const [activeInsightTab, setActiveInsightTab] = useState<'ivv_vas' | 'vge_vas' | 'intl'>('ivv_vas');

  // Active Detailed ETF View
  const [selectedETF, setSelectedETF] = useState<ScreenerETF | null>(null);
  const [chartTimeline, setChartTimeline] = useState<'1Y' | '3Y' | '5Y'>('1Y');

  // Handle preset quick filter trigger
  const handleApplyDefaultPreset = () => {
    setAssetClassFilter('Equity');
    setMaxMerFilter(0.2);
    setMinYieldFilter(3.0);
    setSearchTerm('');
    setDomicileFilter('All');
  };

  // Check if initial presets are active
  const isPresetActive = useMemo(() => {
    return assetClassFilter === 'Equity' && maxMerFilter === 0.2 && minYieldFilter === 3.0;
  }, [assetClassFilter, maxMerFilter, minYieldFilter]);

  // Clear all filters to view all 20+ ETFs
  const handleClearFilters = () => {
    setAssetClassFilter('All');
    setMaxMerFilter(1.0); // Reset high enough to show all
    setMinYieldFilter(0.0);
    setSearchTerm('');
    setMinReturn1Y(-20);
    setDomicileFilter('All');
  };

  // --- Filter Engine ---
  const filteredETFs = useMemo(() => {
    return SCREENER_ETFS.filter(etf => {
      // 1. Asset Class Filter
      if (assetClassFilter !== 'All' && etf.assetClass !== assetClassFilter) {
        return false;
      }
      // 2. MER Filter
      if (etf.mer > maxMerFilter) {
        return false;
      }
      // 3. Yield Filter
      if (etf.yield < minYieldFilter) {
        return false;
      }
      // 4. Domicile Filter
      if (domicileFilter !== 'All' && etf.domicile !== domicileFilter) {
        return false;
      }
      // 5. 1Y Return Filter
      if (etf.return1Y < minReturn1Y) {
        return false;
      }
      // 6. Text Search Filter (ticker, name, category)
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        return (
          etf.ticker.toLowerCase().includes(query) ||
          etf.name.toLowerCase().includes(query) ||
          etf.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [assetClassFilter, maxMerFilter, minYieldFilter, domicileFilter, minReturn1Y, searchTerm]);

  const columns = useMemo<ColumnDef<ScreenerETF>[]>(() => [
    {
      accessorKey: 'ticker',
      header: 'Ticker / Code',
      cell: (info) => {
        const etf = info.row.original;
        return (
          <button
            onClick={() => setSelectedETF(etf)}
            className="hover:underline text-indigo-600 hover:text-indigo-800 text-left cursor-pointer font-mono font-black"
          >
            {etf.ticker}
          </button>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Fund Name / Category',
      cell: (info) => {
        const etf = info.row.original;
        return (
          <div>
            <div className="font-bold text-slate-800 leading-tight">
              {etf.name}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-semibold">
              {etf.category}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'assetClass',
      header: 'Asset Class',
      cell: (info) => (
        <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200/50">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'mer',
      header: 'MER',
      cell: (info) => (
        <span className="font-mono font-black text-slate-800">
          {(info.getValue() as number).toFixed(2)}%
        </span>
      ),
    },
    {
      accessorKey: 'yield',
      header: 'Yield %',
      cell: (info) => (
        <span className="font-mono font-black text-emerald-600">
          {(info.getValue() as number).toFixed(2)}%
        </span>
      ),
    },
    {
      accessorKey: 'return1Y',
      header: '1Y Return %',
      cell: (info) => {
        const val = info.getValue() as number;
        return (
          <span className={`font-mono font-black ${val >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {val >= 0 ? '+' : ''}{val.toFixed(1)}%
          </span>
        );
      },
    },
    {
      accessorKey: 'return3Y',
      header: '3Y Return %',
      cell: (info) => {
        const val = info.getValue() as number;
        return (
          <span className={`font-mono font-bold ${val >= 0 ? 'text-slate-700' : 'text-rose-500'}`}>
            {val >= 0 ? '+' : ''}{val.toFixed(1)}%
          </span>
        );
      },
    },
    {
      accessorKey: 'return5Y',
      header: '5Y Return %',
      cell: (info) => {
        const val = info.getValue() as number;
        return (
          <span className={`font-mono font-bold ${val >= 0 ? 'text-slate-700' : 'text-rose-500'}`}>
            {val >= 0 ? '+' : ''}{val.toFixed(1)}%
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const etf = info.row.original;
        const inWatchlist = watchlistTickers.includes(etf.ticker);
        const isCompared = comparedTickers.includes(etf.ticker);
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setSelectedETF(etf)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer"
              title="View detailed fund profile and chart"
            >
              Details
            </button>
            <button
              onClick={() => toggleComparison(etf.ticker)}
              className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                isCompared 
                  ? 'bg-indigo-600 text-white font-extrabold' 
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
              title="Add to side-by-side comparison"
            >
              {isCompared ? 'Compared' : 'Compare'}
            </button>
            {onAddToWatchlist && (
              <button
                onClick={() => onAddToWatchlist(etf.ticker)}
                disabled={inWatchlist}
                className={`p-1.5 rounded-xl border transition ${
                  inWatchlist 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
                title={inWatchlist ? "In watchlist" : "Add to monitored watchlist"}
              >
                {inWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        );
      },
    }
  ], [watchlistTickers, comparedTickers, onAddToWatchlist]);

  // Setup the TanStack table
  const table = useReactTable({
    data: filteredETFs,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // --- Comparison Management ---
  const toggleComparison = (ticker: string) => {
    setComparedTickers(prev => {
      if (prev.includes(ticker)) {
        return prev.filter(t => t !== ticker);
      } else {
        if (prev.length >= 4) {
          alert("You can compare up to 4 ETFs side-by-side.");
          return prev;
        }
        return [...prev, ticker];
      }
    });
  };

  const clearComparison = () => {
    setComparedTickers([]);
    setShowComparisonPanel(false);
  };

  const activeComparedETFs = useMemo(() => {
    return SCREENER_ETFS.filter(etf => comparedTickers.includes(etf.ticker));
  }, [comparedTickers]);

  // --- SVG Chart Generator ---
  const chartPoints = useMemo(() => {
    if (!selectedETF) return [];
    if (chartTimeline === '1Y') return selectedETF.history1Y;
    if (chartTimeline === '3Y') return selectedETF.history3Y;
    return selectedETF.history5Y;
  }, [selectedETF, chartTimeline]);

  const svgPathData = useMemo(() => {
    if (chartPoints.length === 0) return { linePath: '', areaPath: '', xGrid: [], yGrid: [] };
    
    const width = 600;
    const height = 240;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };

    const minVal = Math.min(...chartPoints.map(p => p.value)) * 0.95;
    const maxVal = Math.max(...chartPoints.map(p => p.value)) * 1.05;
    const valRange = maxVal - minVal;

    const getX = (index: number) => {
      return padding.left + (index / (chartPoints.length - 1)) * (width - padding.left - padding.right);
    };

    const getY = (value: number) => {
      return height - padding.bottom - ((value - minVal) / valRange) * (height - padding.top - padding.bottom);
    };

    let linePath = '';
    let areaPath = '';

    chartPoints.forEach((p, idx) => {
      const x = getX(idx);
      const y = getY(p.value);
      if (idx === 0) {
        linePath = `M ${x} ${y}`;
        areaPath = `M ${x} ${height - padding.bottom} L ${x} ${y}`;
      } else {
        linePath += ` L ${x} ${y}`;
        areaPath += ` L ${x} ${y}`;
      }
    });

    areaPath += ` L ${getX(chartPoints.length - 1)} ${height - padding.bottom} Z`;

    // Generate reference grid lines
    const yGridCount = 4;
    const yGrid = Array.from({ length: yGridCount }).map((_, idx) => {
      const val = minVal + (idx / (yGridCount - 1)) * valRange;
      return {
        y: getY(val),
        value: val.toFixed(1)
      };
    });

    // Select subset of points for X grid
    const step = Math.ceil(chartPoints.length / 5);
    const xGrid = chartPoints
      .map((p, idx) => ({ ...p, x: getX(idx), idx }))
      .filter((_, idx) => idx % step === 0 || idx === chartPoints.length - 1);

    return { linePath, areaPath, xGrid, yGrid, minVal, maxVal };
  }, [chartPoints]);


  return (
    <div className="space-y-6">
      
      {/* -------------------- DETAILED FUND PAGE -------------------- */}
      {selectedETF ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm"
        >
          {/* Header Action Row */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <button
              onClick={() => setSelectedETF(null)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-950 transition bg-white border border-slate-250 px-3 py-1.5 rounded-xl shadow-2xs self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to ETF Screener
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Ticker: {selectedETF.ticker}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-[11px] font-semibold text-slate-500">
                Category: {selectedETF.category}
              </span>
            </div>
          </div>

          {/* Main Fund Overview */}
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Title Block */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-slate-950 text-white font-mono font-black text-lg px-3 py-1 rounded-lg">
                    {selectedETF.ticker}
                  </span>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200/60">
                    {selectedETF.assetClass} Domicile: {selectedETF.domicile}
                  </span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {selectedETF.name}
                </h1>
              </div>

              {/* Quick Actions inside detail view */}
              <div className="flex items-center gap-3">
                {onAddToWatchlist && (
                  <button
                    onClick={() => onAddToWatchlist(selectedETF.ticker)}
                    disabled={watchlistTickers.includes(selectedETF.ticker)}
                    className={`inline-flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl border transition ${
                      watchlistTickers.includes(selectedETF.ticker)
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 cursor-not-allowed'
                        : 'bg-slate-950 border-slate-950 text-white hover:bg-slate-800'
                    }`}
                  >
                    {watchlistTickers.includes(selectedETF.ticker) ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        In Watchlist
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Add to Watchlist
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => toggleComparison(selectedETF.ticker)}
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border transition ${
                    comparedTickers.includes(selectedETF.ticker)
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-extrabold'
                      : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  {comparedTickers.includes(selectedETF.ticker) ? 'Comparing' : 'Compare ETF'}
                </button>
              </div>
            </div>

            {/* Key Info Tiles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Management Cost (MER)
                </span>
                <span className="text-xl font-mono font-black text-slate-900">
                  {selectedETF.mer.toFixed(2)}%
                  <span className="text-xs font-normal text-slate-400 font-sans ml-1">p.a.</span>
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Distribution Yield
                </span>
                <span className="text-xl font-mono font-black text-slate-900">
                  {selectedETF.yield.toFixed(2)}%
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Fund Size (AUM)
                </span>
                <span className="text-xl font-mono font-black text-slate-900">
                  ${selectedETF.fundSize >= 1000 ? `${(selectedETF.fundSize / 1000).toFixed(2)}B` : `${selectedETF.fundSize}M`}
                  <span className="text-xs font-normal text-slate-400 font-sans ml-1">AUD</span>
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Portfolio P/E Ratio
                </span>
                <span className="text-xl font-mono font-black text-slate-900">
                  {selectedETF.peRatio ? selectedETF.peRatio.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Performance Chart Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Trend Chart (Left 2 Columns) */}
              <div className="lg:col-span-2 border border-slate-200 rounded-3xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      Growth of $100 Reference Model
                    </h3>
                    <p className="text-xs text-slate-400">Normalised compounding trend over selected time frame</p>
                  </div>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {(['1Y', '3Y', '5Y'] as const).map(tl => (
                      <button
                        key={tl}
                        onClick={() => setChartTimeline(tl)}
                        className={`px-3 py-1 text-xs font-black rounded-md transition ${
                          chartTimeline === tl 
                            ? 'bg-white text-slate-950 shadow-2xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {tl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Area Chart rendering */}
                <div className="relative w-full overflow-hidden pt-2">
                  <svg viewBox="0 0 600 240" className="w-full h-[220px] overflow-visible">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Gridlines */}
                    {svgPathData.yGrid.map((grid, idx) => (
                      <g key={idx}>
                        <line 
                          x1="45" 
                          y1={grid.y} 
                          x2="580" 
                          y2={grid.y} 
                          stroke="#e2e8f0" 
                          strokeDasharray="4"
                          strokeWidth="1"
                        />
                        <text 
                          x="35" 
                          y={grid.y + 4} 
                          textAnchor="end" 
                          className="font-mono text-[9px] fill-slate-400 font-bold"
                        >
                          ${grid.value}
                        </text>
                      </g>
                    ))}

                    {/* Paths */}
                    <path 
                      d={svgPathData.areaPath} 
                      fill="url(#chartGradient)" 
                    />
                    <path 
                      d={svgPathData.linePath} 
                      fill="none" 
                      stroke="#4f46e5" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                    />

                    {/* X-Axis labels */}
                    {svgPathData.xGrid.map((grid, idx) => (
                      <g key={idx}>
                        <line 
                          x1={grid.x} 
                          y1="20" 
                          x2={grid.x} 
                          y2="210" 
                          stroke="#f1f5f9" 
                          strokeWidth="1"
                        />
                        <text 
                          x={grid.x} 
                          y="225" 
                          textAnchor="middle" 
                          className="font-mono text-[9px] fill-slate-400 font-black"
                        >
                          {grid.date}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Performance Returns Table & Risk Gauges */}
              <div className="border border-slate-200 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Award className="w-4 h-4 text-indigo-500" />
                    Trailing Performance Returns
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="font-semibold text-slate-500">1-Year Return</span>
                      <span className={`font-mono font-black flex items-center gap-0.5 ${selectedETF.return1Y >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {selectedETF.return1Y >= 0 ? '+' : ''}{selectedETF.return1Y.toFixed(1)}%
                        {selectedETF.return1Y >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                      <span className="font-semibold text-slate-500">3-Year Return (Annualised)</span>
                      <span className={`font-mono font-black flex items-center gap-0.5 ${selectedETF.return3Y >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {selectedETF.return3Y >= 0 ? '+' : ''}{selectedETF.return3Y.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="font-semibold text-slate-500">5-Year Return (Annualised)</span>
                      <span className={`font-mono font-black flex items-center gap-0.5 ${selectedETF.return5Y >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {selectedETF.return5Y >= 0 ? '+' : ''}{selectedETF.return5Y.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Risk Metrics Gauges */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-150">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-slate-500" />
                    Standard Risk Profiles
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Volatility (StdDev)</span>
                      <span className="text-sm font-mono font-black text-slate-800 block mt-1">
                        {selectedETF.stdDev.toFixed(1)}%
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-1 ${
                        selectedETF.stdDev > 15 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {selectedETF.stdDev > 15 ? 'High Vol' : 'Moderate Vol'}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Sharpe Ratio</span>
                      <span className="text-sm font-mono font-black text-indigo-700 block mt-1">
                        {selectedETF.sharpeRatio.toFixed(2)}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-1 ${
                        selectedETF.sharpeRatio >= 0.8 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {selectedETF.sharpeRatio >= 0.8 ? 'Excellent Risk/Reward' : 'Average Risk/Reward'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Holdings and Distributions Rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              
              {/* Holdings Breakdown */}
              <div className="border border-slate-200 rounded-3xl p-6 space-y-4">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <PieChart className="w-4 h-4 text-indigo-500" />
                  Top Holdings Breakdown (%)
                </h3>
                {selectedETF.holdings && selectedETF.holdings.length > 0 ? (
                  <div className="space-y-3.5">
                    {selectedETF.holdings.map((hold, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800">
                            {hold.name} <span className="text-slate-400 font-mono font-semibold">({hold.ticker})</span>
                          </span>
                          <span className="font-mono font-black text-slate-900">{hold.weight.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${Math.min(100, (hold.weight / selectedETF.holdings[0].weight) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 italic text-xs py-8 text-center">
                    Individual security breakdown not fully disclosed.
                  </div>
                )}
              </div>

              {/* Distributions History */}
              <div className="border border-slate-200 rounded-3xl p-6 space-y-4">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                  <Coins className="w-4 h-4 text-emerald-500" />
                  Recent Distribution Payment History
                </h3>
                {selectedETF.distributions && selectedETF.distributions.length > 0 ? (
                  <div className="space-y-1">
                    <div className="grid grid-cols-3 text-[10px] font-black uppercase text-slate-400 tracking-wider pb-1.5 border-b border-slate-100">
                      <span>Ex-Dividend Date</span>
                      <span className="text-right">Dividend Amount</span>
                      <span className="text-right">Franking Credits</span>
                    </div>
                    {selectedETF.distributions.map((dist, idx) => (
                      <div key={idx} className="grid grid-cols-3 text-xs py-2.5 border-b border-slate-50 last:border-b-0">
                        <span className="font-mono text-slate-600 font-bold">{dist.date}</span>
                        <span className="text-right font-mono font-black text-slate-900">
                          ${dist.amount.toFixed(2)}
                          <span className="text-[10px] font-normal text-slate-400 font-sans ml-0.5">/sh</span>
                        </span>
                        <span className="text-right font-mono font-bold">
                          {dist.franking !== undefined ? `${dist.franking}%` : '0%'}
                        </span>
                      </div>
                    ))}
                    <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl text-[11px] text-emerald-800 leading-normal mt-4">
                      <strong>Yield Calculation:</strong> Calculated as the sum of distributions paid in the trailing 12 months divided by current Net Asset Value.
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 italic text-xs py-10 text-center flex flex-col items-center justify-center gap-2">
                    <span className="text-lg">💰</span>
                    <div>
                      <p className="font-bold text-slate-700">Accumulation / Growth Fund</p>
                      <p className="text-slate-400 mt-1 max-w-xs text-[11px]">
                        This fund reinvests all underlying dividends directly back into the asset pool to maximize compounding capital growth (Zero Distributions).
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </motion.div>
      ) : (
        /* -------------------- MAIN ETF SCREENER LANDING VIEW -------------------- */
        <div className="space-y-6">
          
          {/* Top banner (leaderboard ad) */}
          <AdPlacement format="horizontal" />

          {/* Responsive Layout with Content on Left, Skyscraper Sidebar on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Side: Screener Filters, Comparison Table, and Results */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Active Preset Status Indicator */}
              {isPresetActive && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-indigo-100 border border-indigo-400 text-indigo-950 px-5 py-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">⚡</span>
                    <div>
                      <p className="font-extrabold text-indigo-950">Recommended Landing Presets Loaded</p>
                      <p className="text-xs text-indigo-900 font-medium mt-0.5">
                        Currently filtering: <strong>Asset Class: Equity</strong>, <strong>Management Fee (MER) &lt; 0.20%</strong>, and <strong>Distribution Yield &gt; 3.0%</strong>. 
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearFilters}
                      className="bg-indigo-900 hover:bg-indigo-950 text-indigo-50 hover:text-white border border-indigo-850 text-xs font-black px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
                    >
                      View All 20+ ETFs
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Popular Side-by-Side Comparison Searches Panel */}
              <div className="bg-gradient-to-r from-slate-950 to-indigo-950 text-white border border-indigo-900 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase text-indigo-300 tracking-wider flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-indigo-400" />
                      Popular Head-to-Head Comparison Searches
                    </h3>
                    <p className="text-[11px] text-slate-200 font-medium mt-0.5">
                      Instantly load side-by-side matrices and detailed portfolio advice for common investment queries
                    </p>
                  </div>
                  <span className="text-[9px] bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/40 font-black uppercase self-start sm:self-auto">
                    Guided Setups
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <button
                    onClick={() => {
                      setComparedTickers(['IVV', 'VAS', 'A200']);
                      setShowComparisonPanel(true);
                      setActiveInsightTab('ivv_vas');
                    }}
                    className="bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-indigo-500/50 p-3 rounded-2xl text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-white group-hover:text-indigo-200 transition font-mono">IVV vs VAS vs A200</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition" />
                    </div>
                    <p className="text-[10px] text-slate-200 font-medium mt-1 leading-normal">
                      S&amp;P 500 growth vs Aussie high-yield &amp; franking. Extreme cost efficiency analysis.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setComparedTickers(['VGE', 'VAS']);
                      setShowComparisonPanel(true);
                      setActiveInsightTab('vge_vas');
                    }}
                    className="bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-indigo-500/50 p-3 rounded-2xl text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-white group-hover:text-indigo-200 transition font-mono">VGE vs VAS Comparison</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition" />
                    </div>
                    <p className="text-[10px] text-slate-200 font-medium mt-1 leading-normal">
                      Emerging market tech &amp; consumer superpowers vs local broad dividend income.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setComparedTickers(['VGS', 'QUAL', 'IVV']);
                      setShowComparisonPanel(true);
                      setActiveInsightTab('intl');
                    }}
                    className="bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-indigo-500/50 p-3 rounded-2xl text-left transition group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-white group-hover:text-indigo-200 transition font-mono">International ETF Comparison</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition" />
                    </div>
                    <p className="text-[10px] text-slate-200 font-medium mt-1 leading-normal">
                      Broad global developed markets vs smart-beta quality factor vs US blue-chips.
                    </p>
                  </button>
                </div>
              </div>

              {/* Screener Controls Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                      <ListFilter className="w-5 h-5 text-indigo-600" />
                      Institutional Grade ETF Screener
                    </h2>
                    <p className="text-xs text-slate-400">Filter, sort, and compare from our master pool of 20+ premier index funds</p>
                  </div>

                  {/* Quick Presets row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Presets:</span>
                    <button
                      onClick={handleApplyDefaultPreset}
                      className={`text-[11px] font-bold px-3 py-1 rounded-xl border transition ${
                        isPresetActive 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      High Yield &amp; Low Cost (Default)
                    </button>
                    <button
                      onClick={() => {
                        setAssetClassFilter('Fixed Income');
                        setMaxMerFilter(0.4);
                        setMinYieldFilter(3.0);
                        setDomicileFilter('All');
                      }}
                      className="text-[11px] font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 px-3 py-1 rounded-xl transition"
                    >
                      Fixed Income &amp; Credit
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="text-[11px] font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 px-3 py-1 rounded-xl transition"
                    >
                      Reset / Clear All
                    </button>
                  </div>
                </div>

                {/* Grid of Filtering Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* 1. Asset Class */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      Asset Class Category
                    </label>
                    <select
                      value={assetClassFilter}
                      onChange={(e) => setAssetClassFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-hidden focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="All">All Categories</option>
                      <option value="Equity">Equity</option>
                      <option value="Fixed Income">Fixed Income</option>
                      <option value="Commodities">Commodities</option>
                      <option value="Multi-Asset">Multi-Asset / Diversified</option>
                      <option value="Thematic">Thematic Equity</option>
                    </select>
                  </div>

                  {/* 2. MER (Expense Ratio) Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Max Expense Ratio (MER)
                      </label>
                      <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                        &lt; {maxMerFilter.toFixed(2)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.03"
                      max="0.80"
                      step="0.01"
                      value={maxMerFilter}
                      onChange={(e) => setMaxMerFilter(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* 3. Distribution Yield Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        Min Distribution Yield
                      </label>
                      <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                        &gt; {minYieldFilter.toFixed(2)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.00"
                      max="6.00"
                      step="0.10"
                      value={minYieldFilter}
                      onChange={(e) => setMinYieldFilter(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* 4. Text Search */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                      Search Symbol or Name
                    </label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search e.g. IVV, VAS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 outline-hidden transition font-bold"
                      />
                    </div>
                  </div>

                </div>

                {/* Secondary Advanced Filters line */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    {/* Domicile filter */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Domicile:</span>
                      <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-200/80">
                        {['All', 'Australia', 'US'].map(d => (
                          <button
                            key={d}
                            onClick={() => setDomicileFilter(d)}
                            className={`px-2 py-0.5 text-[10px] font-black rounded transition ${
                              domicileFilter === d 
                                ? 'bg-white text-slate-900 shadow-2xs' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            {d === 'Australia' ? '🇦🇺 AU' : d === 'US' ? '🇺🇸 US' : 'All'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Return threshold */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Min 1Y Return:</span>
                      <select
                        value={minReturn1Y}
                        onChange={(e) => setMinReturn1Y(parseInt(e.target.value))}
                        className="bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold px-2 py-1 text-slate-700 outline-hidden"
                      >
                        <option value="-20">Any Return</option>
                        <option value="0">&gt; 0% Positive</option>
                        <option value="5">&gt; 5% Growth</option>
                        <option value="10">&gt; 10% Outperformance</option>
                        <option value="20">&gt; 20% Extreme Run</option>
                      </select>
                    </div>
                  </div>

                  {/* Status output */}
                  <div className="text-[11px] font-bold text-slate-400 font-mono">
                    Showing {table.getRowModel().rows.length} of {SCREENER_ETFS.length} Master ETFs
                  </div>
                </div>

              </div>

              {/* -------------------- SIDE-BY-SIDE COMPARISON PORTAL -------------------- */}
              {comparedTickers.length > 0 && (
                <div className="space-y-6">
                  <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-5 shadow-lg border border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
                          <Scale className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="font-black text-sm text-slate-100">ETF Side-by-Side Comparison Matrix</h3>
                          <p className="text-[11px] text-slate-400">Analyze fees, holdings, distributions, and tax efficiency of selected funds</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 self-end sm:self-auto">
                        <button
                          onClick={() => setShowComparisonPanel(!showComparisonPanel)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black px-4 py-2 rounded-xl transition shadow-2xs cursor-pointer"
                        >
                          {showComparisonPanel ? 'Collapse Detailed Grid' : 'Expand Detailed Grid'}
                        </button>
                        <button
                          onClick={clearComparison}
                          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Clear All"
                        >
                          <X className="w-3.5 h-3.5" />
                          Clear Comparison
                        </button>
                      </div>
                    </div>

                    {/* Visual Tickers Tray */}
                    <div className="flex flex-wrap items-center gap-2 bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider mr-1">Active Set:</span>
                      {activeComparedETFs.map(etf => (
                        <span 
                          key={etf.ticker}
                          className="inline-flex items-center gap-1.5 bg-slate-800 border border-slate-700/80 text-xs font-black px-3 py-1.5 rounded-xl transition hover:bg-slate-750"
                        >
                          <span className="text-indigo-400 font-mono font-black">{etf.ticker}</span>
                          <span className="text-[10px] text-slate-300 truncate max-w-[140px] font-sans font-medium">{etf.name}</span>
                          <button 
                            onClick={() => toggleComparison(etf.ticker)}
                            className="text-slate-500 hover:text-rose-400 p-0.5 transition cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {comparedTickers.length < 4 && (
                        <span className="text-[11px] text-slate-500 italic ml-2">
                          + Add up to {4 - comparedTickers.length} more from the table below
                        </span>
                      )}
                    </div>

                    {/* Deep matrix view when expanded */}
                    {showComparisonPanel && (
                      <div className="overflow-x-auto pt-2">
                        <table className="w-full text-xs text-left text-slate-300 border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                              <th className="py-3 pr-4 font-sans font-bold">Metric / Descriptor</th>
                              {activeComparedETFs.map(etf => (
                                <th key={etf.ticker} className="py-3 px-4 font-mono text-indigo-400 font-black text-center border-l border-slate-800/40 bg-slate-950/20">{etf.ticker}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-medium">
                            {/* --- FEE BLOCK --- */}
                            <tr className="bg-slate-950/10">
                              <td colSpan={activeComparedETFs.length + 1} className="py-2.5 pr-4 text-[10px] font-black uppercase text-indigo-400 tracking-wider font-sans pt-4">
                                Fund Fees &amp; Costs
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">Management Cost (MER)</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className="py-3.5 px-4 font-mono text-white font-black text-center border-l border-slate-800/40">
                                  {etf.mer.toFixed(2)}% <span className="text-[10px] text-slate-500 font-normal">p.a.</span>
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">Est. Fee on $10,000 Portfolio</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className="py-3.5 px-4 font-mono text-slate-200 text-center border-l border-slate-800/40 font-semibold">
                                  ${((etf.mer / 100) * 10000).toFixed(0)} <span className="text-[10px] text-slate-500 font-normal">AUD/yr</span>
                                </td>
                              ))}
                            </tr>

                            {/* --- RETURNS BLOCK --- */}
                            <tr className="bg-slate-950/10">
                              <td colSpan={activeComparedETFs.length + 1} className="py-2.5 pr-4 text-[10px] font-black uppercase text-indigo-400 tracking-wider font-sans pt-4">
                                Historical Performance Returns (Annualized)
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">1-Year Return</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className={`py-3.5 px-4 font-mono font-black text-center border-l border-slate-800/40 ${etf.return1Y >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {etf.return1Y >= 0 ? '+' : ''}{etf.return1Y.toFixed(1)}%
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">3-Year Return (Annualized)</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className={`py-3.5 px-4 font-mono font-black text-center border-l border-slate-800/40 ${etf.return3Y >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {etf.return3Y >= 0 ? '+' : ''}{etf.return3Y.toFixed(1)}%
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">5-Year Return (Annualized)</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className={`py-3.5 px-4 font-mono font-black text-center border-l border-slate-800/40 ${etf.return5Y >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {etf.return5Y >= 0 ? '+' : ''}{etf.return5Y.toFixed(1)}%
                                </td>
                              ))}
                            </tr>

                            {/* --- DISTRIBUTIONS BLOCK --- */}
                            <tr className="bg-slate-950/10">
                              <td colSpan={activeComparedETFs.length + 1} className="py-2.5 pr-4 text-[10px] font-black uppercase text-indigo-400 tracking-wider font-sans pt-4">
                                Income &amp; Distributions
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">Distribution Yield</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className="py-3.5 px-4 font-mono text-emerald-400 font-black text-center border-l border-slate-800/40">
                                  {etf.yield.toFixed(2)}%
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">Payment Frequency</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className="py-3.5 px-4 text-center border-l border-slate-800/40 text-slate-200 font-semibold font-sans">
                                  {ETF_COMP_METADATA[etf.ticker]?.distFrequency || 'N/A'}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">Estimated Franking level</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className="py-3.5 px-4 font-mono text-center border-l border-slate-800/40 font-black text-slate-200">
                                  {ETF_COMP_METADATA[etf.ticker]?.avgFranking !== '0%' ? (
                                    <span className="text-emerald-400">{ETF_COMP_METADATA[etf.ticker]?.avgFranking} Franked</span>
                                  ) : '0% (Unfranked)'}
                                </td>
                              ))}
                            </tr>

                            {/* --- HOLDINGS BLOCK --- */}
                            <tr className="bg-slate-950/10">
                              <td colSpan={activeComparedETFs.length + 1} className="py-2.5 pr-4 text-[10px] font-black uppercase text-indigo-400 tracking-wider font-sans pt-4">
                                Holdings &amp; Concentration
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">Total Holdings Count</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className="py-3.5 px-4 font-mono text-center border-l border-slate-800/40 text-slate-200 font-bold">
                                  {ETF_COMP_METADATA[etf.ticker]?.totalHoldings || 'N/A'} assets
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">Top-Weighted Position</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className="py-3.5 px-4 border-l border-slate-800/40 text-center">
                                  <span className="font-bold text-white block truncate max-w-[150px] mx-auto">{etf.holdings[0]?.name || 'N/A'}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">({etf.holdings[0]?.ticker || 'N/A'}) - {etf.holdings[0]?.weight?.toFixed(1) || '0'}%</span>
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">Fund Category Structure</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className="py-3.5 px-4 text-center border-l border-slate-800/40 text-slate-300 font-semibold text-[11px]">
                                  {ETF_COMP_METADATA[etf.ticker]?.structure || 'Traditional ETF'}
                                </td>
                              ))}
                            </tr>

                            {/* --- TAX & DOMICILE BLOCK --- */}
                            <tr className="bg-slate-950/10">
                              <td colSpan={activeComparedETFs.length + 1} className="py-2.5 pr-4 text-[10px] font-black uppercase text-indigo-400 tracking-wider font-sans pt-4">
                                Tax Efficiency &amp; Domicile Laws
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">Domicile Status</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className="py-3.5 px-4 text-center border-l border-slate-800/40 font-bold text-white font-sans text-xs">
                                  {etf.domicile === 'Australia' ? '🇦🇺 Australia' : '🇺🇸 US Domiciled'}
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400 text-xs">Tax Compliance Notes</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className="py-3.5 px-3 border-l border-slate-800/40 text-[10px] leading-relaxed text-slate-400 font-sans max-w-[180px]">
                                  {ETF_COMP_METADATA[etf.ticker]?.taxEfficiency || 'N/A'}
                                </td>
                              ))}
                            </tr>

                            {/* --- RISK BLOCK --- */}
                            <tr className="bg-slate-950/10">
                              <td colSpan={activeComparedETFs.length + 1} className="py-2.5 pr-4 text-[10px] font-black uppercase text-indigo-400 tracking-wider font-sans pt-4">
                                Risk &amp; Efficiency
                              </td>
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">Annualized Volatility</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className="py-3.5 px-4 font-mono text-center border-l border-slate-800/40">
                                  {etf.stdDev.toFixed(1)}% <span className="text-[10px] text-slate-500">Std Dev</span>
                                </td>
                              ))}
                            </tr>
                            <tr>
                              <td className="py-3.5 pr-4 font-bold text-slate-400">Sharpe Ratio (Risk-Adjusted)</td>
                              {activeComparedETFs.map(etf => (
                                <td key={etf.ticker} className="py-3.5 px-4 font-mono text-indigo-300 font-black text-center border-l border-slate-800/40">
                                  {etf.sharpeRatio.toFixed(2)}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* -------------------- DEDICATED INSTITUTIONAL COMPARISON EXPLANATION PANELS -------------------- */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Award className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">Guided Portfolio &amp; Strategic Insights</h4>
                        <p className="text-[11px] text-slate-400">Institutional structural analysis regarding the most searched comparisons</p>
                      </div>
                    </div>

                    {/* Tabs row */}
                    <div className="flex border-b border-slate-200">
                      <button
                        onClick={() => setActiveInsightTab('ivv_vas')}
                        className={`px-4 py-2 text-xs font-black border-b-2 transition ${
                          activeInsightTab === 'ivv_vas'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        IVV vs VAS vs A200
                      </button>
                      <button
                        onClick={() => setActiveInsightTab('vge_vas')}
                        className={`px-4 py-2 text-xs font-black border-b-2 transition ${
                          activeInsightTab === 'vge_vas'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        VGE vs VAS Comparison
                      </button>
                      <button
                        onClick={() => setActiveInsightTab('intl')}
                        className={`px-4 py-2 text-xs font-black border-b-2 transition ${
                          activeInsightTab === 'intl'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        International ETF Guide
                      </button>
                    </div>

                    {/* Tab 1 Content: WHY CHOOSE IVV OVER VAS */}
                    {activeInsightTab === 'ivv_vas' && (
                      <div className="space-y-4 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-150">
                        <div className="bg-indigo-50 border border-indigo-150/60 p-4 rounded-2xl">
                          <p className="font-black text-indigo-950 text-xs flex items-center gap-1">
                            <span>💡</span> Why choose S&amp;P 500 (IVV) over Broad Australian Shares (VAS)?
                          </p>
                          <p className="text-indigo-900 mt-1.5 leading-relaxed text-[11px]">
                            While both are passive core equity index funds, they offer fundamentally different profiles. Choosing **IVV over VAS** means opting for **secular technology growth** and international market leadership, whereas choosing **VAS** means prioritizing **tax-effective cash income** backed by banking and commodity giants.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          <div className="border border-slate-150 rounded-2xl p-4 space-y-2.5">
                            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block">
                              Strategic Reasons to Prefer IVV (S&amp;P 500)
                            </span>
                            <ul className="space-y-2 text-[11px] list-disc list-inside">
                              <li>
                                <strong className="text-slate-800">Superior Sector Diversification:</strong> S&amp;P 500 contains 28%+ Technology and Communication giants (Microsoft, Apple, NVIDIA, Alphabet). VAS is heavily concentrated (&gt;50%) in Banks (CBA, NAB) and Miners (BHP, Rio Tinto) which are highly cyclical.
                              </li>
                              <li>
                                <strong className="text-slate-800">Extreme Cost Efficiency:</strong> IVV has an incredibly low fee of <strong className="text-slate-900 font-mono text-[10px]">0.03% MER</strong> compared to <strong className="text-slate-900 font-mono text-[10px]">0.10%</strong> for VAS and <strong className="text-slate-900 font-mono text-[10px]">0.07%</strong> for A200, maximizing your compounding interest over decades.
                              </li>
                              <li>
                                <strong className="text-slate-800">Lower Portfolio Valuations / Higher Capital Gains:</strong> S&amp;P 500 firms reinvest up to 90% of earnings into proprietary research, AI chips, and product development, resulting in significantly higher capital appreciation and minimal immediate tax drag.
                              </li>
                            </ul>
                          </div>

                          <div className="border border-slate-150 rounded-2xl p-4 space-y-2.5">
                            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block">
                              Strategic Reasons to Prefer VAS / A200 (ASX)
                            </span>
                            <ul className="space-y-2 text-[11px] list-disc list-inside">
                              <li>
                                <strong className="text-slate-800">Robust Cash Dividend Income:</strong> VAS pays a substantial yield of <strong className="text-slate-900 font-mono text-[10px]">3.85%</strong> (and A200 yields <strong className="text-slate-900 font-mono text-[10px]">4.10%</strong>) compared to IVV's low yield of <strong className="text-slate-900 font-mono text-[10px]">1.35%</strong>.
                              </li>
                              <li>
                                <strong className="text-slate-800">Tax-Effective Franking Credits:</strong> ASX dividends carry **franking credits** (average 75-82% franked) which directly offset Australian tax liability, effectively boosting the gross yield by another 1% to 1.5% for local investors.
                              </li>
                              <li>
                                <strong className="text-slate-800">Simplified Local Domicile Reporting:</strong> Australian domiciled ETFs pre-fill directly into the Australian Taxation Office (ATO) portal, avoiding foreign tax filing rules or US withholding tax worries.
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Comparative Summary Verdict Box */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[11px] space-y-2">
                          <span className="font-extrabold text-slate-900 block uppercase tracking-wider text-[10px]">The Professional Verdict</span>
                          <p>
                            Choose <strong className="text-slate-900">IVV</strong> if you are in your long-term wealth accumulation phase, seek maximum exposure to the global technology and consumer revolutions, and have a higher marginal tax rate (where capital gains deferral is more advantageous than immediate cash dividends).
                          </p>
                          <p className="border-t border-slate-200/60 pt-2 mt-1">
                            Choose <strong className="text-slate-900">VAS or A200</strong> if you are approaching retirement or seek consistent, highly-franked dividend income to fund current living expenses, and want a direct stake in Australia's high-yielding oligopolistic banking and resource sectors.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tab 2 Content: VGE vs VAS COMPARISON */}
                    {activeInsightTab === 'vge_vas' && (
                      <div className="space-y-4 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-150">
                        <div className="bg-indigo-50 border border-indigo-150/60 p-4 rounded-2xl">
                          <p className="font-black text-indigo-950 text-xs flex items-center gap-1">
                            <span>📈</span> Emerging Markets Growth (VGE) vs Australian Domestic Core (VAS)
                          </p>
                          <p className="text-indigo-900 mt-1.5 leading-relaxed text-[11px]">
                            Comparing **VGE vs VAS** is a battle of premium, high-dividend domestic stability against high-risk, long-term secular growth in emerging economic superpowers like Taiwan, India, China, and South Korea.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border border-slate-150 rounded-2xl p-4 space-y-2.5">
                            <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider block">
                              VGE (Vanguard Emerging Markets)
                            </span>
                            <p className="text-[11px]">
                              <strong>High Beta &amp; Broad Scope:</strong> VGE provides absolute diversification away from Western markets. Holds 1,200+ companies including semiconductor champions (TSMC, Samsung) and tech conglomerates (Tencent, Alibaba).
                            </p>
                            <p className="text-[11px] text-slate-400">
                              ⚠️ Note: Emerging markets carry higher geopolitical risk, higher currency volatility, and an MER fee of 0.48% (quite expensive). Trailing Sharpe ratio is low (0.25), meaning high volatility for historical returns.
                            </p>
                          </div>

                          <div className="border border-slate-150 rounded-2xl p-4 space-y-2.5">
                            <span className="text-[10px] font-black uppercase text-slate-800 tracking-wider block">
                              VAS (Vanguard ASX 200 Broad-Market)
                            </span>
                            <p className="text-[11px]">
                              <strong>Domestic Haven:</strong> Backed by robust rule of law, highly capitalised financial systems, and essential iron-ore mining infrastructure. 
                            </p>
                            <p className="text-[11px] text-slate-400">
                              💰 Features high yield (3.85%) and 75%+ franking, which acts as a powerful cash compounder in the local taxation ecosystem. Charging only 0.10% MER.
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[11px]">
                          <strong className="text-slate-900 block mb-1">Portfolio Strategy Recommendation:</strong>
                          These ETFs are not mutual substitutes; they are **highly complementary**. Modern portfolio theory suggests allocating **5% to 10%** of an equity portfolio to Emerging Markets (VGE) to hedge against Western currency decline and benefit from developing population growth, while keeping VAS as a key local core yield anchor.
                        </div>
                      </div>
                    )}

                    {/* Tab 3 Content: INTERNATIONAL ETF COMPARISON AUSTRALIA */}
                    {activeInsightTab === 'intl' && (
                      <div className="space-y-4 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-150">
                        <div className="bg-indigo-50 border border-indigo-150/60 p-4 rounded-2xl">
                          <p className="font-black text-indigo-950 text-xs flex items-center gap-1">
                            <span>🌏</span> International ETF Comparison: VGS vs QUAL vs IVV
                          </p>
                          <p className="text-indigo-900 mt-1.5 leading-relaxed text-[11px]">
                            Australian investors seeking international expansion face three major options: Broad global indices, factor-based quality screenings, or US large-cap indices. Here is the institutional breakdown of the three heavyweights.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="border border-slate-150 rounded-2xl p-3.5 space-y-2">
                            <strong className="text-slate-900 text-xs block">VGS (MSCI World Broad Index)</strong>
                            <p className="text-[11px] text-slate-500">
                              Owns 1,500+ major companies across 22 developed countries. 
                            </p>
                            <p className="text-[11px]">
                              <strong>Best for:</strong> Maximum simplicity and safety. Zero single-country concentration risk, covering US, Europe, Japan, and Canada. Fees are 0.18%.
                            </p>
                          </div>

                          <div className="border border-slate-150 rounded-2xl p-3.5 space-y-2">
                            <strong className="text-slate-900 text-xs block">QUAL (MSCI International Quality)</strong>
                            <p className="text-[11px] text-slate-500">
                              Screens VGS companies for high Return on Equity (ROE), stable earnings growth, and low debt.
                            </p>
                            <p className="text-[11px]">
                              <strong>Best for:</strong> Long-term outperformance. Outstanding historic return (22.1% last year, 15.2% 5-year annualized). Fees are 0.40%.
                            </p>
                          </div>

                          <div className="border border-slate-150 rounded-2xl p-3.5 space-y-2">
                            <strong className="text-slate-900 text-xs block">IVV (S&amp;P 500 US Blue-Chips)</strong>
                            <p className="text-[11px] text-slate-500">
                              Focuses purely on the top 500 leading enterprises listed in the US.
                            </p>
                            <p className="text-[11px]">
                              <strong>Best for:</strong> Ultimate cost-efficiency. Charges a near-zero 0.03% MER. US companies generate 40%+ of sales globally, offering organic global reach.
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-[11px] space-y-2">
                          <span className="font-extrabold text-slate-900 block uppercase tracking-wider text-[10px]">Tax &amp; Domicile Warning for International ETFs</span>
                          <p>
                            Always verify the fund's **domicile** before allocating large balances. VGS, QUAL, and IVV are Australian-domiciled or dual-listed (CDI), meaning **no W-8BEN form is needed**. 
                          </p>
                          <p>
                            However, if you purchase <strong className="text-slate-950 font-mono">VTS (Vanguard US Total Market)</strong>, which is physically US-domiciled, you **must file a W-8BEN form** every three years with the US IRS to avoid a punitive 30% dividend withholding tax.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Below comparison table (native ad) */}
                  <AdPlacement format="native" />
                </div>
              )}

              {/* -------------------- RESULTS TABLE GRID -------------------- */}
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs">
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id} className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          {headerGroup.headers.map(header => {
                            const canSort = header.column.getCanSort();
                            const isNumeric = ['mer', 'yield', 'return1Y', 'return3Y', 'return5Y'].includes(header.column.id);
                            const isHiddenOnMobile = header.column.id === 'return3Y' ? 'hidden sm:table-cell' : header.column.id === 'return5Y' ? 'hidden md:table-cell' : '';
                            
                            return (
                              <th 
                                key={header.id}
                                onClick={header.column.getToggleSortingHandler()}
                                className={`py-3.5 px-4 font-sans ${canSort ? 'cursor-pointer hover:bg-slate-100 hover:text-slate-900 transition' : ''} ${isNumeric ? 'text-right' : ''} ${isHiddenOnMobile} ${header.column.id === 'ticker' ? 'pl-6' : ''}`}
                              >
                                <span className={`flex items-center gap-1 ${isNumeric ? 'justify-end' : ''}`}>
                                  {flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                                  {canSort && (
                                    <ArrowUpDown className="w-3 h-3 opacity-60 shrink-0" />
                                  )}
                                </span>
                              </th>
                            );
                          })}
                        </tr>
                      ))}
                    </thead>
                    
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {table.getRowModel().rows.length === 0 ? (
                        <tr>
                          <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                            <div className="max-w-md mx-auto space-y-2">
                              <p className="font-bold text-slate-700">No ETFs match your active filters</p>
                              <p className="text-[11px] text-slate-400">
                                Try broadening your parameters (e.g. raise MER boundary or lower minimum yield expectation) or click below to restore default.
                              </p>
                              <button
                                onClick={handleClearFilters}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-bold transition mt-2"
                              >
                                Reset Filters (See all 20+ ETFs)
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        table.getRowModel().rows.map(row => {
                          return (
                            <tr 
                              key={row.id}
                              className="hover:bg-slate-50/75 transition duration-100 group"
                            >
                              {row.getVisibleCells().map(cell => {
                                const isNumeric = ['mer', 'yield', 'return1Y', 'return3Y', 'return5Y'].includes(cell.column.id);
                                const isHiddenOnMobile = cell.column.id === 'return3Y' ? 'hidden sm:table-cell' : cell.column.id === 'return5Y' ? 'hidden md:table-cell' : '';
                                return (
                                  <td 
                                    key={cell.id} 
                                    className={`py-4 px-4 ${isNumeric ? 'text-right' : ''} ${isHiddenOnMobile} ${cell.column.id === 'ticker' ? 'pl-6 font-mono font-black text-slate-900' : ''}`}
                                  >
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext()
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Info className="w-4 h-4 text-indigo-500" />
                    Clicking any Ticker code (e.g. IVV) launches its dedicated performance analysis, distribution log, and holdings weight.
                  </span>
                  <span>
                    Total monitored database size: {SCREENER_ETFS.length}
                  </span>
                </div>

              </div>

            </div>

            {/* Right Side: Sidebar Skyscraper Ad and helper cards */}
            <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-6">
              <AdPlacement format="skyscraper" />
              
              {onNavigateToBlog && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 space-y-3.5 shadow-2xs">
                  <span className="font-extrabold text-xs text-indigo-950 uppercase tracking-wider block">📚 Related Educational Guides</span>
                  <p className="text-[11px] text-slate-700 font-medium leading-relaxed">
                    Improve your long-term outcomes with deep analytical strategy reviews written by senior portfolio managers:
                  </p>
                  <div className="space-y-2 pt-0.5">
                    <button
                      onClick={() => onNavigateToBlog('best-low-cost-etfs-2026')}
                      className="w-full text-left bg-white hover:bg-indigo-50 border border-slate-300 rounded-xl p-2.5 text-[11px] font-extrabold text-indigo-950 flex items-center justify-between group transition cursor-pointer shadow-3xs"
                    >
                      <span>Best Low-Cost ETFs (2026)</span>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-0.5 transition" />
                    </button>
                    <button
                      onClick={() => onNavigateToBlog('ivv-vs-vas-comparison')}
                      className="w-full text-left bg-white hover:bg-indigo-50 border border-slate-300 rounded-xl p-2.5 text-[11px] font-extrabold text-indigo-950 flex items-center justify-between group transition cursor-pointer shadow-3xs"
                    >
                      <span>IVV vs VAS: Which to Buy?</span>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-0.5 transition" />
                    </button>
                    <button
                      onClick={() => onNavigateToBlog('how-to-build-a-1m-portfolio')}
                      className="w-full text-left bg-white hover:bg-indigo-50 border border-slate-300 rounded-xl p-2.5 text-[11px] font-extrabold text-indigo-950 flex items-center justify-between group transition cursor-pointer shadow-3xs"
                    >
                      <span>Build a $1M Portfolio Blueprint</span>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-0.5 transition" />
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-[11px] text-slate-500 leading-relaxed shadow-xs">
                <span className="font-extrabold text-slate-800 uppercase block mb-1">💡 Management Fees (MER)</span>
                Management expense ratios are deducted directly from the fund asset value before unit prices are updated. You do not receive an invoice for these fees.
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200/40 rounded-2xl p-5 text-[11px] text-emerald-800 leading-relaxed shadow-xs">
                <span className="font-extrabold text-emerald-950 uppercase block mb-1">🇦🇺 Franking Credit Boost</span>
                Australian-domiciled ETFs receive franked dividends from underlying ASX shares. These credits can boost actual cash yields by up to 1.5% - 2.0% annually.
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
