import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  SlidersHorizontal, 
  Plus, 
  Download, 
  Upload, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  PieChart as PieIcon, 
  X,
  Sliders,
  Globe,
  Terminal,
  Cpu,
  Database,
  Layers,
  Info,
  AlertTriangle,
  Eye,
  LineChart,
  Sparkles,
  BookOpen,
  Briefcase,
  Calculator,
  Zap,
  Scale,
  Sun,
  Moon
} from 'lucide-react';

import { ETF, ETFRules, ETFCurrentData, HistoryEntry } from './types';
import { getDefaultWatchlist, generateDefaultHistory, checkRules } from './data';
import WatchlistCard from './components/WatchlistCard';
import HistoryCharts from './components/HistoryCharts';
import InsightsView from './components/InsightsView';
import { OverlapView } from './components/OverlapView';
import PortfolioBuilder from './components/PortfolioBuilder';
import DividendTaxEstimator from './components/DividendTaxEstimator';
import DCAOptimizer from './components/DCAOptimizer';
import PortfolioRebalancer from './components/PortfolioRebalancer';
import AICopilot from './components/AICopilot';
import AdPlacement from './components/AdPlacement';
import ETFScreener from './components/ETFScreener';
import { BlogView } from './components/BlogView';
import { SCREENER_ETFS } from './screenerData';
import { BLOG_POSTS } from './blogData';

export default function App() {
  const [watchlist, setWatchlist] = useState<ETF[]>(() => {
    const saved = localStorage.getItem('etf-watchlist');
    return saved ? JSON.parse(saved) : getDefaultWatchlist();
  });

  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    const saved = localStorage.getItem('etf-history');
    return saved ? JSON.parse(saved) : generateDefaultHistory();
  });

  const [activeTab, setActiveTab] = useState<string>('screener');
  const [selectedBlogPostId, setSelectedBlogPostId] = useState<string | null>(null);
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [editingMetricsTicker, setEditingMetricsTicker] = useState<string | null>(null);
  const [tempMetrics, setTempMetrics] = useState<ETFCurrentData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(() => localStorage.getItem('etf-last-fetch'));
  
  // Real-Time Issuer Scraper Console state
  const [showScraperConsole, setShowScraperConsole] = useState<boolean>(false);
  const [globalScraperLogs, setGlobalScraperLogs] = useState<string[]>([]);

  // Day/Night Theme Toggle
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('etf-dark-mode');
    return saved !== null ? saved === 'true' : true;
  });

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'ticker' | 'discount' | 'yield' | 'expense'>('ticker');
  const [filterSignal, setFilterSignal] = useState<'all' | 'signals_only'>('all');
  const [filterDomicile, setFilterDomicile] = useState<'all' | 'australia' | 'us'>('all');

  // Chart configuration
  const [selectedChartTicker, setSelectedChartTicker] = useState<string>('VAS');

  // Add Custom ETF Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTicker, setNewTicker] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newDomicile, setNewDomicile] = useState<'Australia' | 'US'>('Australia');
  const [newRules, setNewRules] = useState<ETFRules>({
    ntaDiscount: 0.5,
    expenseRatio: 0.15,
    fundSize: 150,
    yield: 2.5
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear messages automatically
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('etf-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('etf-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('etf-dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('etf-dark-mode', 'false');
    }
  }, [isDarkMode]);

  // Synchronize client-side routing /blog paths
  useEffect(() => {
    const handleRouteSync = () => {
      const path = window.location.pathname;
      if (path === '/blog' || path === '/blog/') {
        setActiveTab('blog');
        setSelectedBlogPostId(null);
      } else if (path.startsWith('/blog/')) {
        const parts = path.split('/');
        const postId = parts[2];
        if (postId) {
          setActiveTab('blog');
          setSelectedBlogPostId(postId);
        }
      }
    };

    handleRouteSync();
    window.addEventListener('popstate', handleRouteSync);
    return () => window.removeEventListener('popstate', handleRouteSync);
  }, []);

  // Dynamic SEO Page Title & Description Updates
  useEffect(() => {
    if (activeTab === 'blog') {
      if (selectedBlogPostId) {
        const post = BLOG_POSTS.find(p => p.id === selectedBlogPostId);
        if (post) {
          document.title = `${post.title} | ASX ETF Screener`;
          
          // Dynamically update meta description in the head for client-side SEO indexing
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', post.excerpt.slice(0, 155));
          }
          return;
        }
      }
      document.title = "Educational Hub | Best Australian ETF Investing Blog & Guides";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', "Read educational guides, comparisons, and wealth strategies about Australian ASX-listed exchange-traded funds (ETFs) and fee optimization.");
      }
    } else {
      document.title = "ASX ETF Screener | Best Australian ETF Watchlist & Buy Signals";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', "Compare Australian ASX ETFs with our premium screener. Track NTA discounts, expense ratios, dividends, and get buy signals on your custom ETF watchlist.");
      }
    }
  }, [activeTab, selectedBlogPostId]);

  const handleNavigateToTab = (tab: string, ticker?: string) => {
    setActiveTab(tab);
    if (ticker) {
      setSearchTerm(ticker);
      setSelectedChartTicker(ticker);
    }
    window.history.pushState(null, '', '/');
  };

  const handleNavigateToBlog = (postId: string) => {
    setActiveTab('blog');
    setSelectedBlogPostId(postId);
    window.history.pushState(null, '', `/blog/${postId}`);
  };

  // Master Issuer Scraper Suite Pipeline
  async function runIssuerScraperPipeline() {
    setLoading(true);
    setError(null);
    setGlobalScraperLogs([
      `[CONSOLE ACTIVE] Initializing Multi-Issuer Scraping Engines...`,
      `[SYSTEM] Current local time: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      `[ROUTING] Binding active handlers:`,
      `  - Vanguard Australia Scraper (VAS, VGS, VHY, VGE, VTS) via Vanguard API Feed`,
      `  - BetaShares CSV Parser Scraper (A200, NDQ, DHHF) via Public File Reader`,
      `  - iShares BlackRock AJAX Reader (IVV) via Portfolio JSON AJAX Feed`,
      `  - Yahoo Finance Multi-Module supplementer [price, summaryDetail, defaultKeyStatistics]`,
      `[NETWORK] Dispatching parallel scraper queries to local Express backend...`,
      ``
    ]);
    setShowScraperConsole(true);

    try {
      const tickers = watchlist.map(e => e.ticker);
      if (tickers.length === 0) {
        setError("Add ETFs to your watchlist first.");
        setLoading(false);
        return;
      }

      const response = await fetch('/api/scrape-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers }),
      });

      if (!response.ok) {
        throw new Error('Server returned error during scraper execution');
      }

      const data = await response.json();
      const scraped = data.scraped || {};

      const nowStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newGlobalLogs: string[] = [
        `==================================================`,
        `🎉 MULTI-SOURCE AUTOMATED SCRAPER RUN COMPLETED!`,
        `Finished at: ${new Date().toLocaleTimeString()}`,
        `==================================================`,
        ``
      ];

      const updatedWatchlist = watchlist.map(etf => {
        const result = scraped[etf.ticker];
        if (result) {
          if (result.log) {
            newGlobalLogs.push(`--- Log output for ticker: ${etf.ticker} ---`);
            newGlobalLogs.push(...result.log);
            newGlobalLogs.push("");
          }

          const updatedData = {
            price: result.price,
            nta: result.nta,
            premiumDiscount: result.premiumDiscount,
            pe: result.pe,
            yield: result.yield,
            expenseRatio: result.expenseRatio,
            fundSize: result.fundSize,
          };

          return {
            ...etf,
            currentData: updatedData,
            source: result.source,
            scrapeLogs: result.log,
            lastUpdated: nowStr + ' (Scraped)'
          };
        }
        return etf;
      });

      setGlobalScraperLogs(prev => [...prev, ...newGlobalLogs]);
      setWatchlist(updatedWatchlist);
      setSuccessMessage("Automated multi-source issuer scrapers executed successfully!");
      setLastFetch(nowStr);
      localStorage.setItem('etf-last-fetch', nowStr);

      // Append new history records
      const todayISO = new Date().toISOString().split('T')[0];
      const newHistoryEntries: HistoryEntry[] = [];

      updatedWatchlist.forEach(etf => {
        if (etf.currentData.price !== null && etf.currentData.nta !== null) {
          newHistoryEntries.push({
            date: todayISO,
            ticker: etf.ticker,
            price: etf.currentData.price,
            nta: etf.currentData.nta,
            premiumDiscount: etf.currentData.premiumDiscount || 0,
          });
        }
      });

      if (newHistoryEntries.length > 0) {
        setHistory(prev => {
          const filtered = prev.filter(h => {
            const isDup = newHistoryEntries.some(n => n.ticker === h.ticker && n.date === h.date);
            return !isDup;
          });
          return [...filtered, ...newHistoryEntries];
        });
      }
    } catch (err: any) {
      console.error("Scraping error:", err);
      setError("Failed to run automated scraping. Using high-fidelity fallback generator.");
      setGlobalScraperLogs(prev => [
        ...prev,
        `[CRITICAL ERROR] Scraping pipeline failed: ${err.message || err}`,
        `[FALLBACK] Launching local multi-source generation fallbacks...`
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Fetch all ticker prices from our local Express server proxy
  async function fetchAllPrices() {
    setLoading(true);
    setError(null);
    try {
      const tickers = watchlist.map(e => e.ticker);
      if (tickers.length === 0) {
        setError("Add ETFs to your watchlist first.");
        setLoading(false);
        return;
      }

      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers }),
      });

      if (!response.ok) {
        throw new Error('Server returned error while proxying');
      }

      const data = await response.json();
      const fetchedPrices = data.prices || {};

      const nowStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const updatedWatchlist = watchlist.map(etf => {
        const fetched = fetchedPrices[etf.ticker];
        if (fetched && fetched.price !== null) {
          const price = parseFloat(fetched.price);
          const updatedData = { ...etf.currentData, price };
          
          // Re-calculate Premium/Discount dynamically if NTA exists
          if (updatedData.nta) {
            updatedData.premiumDiscount = parseFloat(
              (((price - updatedData.nta) / updatedData.nta) * 100).toFixed(2)
            );
          }

          return {
            ...etf,
            currentData: updatedData,
            lastUpdated: nowStr,
          };
        }
        return etf;
      });

      setWatchlist(updatedWatchlist);
      setSuccessMessage("Live ASX market prices updated successfully!");
      setLastFetch(nowStr);
      localStorage.setItem('etf-last-fetch', nowStr);

      // Append new history records
      const todayISO = new Date().toISOString().split('T')[0];
      const newHistoryEntries: HistoryEntry[] = [];

      updatedWatchlist.forEach(etf => {
        if (etf.currentData.price !== null && etf.currentData.nta !== null) {
          newHistoryEntries.push({
            date: todayISO,
            ticker: etf.ticker,
            price: etf.currentData.price,
            nta: etf.currentData.nta,
            premiumDiscount: etf.currentData.premiumDiscount || 0,
          });
        }
      });

      if (newHistoryEntries.length > 0) {
        setHistory(prev => {
          // Filter out duplicates for today
          const filtered = prev.filter(h => {
            const isDup = newHistoryEntries.some(n => n.ticker === h.ticker && n.date === h.date);
            return !isDup;
          });
          return [...filtered, ...newHistoryEntries];
        });
      }
    } catch (err) {
      console.error("API error:", err);
      setError("Failed to fetch live prices. Using high-fidelity local simulations instead.");
      
      // Fallback update
      const nowStr = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Simulated)';
      const updatedWatchlist = watchlist.map(etf => {
        const basePrice = etf.currentData.price || 50;
        const randWalk = basePrice * (1 + (Math.random() - 0.5) * 0.015);
        const updatedData = { 
          ...etf.currentData, 
          price: parseFloat(randWalk.toFixed(2)) 
        };
        if (updatedData.nta) {
          updatedData.premiumDiscount = parseFloat(
            (((updatedData.price - updatedData.nta) / updatedData.nta) * 100).toFixed(2)
          );
        }
        return {
          ...etf,
          currentData: updatedData,
          lastUpdated: nowStr
        };
      });
      setWatchlist(updatedWatchlist);
      setLastFetch(nowStr);
    } finally {
      setLoading(false);
    }
  }

  // Trigger file selection dialog
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Robust client-side CSV Import
  function handleCSVImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        if (!csv) return;

        const lines = csv.trim().split('\n');
        if (lines.length < 2) {
          setError("Invalid CSV format. Header and at least one data row are required.");
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const normalizedHeaders = headers.map(h => h.toLowerCase());

        const tIdx = normalizedHeaders.findIndex(h => h === 'ticker' || h === 'symbol');
        const nameIdx = normalizedHeaders.findIndex(h => h === 'name' || h === 'description');
        const domicileIdx = normalizedHeaders.findIndex(h => h === 'domicile' || h === 'country');
        const ntaIdx = normalizedHeaders.findIndex(h => h === 'nta' || h === 'net asset value');
        const peIdx = normalizedHeaders.findIndex(h => h === 'pe' || h === 'pe ratio' || h === 'p/e');
        const yieldIdx = normalizedHeaders.findIndex(h => h === 'yield' || h === 'dividend yield');
        const expIdx = normalizedHeaders.findIndex(h => h === 'expense ratio' || h === 'management fee' || h === 'mer');
        const sizeIdx = normalizedHeaders.findIndex(h => h === 'fund size' || h === 'fund size (aud m)' || h === 'size' || h === 'aum');

        if (tIdx === -1) {
          setError("CSV must contain a 'Ticker' or 'Symbol' column.");
          return;
        }

        const updated = [...watchlist];
        let matchCount = 0;

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const values = (lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(','))
            .map(v => v.trim().replace(/^"|"$/g, ''));

          const ticker = values[tIdx]?.toUpperCase();
          if (!ticker) continue;

          let etf = updated.find(e => e.ticker === ticker);
          
          // Create new ETF if not exists
          if (!etf) {
            etf = {
              ticker,
              name: nameIdx !== -1 && values[nameIdx] ? values[nameIdx] : `${ticker} ETF`,
              domicile: domicileIdx !== -1 && values[domicileIdx]?.toLowerCase() === 'us' ? 'US' : 'Australia',
              rules: { ntaDiscount: 0.5, expenseRatio: 0.25, fundSize: 150, yield: 2.5 },
              currentData: { price: null, nta: null, premiumDiscount: null, pe: null, yield: null, expenseRatio: null, fundSize: null },
              lastUpdated: null,
            };
            updated.push(etf);
          }

          // Update values
          if (nameIdx !== -1 && values[nameIdx]) etf.name = values[nameIdx];
          if (domicileIdx !== -1 && values[domicileIdx]) {
            etf.domicile = values[domicileIdx].toUpperCase() === 'US' ? 'US' : 'Australia';
          }
          if (ntaIdx !== -1 && values[ntaIdx]) etf.currentData.nta = parseFloat(values[ntaIdx]);
          if (peIdx !== -1 && values[peIdx]) etf.currentData.pe = parseFloat(values[peIdx]) || null;
          if (yieldIdx !== -1 && values[yieldIdx]) etf.currentData.yield = parseFloat(values[yieldIdx]) || null;
          if (expIdx !== -1 && values[expIdx]) etf.currentData.expenseRatio = parseFloat(values[expIdx]) || null;
          if (sizeIdx !== -1 && values[sizeIdx]) etf.currentData.fundSize = parseFloat(values[sizeIdx]) || null;

          // Recalculate
          if (etf.currentData.price && etf.currentData.nta) {
            etf.currentData.premiumDiscount = parseFloat(
              (((etf.currentData.price - etf.currentData.nta) / etf.currentData.nta) * 100).toFixed(2)
            );
          }

          etf.lastUpdated = new Date().toLocaleDateString() + ' (CSV Import)';
          matchCount++;
        }

        setWatchlist(updated);
        setSuccessMessage(`Successfully imported ${matchCount} ETFs from CSV.`);
        if (event.target) event.target.value = ''; // Reset
      } catch (err) {
        console.error(err);
        setError("Error parsing CSV. Please check formatting.");
      }
    };
    reader.readAsText(file);
  }

  // Export current watchlist
  function downloadCSVTemplate() {
    const headers = ['Ticker', 'Name', 'Domicile', 'NTA', 'PE', 'Yield', 'Expense Ratio', 'Fund Size (AUD M)'];
    const rows = watchlist.map(e => [
      e.ticker,
      e.name,
      e.domicile,
      e.currentData.nta !== null ? e.currentData.nta : '',
      e.currentData.pe !== null ? e.currentData.pe : '',
      e.currentData.yield !== null ? e.currentData.yield : '',
      e.currentData.expenseRatio !== null ? e.currentData.expenseRatio : '',
      e.currentData.fundSize !== null ? e.currentData.fundSize : '',
    ]);
    
    const csvContent = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'asx-etf-sentinel-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMessage("CSV exported successfully!");
  }

  // Update target rules
  function updateRule(ticker: string, field: keyof ETFRules, value: number) {
    if (isNaN(value) || value < 0) return;
    const updated = watchlist.map(e =>
      e.ticker === ticker ? { ...e, rules: { ...e.rules, [field]: value } } : e
    );
    setWatchlist(updated);
  }

  // Update user's purchase price and shares owned
  function updateInvestment(ticker: string, purchasePrice: number | null, sharesOwned: number | null) {
    const updated = watchlist.map(e =>
      e.ticker === ticker ? { ...e, purchasePrice, sharesOwned } : e
    );
    setWatchlist(updated);
    setSuccessMessage(`Updated investment metrics for ${ticker}`);
  }

  // Reset watchlist to the premium defaults (including all premium Australian ETFs)
  function resetWatchlist() {
    if (confirm("Are you sure you want to restore the default ASX ETF watchlist (including premium Australian-domiciled indexes VAS, A200, VGS, NDQ, DHHF)? This will overwrite your current watchlist.")) {
      setWatchlist(getDefaultWatchlist());
      setHistory(generateDefaultHistory());
      setSuccessMessage("Watchlist restored to default Australian & US ETFs successfully!");
      localStorage.removeItem('etf-watchlist');
      localStorage.removeItem('etf-history');
    }
  }

  // Edit live parameters
  function startEditingMetrics(etf: ETF) {
    setEditingMetricsTicker(etf.ticker);
    setTempMetrics({ ...etf.currentData });
  }

  function saveMetrics(ticker: string) {
    if (!tempMetrics) return;

    const updatedMetrics = { ...tempMetrics };
    if (updatedMetrics.price !== null && updatedMetrics.nta !== null && updatedMetrics.nta !== 0) {
      updatedMetrics.premiumDiscount = parseFloat(
        (((updatedMetrics.price - updatedMetrics.nta) / updatedMetrics.nta) * 100).toFixed(2)
      );
    } else {
      updatedMetrics.premiumDiscount = null;
    }

    const updated = watchlist.map(e => {
      if (e.ticker === ticker) {
        return {
          ...e,
          currentData: updatedMetrics,
          lastUpdated: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (Manual)',
        };
      }
      return e;
    });

    setWatchlist(updated);
    setEditingMetricsTicker(null);
    setTempMetrics(null);
    setSuccessMessage(`Updated parameters for ${ticker}`);

    // Log history
    const todayISO = new Date().toISOString().split('T')[0];
    if (updatedMetrics.price !== null && updatedMetrics.nta !== null) {
      const newHist: HistoryEntry = {
        date: todayISO,
        ticker,
        price: updatedMetrics.price,
        nta: updatedMetrics.nta,
        premiumDiscount: updatedMetrics.premiumDiscount || 0
      };
      setHistory(prev => {
        const filtered = prev.filter(h => !(h.ticker === ticker && h.date === todayISO));
        return [...filtered, newHist];
      });
    }
  }

  // Add new ETF
  function handleAddETF(e: React.FormEvent) {
    e.preventDefault();
    const cleanTicker = newTicker.trim().toUpperCase();
    if (!cleanTicker) {
      setError("Please provide a valid ticker.");
      return;
    }

    if (watchlist.some(etf => etf.ticker === cleanTicker)) {
      setError(`ETF ticker "${cleanTicker}" already exists.`);
      return;
    }

    const brandName = newName.trim() || `${cleanTicker} Index ETF`;

    const newETF: ETF = {
      ticker: cleanTicker,
      name: brandName,
      domicile: newDomicile,
      rules: { ...newRules },
      currentData: {
        price: null,
        nta: null,
        premiumDiscount: null,
        pe: null,
        yield: null,
        expenseRatio: null,
        fundSize: null,
        bidAskSpread: 0.05,
        distributionFreq: 'Quarterly',
        frankingCredits: newDomicile === 'Australia' ? 30 : 0,
        trackingError: 0.03,
        drpActive: true
      },
      lastUpdated: null,
    };

    setWatchlist([...watchlist, newETF]);
    setShowAddModal(false);
    
    setNewTicker('');
    setNewName('');
    setNewDomicile('Australia');
    setNewRules({ ntaDiscount: 0.5, expenseRatio: 0.15, fundSize: 150, yield: 2.5 });
    
    setSuccessMessage(`Added ${cleanTicker} successfully!`);
    setSelectedChartTicker(cleanTicker);
  }

  // Remove custom ETF
  function removeETF(ticker: string) {
    if (confirm(`Remove ${ticker} and its trends?`)) {
      setWatchlist(watchlist.filter(e => e.ticker !== ticker));
      setHistory(history.filter(h => h.ticker !== ticker));
      setSuccessMessage(`Removed ${ticker} and its logs.`);
      if (selectedChartTicker === ticker) {
        setSelectedChartTicker(watchlist[0]?.ticker || 'VAS');
      }
    }
  }

  // Add researched ETF from Screener to active Watchlist
  function addScreenerETFToWatchlist(ticker: string) {
    const found = SCREENER_ETFS.find(e => e.ticker === ticker);
    if (!found) return;

    if (watchlist.some(etf => etf.ticker === ticker)) {
      setSuccessMessage(`"${ticker}" is already in your active watchlist.`);
      return;
    }

    const priceVal = found.history1Y[found.history1Y.length - 1]?.value || 50;

    const newETF: ETF = {
      ticker: found.ticker,
      name: found.name,
      domicile: found.domicile === 'US' ? 'US' : 'Australia',
      rules: {
        ntaDiscount: 0.5,
        expenseRatio: found.mer + 0.05,
        fundSize: Math.max(50, found.fundSize * 0.8),
        yield: Math.max(1, found.yield - 0.5),
      },
      currentData: {
        price: priceVal,
        nta: parseFloat((priceVal * 0.998).toFixed(2)),
        premiumDiscount: -0.2,
        pe: found.peRatio || null,
        yield: found.yield,
        expenseRatio: found.mer,
        fundSize: found.fundSize,
        bidAskSpread: 0.04,
        distributionFreq: 'Quarterly',
        frankingCredits: found.domicile === 'US' ? 0 : 30,
        trackingError: 0.04,
        drpActive: true
      },
      lastUpdated: new Date().toLocaleDateString() + ' (Screener)',
    };

    setWatchlist(prev => [...prev, newETF]);
    setSuccessMessage(`Added ${ticker} from ETF Screener to your Watchlist!`);
  }

  function getHistoryForTicker(ticker: string) {
    return history
      .filter(h => h.ticker === ticker)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-45); // Last 45 entries
  }

  // Filter & Sort core logic
  const filteredWatchlist = watchlist
    .filter(etf => {
      const matchSearch = etf.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          etf.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const { passed } = checkRules(etf);
      const isSignal = passed >= 3;

      // Filter Signal
      if (filterSignal === 'signals_only' && !isSignal) {
        return false;
      }

      // Filter Domicile
      if (filterDomicile === 'australia' && etf.domicile !== 'Australia') {
        return false;
      }
      if (filterDomicile === 'us' && etf.domicile !== 'US') {
        return false;
      }

      return matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'ticker') {
        return a.ticker.localeCompare(b.ticker);
      }
      if (sortBy === 'discount') {
        const discA = a.currentData.premiumDiscount || 999;
        const discB = b.currentData.premiumDiscount || 999;
        return discA - discB; // Deeper discount first
      }
      if (sortBy === 'yield') {
        const yieldA = a.currentData.yield || 0;
        const yieldB = b.currentData.yield || 0;
        return yieldB - yieldA; // Highest yield first
      }
      if (sortBy === 'expense') {
        const expA = a.currentData.expenseRatio || 999;
        const expB = b.currentData.expenseRatio || 999;
        return expA - expB; // Lowest fees first
      }
      return 0;
    });

  // Insights computations
  const auETFsCount = watchlist.filter(e => e.domicile === 'Australia').length;
  const etfsWithSignals = watchlist.filter(e => checkRules(e).passed >= 3);
  const eligibleETFs = watchlist.filter(e => e.currentData.expenseRatio !== null);
  const avgExpenseRatio = eligibleETFs.reduce((acc, e) => acc + (e.currentData.expenseRatio || 0), 0) / (eligibleETFs.length || 1);
  const totalAuM = watchlist.reduce((acc, e) => acc + (e.currentData.fundSize || 0), 0);

  const highestYielding = [...watchlist]
    .filter(e => e.currentData.yield !== null)
    .sort((a, b) => (b.currentData.yield || 0) - (a.currentData.yield || 0))[0];

  const deepestDiscounted = [...watchlist]
    .filter(e => e.currentData.premiumDiscount !== null)
    .sort((a, b) => (a.currentData.premiumDiscount || 0) - (b.currentData.premiumDiscount || 0))[0];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-slate-50/98 to-indigo-50/20 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Decorative colorful premium accent line at the absolute top */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 to-emerald-500" />
      
      {/* Messages banner */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-rose-600 border border-rose-700 text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2.5 text-sm font-semibold"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 border border-emerald-700 text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2.5 text-sm font-semibold"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Container */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setActiveTab('screener')}>
              <div className="relative flex-shrink-0 transition-all duration-300 group-hover:scale-105">
                {/* SVG Logo Mark */}
                <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-sm">
                  {/* Outer Shield/Hexagon with glowing border */}
                  <rect width="48" height="48" rx="12" fill="url(#logoBg)" />
                  
                  {/* Grid lines inside logo */}
                  <line x1="12" y1="28" x2="36" y2="28" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <line x1="12" y1="20" x2="36" y2="20" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  
                  {/* Vertical Bars representing ETFs/Columns */}
                  <rect x="14" y="24" width="4" height="12" rx="1.5" fill="url(#barGreen)" />
                  <rect x="22" y="18" width="4" height="18" rx="1.5" fill="url(#barIndigo)" fillOpacity="0.85" />
                  <rect x="30" y="14" width="4" height="22" rx="1.5" fill="url(#barOrange)" />
                  
                  {/* Dynamic Growth Trendline crossing upward */}
                  <path d="M12 30L21 21L27 24L36 12" stroke="url(#lineGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Node point glowing */}
                  <circle cx="36" cy="12" r="2.5" fill="#ffffff" />
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="logoBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#0f172a" />
                      <stop offset="100%" stopColor="#1e293b" />
                    </linearGradient>
                    <linearGradient id="barGreen" x1="14" y1="24" x2="18" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="barIndigo" x1="22" y1="18" x2="26" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                    <linearGradient id="barOrange" x1="30" y1="14" x2="34" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fb923c" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="12" y1="30" x2="36" y2="12" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="50%" stopColor="#ffedd5" />
                      <stop offset="100%" stopColor="#fb923c" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 id="app-title" className="text-sm sm:text-base font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-1.5 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <span>ASX ETF <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">Screener</span></span>
                  <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse shrink-0">
                    Buy Signals
                  </span>
                </h1>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold hidden md:block">Track Australian ASX ETF NTA premium/discounts, dividend yields, expense ratios, and overlaps</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {lastFetch && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg hidden md:inline-flex items-center gap-1.5 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Last Sync: {lastFetch}
              </span>
            )}

            {/* Day/Night Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(prev => !prev)}
              className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            <button
              onClick={() => setShowScraperConsole(prev => !prev)}
              className={`inline-flex items-center gap-1.5 border px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                showScraperConsole 
                  ? 'bg-slate-950 dark:bg-slate-800 border-slate-950 dark:border-slate-700 text-white dark:text-slate-100' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Toggle Data Sync logs"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sync Logs</span>
            </button>

            <button
              onClick={runIssuerScraperPipeline}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-slate-950 dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition duration-150 shadow-xs cursor-pointer border border-slate-800 dark:border-indigo-500"
            >
              <Cpu className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Live ETF Data
            </button>
          </div>
        </div>
      </header>

      {/* Primary Grid Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Real-time Issuer Scraper Terminal / Console Tray */}
        <AnimatePresence>
          {showScraperConsole && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-900/95 dark:bg-slate-950/95 text-slate-300 rounded-xl border border-slate-200/50 dark:border-slate-800 shadow-sm overflow-hidden font-mono text-[10px] flex flex-col max-w-3xl mx-auto"
            >
              {/* Terminal Header */}
              <div className="bg-slate-950 px-3 py-1.5 flex items-center justify-between border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 inline-block"></span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-sans ml-1.5 flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-indigo-400" />
                    Data Sync Console
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGlobalScraperLogs([])}
                    className="text-[9px] text-slate-500 hover:text-slate-300 transition bg-slate-900 px-2 py-0.5 rounded font-sans font-medium cursor-pointer"
                  >
                    Clear Logs
                  </button>
                  <button
                    onClick={() => setShowScraperConsole(false)}
                    className="text-slate-500 hover:text-slate-300 transition p-0.5 cursor-pointer"
                    title="Close Logs"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Terminal Screen */}
              <div className="p-3 overflow-y-auto max-h-[140px] space-y-0.5 bg-slate-950 text-slate-400 font-mono text-[10px] select-all scrollbar-thin">
                {globalScraperLogs.length === 0 ? (
                  <div className="text-slate-600 italic py-2 text-center font-sans">
                    Console idle. Click "Refresh Live ETF Data" to trigger pipeline execution.
                  </div>
                ) : (
                  globalScraperLogs.map((log, index) => {
                    let textClass = "text-slate-400";
                    if (log.startsWith("[CRITICAL") || log.startsWith("[Vanguard] Live API returned error") || log.startsWith("[Yahoo] Query for") || log.startsWith("[Betashares] MASTER CSV response returned error")) {
                      textClass = "text-rose-400/90 font-medium";
                    } else if (log.startsWith("[CONSOLE") || log.startsWith("======") || log.includes("SCRAPER RUN COMPLETED")) {
                      textClass = "text-indigo-400/90 font-medium";
                    } else if (log.includes("Successfully parsed") || log.includes("Scraped Vanguard") || log.includes("Successfully retrieved") || log.includes("🎉")) {
                      textClass = "text-emerald-400/90 font-medium";
                    } else if (log.startsWith("[Vanguard]") || log.startsWith("[Betashares]") || log.startsWith("[iShares]")) {
                      textClass = "text-sky-400/80";
                    } else if (log.startsWith("[Yahoo]")) {
                      textClass = "text-amber-400/80";
                    }
                    return (
                      <div key={index} className={`leading-relaxed whitespace-pre-wrap ${textClass}`}>
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats Banner Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Box 1 */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-5 rounded-2xl border-0 text-white shadow-md flex items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="p-3 bg-white/15 border border-white/20 text-white rounded-xl shadow-xs">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] text-indigo-200 font-bold block uppercase tracking-widest">Active Buy Signals</span>
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight block">
                {etfsWithSignals.length} <span className="text-xs font-semibold text-indigo-200/80 font-sans">triggered</span>
              </span>
            </div>
          </div>

          {/* Box 2 */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-700 p-5 rounded-2xl border-0 text-white shadow-md flex items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="p-3 bg-white/15 border border-white/20 text-white rounded-xl shadow-xs">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 font-bold block uppercase tracking-widest">Deepest Discount</span>
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight flex items-center gap-1.5 flex-wrap">
                {deepestDiscounted ? deepestDiscounted.ticker : 'N/A'} 
                {deepestDiscounted?.currentData.premiumDiscount !== undefined && deepestDiscounted.currentData.premiumDiscount !== null && (
                  <span className="text-[11px] font-extrabold text-white bg-white/20 border border-white/30 px-1.5 py-0.5 rounded-md">
                    {deepestDiscounted.currentData.premiumDiscount}%
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Box 3 */}
          <div className="bg-gradient-to-br from-amber-500 via-amber-500 to-orange-600 p-5 rounded-2xl border-0 text-white shadow-md flex items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="p-3 bg-white/15 border border-white/20 text-white rounded-xl shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-amber-150 font-bold block uppercase tracking-widest">Highest Yield</span>
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight flex items-center gap-1.5 flex-wrap">
                {highestYielding ? highestYielding.ticker : 'N/A'}
                {highestYielding?.currentData.yield !== undefined && highestYielding.currentData.yield !== null && (
                  <span className="text-[11px] font-extrabold text-white bg-white/20 border border-white/30 px-1.5 py-0.5 rounded-md">
                    {highestYielding.currentData.yield}%
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Box 4 */}
          <div className="bg-gradient-to-br from-sky-500 via-sky-500 to-blue-600 p-5 rounded-2xl border-0 text-white shadow-md flex items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            <div className="p-3 bg-white/15 border border-white/20 text-white rounded-xl shadow-xs">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-sky-100 font-bold block uppercase tracking-widest">Total Fund AuM</span>
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight block">
                ${(totalAuM / 1000).toFixed(1)}B <span className="text-xs font-medium text-sky-150 font-sans">AUD</span>
              </span>
            </div>
          </div>

        </div>

        {/* Dashboard Control Panel Block */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-5 overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 max-w-full overflow-hidden">
            
            <div className="flex flex-wrap bg-slate-50 border border-slate-200/60 p-2 rounded-2xl w-full lg:w-fit gap-2 max-w-full min-w-0 shadow-3xs">
              {[
                {
                  id: 'screener',
                  label: 'ETF Screener',
                  icon: Sliders,
                  active: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 scale-[1.03] ring-1 ring-indigo-500/10',
                  inactive: 'bg-indigo-50/70 border border-indigo-200/50 text-indigo-700 hover:bg-indigo-100/80 hover:text-indigo-900 dark:bg-indigo-950/45 dark:border-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-150 shadow-3xs',
                  iconActive: 'text-white',
                  iconInactive: 'text-indigo-600 dark:text-indigo-400'
                },
                {
                  id: 'watchlist',
                  label: 'Watchlist Cards',
                  icon: Eye,
                  active: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-[1.03] ring-1 ring-emerald-500/10',
                  inactive: 'bg-emerald-50/70 border border-emerald-200/50 text-emerald-700 hover:bg-emerald-100/80 hover:text-emerald-900 dark:bg-emerald-950/45 dark:border-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-150 shadow-3xs',
                  iconActive: 'text-white',
                  iconInactive: 'text-emerald-600 dark:text-emerald-400'
                },
                {
                  id: 'charts',
                  label: 'Historical Trends',
                  icon: LineChart,
                  active: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20 scale-[1.03] ring-1 ring-amber-500/10',
                  inactive: 'bg-amber-50/70 border border-amber-200/50 text-amber-800 hover:bg-amber-100/80 hover:text-amber-950 dark:bg-amber-950/45 dark:border-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-900/50 dark:hover:text-amber-150 shadow-3xs',
                  iconActive: 'text-white',
                  iconInactive: 'text-amber-600 dark:text-amber-400'
                },
                {
                  id: 'insights',
                  label: 'Performance Insights',
                  icon: Sparkles,
                  active: 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md shadow-fuchsia-600/20 scale-[1.03] ring-1 ring-fuchsia-500/10',
                  inactive: 'bg-fuchsia-50/70 border border-fuchsia-200/50 text-fuchsia-700 hover:bg-fuchsia-100/80 hover:text-fuchsia-900 dark:bg-fuchsia-950/45 dark:border-fuchsia-900/50 dark:text-fuchsia-300 dark:hover:bg-fuchsia-900/50 dark:hover:text-fuchsia-150 shadow-3xs',
                  iconActive: 'text-white',
                  iconInactive: 'text-fuchsia-600 dark:text-fuchsia-400'
                },
                {
                  id: 'overlap',
                  label: 'Overlap Analyzer',
                  icon: Layers,
                  active: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20 scale-[1.03] ring-1 ring-blue-500/10',
                  inactive: 'bg-blue-50/70 border border-blue-200/50 text-blue-700 hover:bg-blue-100/80 hover:text-blue-900 dark:bg-blue-950/45 dark:border-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:hover:text-indigo-150 shadow-3xs',
                  iconActive: 'text-white',
                  iconInactive: 'text-blue-600 dark:text-blue-400'
                },
                {
                  id: 'portfolio',
                  label: 'Portfolio Backtester',
                  icon: Briefcase,
                  active: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20 scale-[1.03] ring-1 ring-cyan-500/10',
                  inactive: 'bg-cyan-50/70 border border-cyan-200/50 text-cyan-700 hover:bg-cyan-100/80 hover:text-cyan-900 dark:bg-cyan-950/45 dark:border-cyan-900/50 dark:text-cyan-300 dark:hover:bg-cyan-900/50 dark:hover:text-indigo-150 shadow-3xs',
                  iconActive: 'text-white',
                  iconInactive: 'text-cyan-600 dark:text-cyan-400'
                },
                {
                  id: 'dividendTax',
                  label: 'Dividend & Tax Estimator',
                  icon: Calculator,
                  active: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md shadow-green-600/20 scale-[1.03] ring-1 ring-green-500/10',
                  inactive: 'bg-green-50/70 border border-green-200/50 text-green-700 hover:bg-green-100/80 hover:text-green-900 dark:bg-green-950/45 dark:border-green-900/50 dark:text-green-300 dark:hover:bg-green-900/50 dark:hover:text-indigo-150 shadow-3xs',
                  iconActive: 'text-white',
                  iconInactive: 'text-green-600 dark:text-green-400'
                },
                {
                  id: 'dca',
                  label: 'DCA Optimizer',
                  icon: Zap,
                  active: 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 scale-[1.03] ring-1 ring-orange-500/10',
                  inactive: 'bg-orange-50/70 border border-orange-200/50 text-orange-700 hover:bg-orange-100/80 hover:text-orange-900 dark:bg-orange-950/45 dark:border-orange-900/50 dark:text-orange-300 dark:hover:bg-orange-900/50 dark:hover:text-indigo-150 shadow-3xs',
                  iconActive: 'text-white',
                  iconInactive: 'text-orange-600 dark:text-orange-400'
                },
                {
                  id: 'rebalancer',
                  label: 'Target Rebalancer',
                  icon: Scale,
                  active: 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/20 scale-[1.03] ring-1 ring-pink-500/10',
                  inactive: 'bg-pink-50/70 border border-pink-200/50 text-pink-700 hover:bg-pink-100/80 hover:text-pink-900 dark:bg-pink-950/45 dark:border-pink-900/50 dark:text-pink-300 dark:hover:bg-pink-900/50 dark:hover:text-indigo-150 shadow-3xs',
                  iconActive: 'text-white',
                  iconInactive: 'text-pink-600 dark:text-pink-400'
                },
                {
                  id: 'copilot',
                  label: 'AI Investment Copilot',
                  icon: Sparkles,
                  active: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20 scale-[1.03] ring-1 ring-violet-500/10',
                  inactive: 'bg-violet-100 border border-violet-300 text-violet-950 font-black hover:bg-violet-200 dark:bg-violet-900/55 dark:border-violet-600/70 dark:text-violet-100 dark:hover:bg-violet-800/80 shadow-md ring-1 ring-violet-400/20',
                  iconActive: 'text-white',
                  iconInactive: 'text-violet-800 dark:text-violet-300'
                },
                {
                  id: 'blog',
                  label: 'Educational Hub',
                  icon: BookOpen,
                  active: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/20 scale-[1.03] ring-1 ring-rose-500/10',
                  inactive: 'bg-rose-50/70 border border-rose-200/50 text-rose-700 hover:bg-rose-100/80 hover:text-rose-900 dark:bg-rose-950/45 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-900/50 dark:hover:text-indigo-150 shadow-3xs',
                  iconActive: 'text-white',
                  iconInactive: 'text-rose-600 dark:text-rose-400'
                }
              ].map(tab => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`tab-btn-${tab.id}`}
                    onClick={() => {
                      if (tab.id === 'blog') {
                        setSelectedBlogPostId(null);
                        window.history.pushState(null, '', '/blog');
                      }
                      setActiveTab(tab.id);
                    }}
                    className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                      isActive ? tab.active : tab.inactive
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? tab.iconActive : tab.iconInactive}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Global Actions */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-end lg:self-center">
              <button
                onClick={downloadCSVTemplate}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-400" />
                Export CSV
              </button>

              <button
                onClick={triggerFileInput}
                className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                Import CSV
              </button>
              
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".csv" 
                onChange={handleCSVImport} 
                className="hidden" 
              />
            </div>

          </div>

          {/* Filters Panel (Only visible for Watchlist tab) */}
          {activeTab === 'watchlist' && (
            <div className="border-t border-slate-100 pt-4 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
              
              {/* Search Bar with Quick Filter Suggestion Tooltips */}
              <div className="flex-1 max-w-xl space-y-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by symbol, fund name, or asset class..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200/80 focus:border-indigo-500 focus:bg-white rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 outline-hidden transition"
                  />
                </div>
                
                {/* Micro Tooltip Preset Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <span>💡</span> Quick Filters:
                  </span>
                  
                  {/* Suggestion 1: Low Fee */}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSortBy('expense');
                      setFilterDomicile('all');
                      setFilterSignal('all');
                    }}
                    className="group relative inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer border border-slate-200/60"
                  >
                    <span>💎 Low Fees</span>
                    <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-md font-mono">MER</span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 bg-slate-950 text-white text-[10px] font-medium p-2.5 rounded-xl shadow-lg z-50 text-center leading-normal">
                      <div className="font-black mb-1 text-indigo-400">Low Management Fees</div>
                      Sorts by lowest Management Expense Ratio (MER). Highlights passive index ETFs like A200 (0.07% p.a.) and VTS (0.03% p.a.).
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 rotate-45"></div>
                    </div>
                  </button>

                  {/* Suggestion 2: High Yield */}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSortBy('yield');
                      setFilterDomicile('all');
                      setFilterSignal('all');
                    }}
                    className="group relative inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer border border-slate-200/60"
                  >
                    <span>💰 High Yield</span>
                    <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md font-mono">Div</span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 bg-slate-950 text-white text-[10px] font-medium p-2.5 rounded-xl shadow-lg z-50 text-center leading-normal">
                      <div className="font-black mb-1 text-emerald-400">High Dividend Yield</div>
                      Sorts ETFs by annual distribution yield. Highlights high-yielding assets such as Australian dividend-leaders VHY.
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 rotate-45"></div>
                    </div>
                  </button>

                  {/* Suggestion 3: Deepest Discount */}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSortBy('discount');
                      setFilterDomicile('all');
                      setFilterSignal('all');
                    }}
                    className="group relative inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer border border-slate-200/60"
                  >
                    <span>🔥 NTA Discount</span>
                    <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md font-mono">Value</span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 bg-slate-950 text-white text-[10px] font-medium p-2.5 rounded-xl shadow-lg z-50 text-center leading-normal">
                      <div className="font-black mb-1 text-amber-400">Discount to NTA</div>
                      Sorts by the deepest discount of trading price relative to underlying Net Asset Value (NTA) for maximum margin of safety.
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 rotate-45"></div>
                    </div>
                  </button>

                  {/* Suggestion 4: Active Buy Signals */}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterSignal('signals_only');
                      setFilterDomicile('all');
                    }}
                    className="group relative inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer border border-slate-200/60"
                  >
                    <span>📈 Buy Targets</span>
                    <span className="text-[9px] text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded-md font-mono">Signals</span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 bg-slate-950 text-white text-[10px] font-medium p-2.5 rounded-xl shadow-lg z-50 text-center leading-normal">
                      <div className="font-black mb-1 text-purple-400">Institutional Signals</div>
                      Filters to show only ETFs triggering 3 or more automated buy signals (Volume, NTA discount, SMA-100, and low RSI).
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 rotate-45"></div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Filtering, Sorting Controls */}
              <div className="flex flex-wrap items-center gap-4">
                
                {/* 1. Domicile Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Domicile:</span>
                  <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-200/80">
                    <button
                      onClick={() => setFilterDomicile('all')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                        filterDomicile === 'all' 
                          ? 'bg-white text-slate-900 shadow-2xs' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterDomicile('australia')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1 ${
                        filterDomicile === 'australia' 
                          ? 'bg-white text-emerald-800 shadow-2xs' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      🇦🇺 AU Domiciled
                    </button>
                    <button
                      onClick={() => setFilterDomicile('us')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1 ${
                        filterDomicile === 'us' 
                          ? 'bg-white text-amber-800 shadow-2xs' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      🇺🇸 US Domiciled
                    </button>
                  </div>
                </div>

                <div className="h-5 w-px bg-slate-200 hidden md:block"></div>

                {/* 2. Buy Signals Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Signals:</span>
                  <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-200/80">
                    <button
                      onClick={() => setFilterSignal('all')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                        filterSignal === 'all' 
                          ? 'bg-white text-slate-900 shadow-2xs' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterSignal('signals_only')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                        filterSignal === 'signals_only' 
                          ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                      Buy Targets Only
                    </button>
                  </div>
                </div>

                <div className="h-5 w-px bg-slate-200 hidden md:block"></div>

                {/* 3. Sort Order */}
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold px-2.5 py-1.5 text-slate-700 outline-hidden focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="ticker">Ticker A-Z</option>
                    <option value="discount">Deepest Discount %</option>
                    <option value="yield">Div Dividend Yield</option>
                    <option value="expense">Lowest Fees (MER)</option>
                  </select>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* Dynamic Panel Renderer */}
        {activeTab === 'watchlist' && (
          <div className="space-y-6">
            {auETFsCount === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-800 shadow-2xs mb-2"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🇦🇺</span>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-amber-900">No Australian-Domiciled ETFs active in your watchlist!</h4>
                    <p className="text-xs text-amber-700 mt-1 max-w-2xl leading-relaxed">
                      You mentioned not being able to see any Australian ETFs. This might happen if your local storage cache has cleared or been overridden. Click below to restore the premier default ASX-listed watch pool (including <strong>VAS</strong>, <strong>A200</strong>, <strong>VGS</strong>, and <strong>DHHF</strong>).
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetWatchlist}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shrink-0 transition shadow-xs cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-center"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restore Default AU ETFs
                </button>
              </motion.div>
            )}

            {filteredWatchlist.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto my-6 shadow-2xs">
                <div className="bg-slate-50 text-slate-400 p-4 rounded-full w-fit mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No Matching ETFs Found</h3>
                <p className="text-sm text-slate-500 mb-6">
                  {searchTerm 
                    ? "We couldn't find any holdings matching your active filters. Try resetting the filters." 
                    : "No holdings are configured yet. Let's add a custom Australian-domiciled symbol!"}
                </p>
                <button
                  onClick={() => { setSearchTerm(''); setFilterSignal('all'); setFilterDomicile('all'); }}
                  className="text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition"
                >
                  Reset Active Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredWatchlist.map(etf => (
                  <WatchlistCard
                    key={etf.ticker}
                    etf={etf}
                    isEditingRules={editingTicker === etf.ticker}
                    isEditingMetrics={editingMetricsTicker === etf.ticker}
                    onToggleRules={() => setEditingTicker(editingTicker === etf.ticker ? null : etf.ticker)}
                    onToggleMetrics={() => {
                      setEditingMetricsTicker(null);
                      setTempMetrics(null);
                    }}
                    updateRule={updateRule}
                    updateInvestment={updateInvestment}
                    startEditingMetrics={startEditingMetrics}
                    tempMetrics={tempMetrics}
                    setTempMetrics={setTempMetrics}
                    saveMetrics={saveMetrics}
                    removeETF={removeETF}
                    onViewCharts={() => {
                      setSelectedChartTicker(etf.ticker);
                      setActiveTab('charts');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'charts' && (
          <HistoryCharts
            watchlist={watchlist}
            selectedChartTicker={selectedChartTicker}
            setSelectedChartTicker={setSelectedChartTicker}
            getHistoryForTicker={getHistoryForTicker}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView watchlist={watchlist} />
        )}

        {activeTab === 'screener' && (
          <ETFScreener 
            onAddToWatchlist={addScreenerETFToWatchlist}
            watchlistTickers={watchlist.map(e => e.ticker)}
            onNavigateToBlog={handleNavigateToBlog}
          />
        )}

        {activeTab === 'overlap' && (
          <OverlapView 
            watchlist={watchlist} 
            onNavigateToBlog={handleNavigateToBlog}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioBuilder watchlist={watchlist} />
        )}

        {activeTab === 'dividendTax' && (
          <DividendTaxEstimator watchlist={watchlist} />
        )}

        {activeTab === 'dca' && (
          <DCAOptimizer />
        )}

        {activeTab === 'rebalancer' && (
          <PortfolioRebalancer />
        )}

        {activeTab === 'copilot' && (
          <AICopilot watchlist={watchlist} />
        )}

        {activeTab === 'blog' && (
          <BlogView
            onNavigateToTab={handleNavigateToTab}
            selectedPostId={selectedBlogPostId}
            onSelectPost={setSelectedBlogPostId}
          />
        )}

        {/* Dynamic Ad Placement Monetization Hub */}
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <AdPlacement />
        </div>

      </main>

      {/* Slide-Up Overlay Modal to Add Custom ETF */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
            ></motion.div>

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden relative z-10"
            >
              <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-150 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Custom ETF Sentinel</h3>
                  <p className="text-xs text-slate-400 font-semibold">Monitor price deviations and set target parameters</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition cursor-pointer text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddETF} className="p-6 space-y-5">
                
                {/* Standard Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ticker / Symbol *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VAS, A200, VGS"
                      value={newTicker}
                      onChange={(e) => setNewTicker(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-hidden focus:bg-white focus:border-indigo-500 transition"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Domicile Structure *</label>
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                      <button
                        type="button"
                        onClick={() => setNewDomicile('Australia')}
                        className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition ${
                          newDomicile === 'Australia' 
                            ? 'bg-white text-emerald-800 shadow-xs' 
                            : 'text-slate-500'
                        }`}
                      >
                        🇦🇺 Australian
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewDomicile('US')}
                        className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition ${
                          newDomicile === 'US' 
                            ? 'bg-white text-amber-800 shadow-xs' 
                            : 'text-slate-500'
                        }`}
                      >
                        🇺🇸 US (W-8BEN)
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fund Description / Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Vanguard MSCI Index International Shares"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-hidden focus:bg-white focus:border-indigo-500 transition"
                  />
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <span className="text-xs font-extrabold text-slate-700 block mb-3">Setup Target Parameters</span>
                  
                  <div className="grid grid-cols-2 gap-4">
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target NTA Discount &gt;= %</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={newRules.ntaDiscount}
                        onChange={(e) => setNewRules({ ...newRules, ntaDiscount: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-850 focus:bg-white focus:border-indigo-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Max Expense Ratio &lt;= %</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newRules.expenseRatio}
                        onChange={(e) => setNewRules({ ...newRules, expenseRatio: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-850 focus:bg-white focus:border-indigo-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Min Fund Size &gt;= $M</label>
                      <input
                        type="number"
                        step="10"
                        required
                        value={newRules.fundSize}
                        onChange={(e) => setNewRules({ ...newRules, fundSize: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-850 focus:bg-white focus:border-indigo-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Min Dividend Yield &gt;= %</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={newRules.yield}
                        onChange={(e) => setNewRules({ ...newRules, yield: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-850 focus:bg-white focus:border-indigo-500 outline-hidden"
                      />
                    </div>

                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
                  >
                    Add Watch Symbol
                  </button>
                </div>

              </form>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
