import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  RefreshCw, 
  Info, 
  HelpCircle, 
  TrendingUp, 
  Compass, 
  AlertTriangle, 
  Cpu, 
  CheckCircle2, 
  Flame, 
  Scale, 
  DollarSign, 
  Activity,
  Bot
} from 'lucide-react';
import { ETF } from '../types';

interface AICopilotProps {
  watchlist: ETF[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const PRESET_PROMPTS = [
  {
    title: "🔍 One-Click Watchlist Audit",
    prompt: "Please run a complete comprehensive audit on my current ETF watchlist. Evaluate my fee exposure (expense ratios), overall yield, asset diversification, and check if any funds are trading at attractive Net Tangible Asset (NTA) discounts.",
    badge: "Recommended"
  },
  {
    title: "⚖️ Overlap & Concentration Analysis",
    prompt: "Evaluate my portfolio for stock concentration and overlaps. For example, if I own both VAS/A200 or IVV/VGS, am I doubling up on the same underlying companies? Suggest the most optimal structure.",
    badge: "Risk Focus"
  },
  {
    title: "💡 Suggest 3-ETF Lazy Portfolio",
    prompt: "I want to build a simple, hands-off 3-ETF lazy portfolio for long-term growth. Suggest a highly tax-efficient allocation using ASX-listed ETFs, including weights and explanation of why it works.",
    badge: "Strategy"
  },
  {
    title: "🇦🇺 Franking Credits explained",
    prompt: "Can you demystify how Australian franking credits impact my annual tax return as an ETF investor? Use a clear numerical example comparing a fully franked dividend to an unfranked international distribution.",
    badge: "Tax Intel"
  }
];

export default function AICopilot({ watchlist }: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRiskProfile, setSelectedRiskProfile] = useState<'conservative' | 'balanced' | 'growth' | 'high_growth'>('growth');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a welcoming message
  useEffect(() => {
    const savedChat = localStorage.getItem('sentinel-copilot-chat');
    if (savedChat) {
      try {
        setMessages(JSON.parse(savedChat));
      } catch (e) {
        initializeWelcomeMessage();
      }
    } else {
      initializeWelcomeMessage();
    }
  }, []);

  const initializeWelcomeMessage = () => {
    const welcome: Message = {
      id: 'welcome',
      role: 'assistant',
      text: `### Welcome to Sentinel AI Copilot! ⚡️

I am your institutional-grade ETF Advisor, fully powered by **Gemini 3.5 Flash**. I have analyzed your active ASX watchlist and current portfolio holdings to provide intelligent, contextual guidance.

**What we can do together:**
*   **One-Click Audit**: Run a deep quantitative evaluation of your holdings (expense ratios, sector concentrations, and yield).
*   **Arbitrage Scouting**: Spot ETFs trading at significant Net Tangible Asset (NTA) discounts to maximize your margin of safety.
*   **Lazy Portfolio Structuring**: Suggest a customized, low-fee portfolio allocation matching your risk tolerance.
*   **Tax Efficiency Optimization**: Understand how franking credits and capital gains discounts can boost your compounding returns.

Feel free to choose a **preset quick analysis below** or ask any custom investment questions!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcome]);
  };

  // Sync chat history to local storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('sentinel-copilot-chat', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom on updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Extract portfolio holdings from active shares in the watchlist
  const activePortfolio = watchlist.filter(e => e.sharesOwned && e.sharesOwned > 0).map(e => ({
    ticker: e.ticker,
    name: e.name,
    sharesOwned: e.sharesOwned,
    purchasePrice: e.purchasePrice,
    currentPrice: e.currentData.price,
    totalValue: (e.sharesOwned || 0) * (e.currentData.price || 0),
    expenseRatio: e.currentData.expenseRatio,
    yield: e.currentData.yield,
    premiumDiscount: e.currentData.premiumDiscount
  }));

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, text: m.text })),
          watchlist: watchlist.map(e => ({
            ticker: e.ticker,
            name: e.name,
            domicile: e.domicile,
            expenseRatio: e.currentData.expenseRatio,
            yield: e.currentData.yield,
            premiumDiscount: e.currentData.premiumDiscount,
            pe: e.currentData.pe
          })),
          portfolio: activePortfolio
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to generate AI response.");
      }

      const data = await response.json();
      
      const assistantMsg: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        text: `⚠️ **API Connection Error**\n\n${err.message || "Failed to connect to the Gemini backend server. Make sure you have declared your GEMINI_API_KEY inside the **Settings > Secrets** panel."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear your Copilot chat history?")) {
      localStorage.removeItem('sentinel-copilot-chat');
      initializeWelcomeMessage();
    }
  };

  const triggerRiskProposal = () => {
    const riskPrompts = {
      conservative: "Recommend a conservative, yield-focused portfolio allocation on the ASX. I am prioritizing capital preservation and steady dividend distributions over high capital growth.",
      balanced: "Recommend a balanced asset allocation. I want to build a stable core of broad-market Australian and international shares, with moderate growth and moderate yield.",
      growth: "Recommend an aggressive growth portfolio allocation. I am in my wealth-building phase and want a split of broad global index funds, corporate giants, and tactical resource sectors.",
      high_growth: "Suggest a maximum high-growth diversified portfolio. I have an investment horizon of 15+ years and want to fully capture the compounding power of Silicon Valley innovators, global tech ETFs, and top emerging markets."
    };
    handleSendMessage(riskPrompts[selectedRiskProfile]);
  };

  // Custom high-fidelity text block parser for elegant visual rendering of markdown
  const parseMarkdownText = (text: string) => {
    const lines = text.split('\n');
    let inList = false;
    let listItems: string[] = [];
    const elements: React.ReactNode[] = [];

    const parseInlineStyles = (content: string, keyPrefix: string) => {
      // Bold style (**)
      const boldParts = content.split('**');
      return (
        <span key={keyPrefix}>
          {boldParts.map((part, idx) => {
            if (idx % 2 === 1) {
              return <strong key={idx} className="font-extrabold text-slate-900 dark:text-white">{part}</strong>;
              // Inline code blocks (`)
            } else if (part.includes('`')) {
              const codeParts = part.split('`');
              return (
                <span key={idx}>
                  {codeParts.map((subPart, sIdx) => (
                    sIdx % 2 === 1 ? <code key={sIdx} className="bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs text-rose-500 px-1.5 py-0.5 rounded-md">{subPart}</code> : subPart
                  ))}
                </span>
              );
            }
            return part;
          })}
        </span>
      );
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        if (inList) {
          elements.push(
            <ul key={`ul-${index}`} className="space-y-1.5 my-3 pl-1">
              {listItems.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="inline-block w-1.5 h-1.5 bg-fuchsia-500 rounded-full mt-2.5 shrink-0" />
                  <span>{parseInlineStyles(item, `item-${itemIdx}`)}</span>
                </li>
              ))}
            </ul>
          );
          inList = false;
          listItems = [];
        }
        return;
      }

      // H3 / H4 Headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={`h-${index}`} className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-50 mt-5 mb-2.5 tracking-tight border-l-3 border-fuchsia-500 pl-3.5">
            {parseInlineStyles(trimmed.replace('### ', ''), `h-in-${index}`)}
          </h4>
        );
        return;
      }
      if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
        elements.push(
          <h3 key={`h-${index}`} className="text-lg sm:text-xl font-black text-indigo-950 dark:text-white mt-6 mb-3 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-fuchsia-500" />
            {parseInlineStyles(trimmed.replace(/^#+\s+/, ''), `h-in-${index}`)}
          </h3>
        );
        return;
      }

      // Bullet List lines (* or -)
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        inList = true;
        listItems.push(trimmed.substring(2));
        return;
      }

      // Numbered List lines (e.g. 1. )
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <div key={`num-${index}`} className="flex items-start gap-3 my-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300">
            <span className="flex items-center justify-center w-5 h-5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-black shrink-0 mt-0.5">
              {numMatch[1]}
            </span>
            <span className="flex-1 leading-relaxed">{parseInlineStyles(numMatch[2], `num-in-${index}`)}</span>
          </div>
        );
        return;
      }

      // Tables (| ... |)
      if (trimmed.startsWith('|')) {
        // Skip separator rows
        if (trimmed.includes(':---')) return;
        
        const cols = trimmed.split('|').map(c => c.trim()).filter((_, colIdx, arr) => colIdx > 0 && colIdx < arr.length - 1);
        const isHeader = index === 0 || (lines[index - 1] && lines[index - 1].trim() === '');
        
        elements.push(
          <div key={`table-row-${index}`} className={`grid my-0.5 p-2 px-3 border-b border-slate-100 dark:border-slate-800/60 font-mono text-xs ${
            isHeader 
              ? 'bg-indigo-50/50 dark:bg-indigo-950/20 text-slate-800 dark:text-indigo-300 font-black rounded-lg border-t border-slate-100 dark:border-slate-800' 
              : 'text-slate-600 dark:text-slate-300 bg-white/20 dark:bg-slate-900/10'
          }`} style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
            {cols.map((col, colIdx) => (
              <div key={colIdx} className="truncate">
                {parseInlineStyles(col, `col-${colIdx}`)}
              </div>
            ))}
          </div>
        );
        return;
      }

      // Blockquotes (> ...)
      if (trimmed.startsWith('> ')) {
        elements.push(
          <blockquote key={`quote-${index}`} className="border-l-4 border-fuchsia-500 bg-linear-to-r from-fuchsia-500/5 to-transparent rounded-r-xl px-4 py-3 text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium italic my-4 leading-relaxed">
            {parseInlineStyles(trimmed.substring(2), `quote-in-${index}`)}
          </blockquote>
        );
        return;
      }

      // Default Paragraph text
      elements.push(
        <p key={`p-${index}`} className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
          {parseInlineStyles(trimmed, `p-in-${index}`)}
        </p>
      );
    });

    // Close any dangling list
    if (inList) {
      elements.push(
        <ul key={`ul-dangling`} className="space-y-1.5 my-3 pl-1">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="inline-block w-1.5 h-1.5 bg-fuchsia-500 rounded-full mt-2.5 shrink-0" />
              <span>{parseInlineStyles(item, `item-dang-${itemIdx}`)}</span>
            </li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  return (
    <div className="space-y-6">
      
      {/* Visual Ambient Header Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(236,72,153,0.15),transparent_50%)]" />
        <div className="absolute top-4 right-4 animate-pulse flex items-center gap-1.5 bg-indigo-950 border border-indigo-700/50 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-fuchsia-400">
          <Bot className="w-3.5 h-3.5" />
          <span>Active Copilot ⚡️</span>
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="p-4 bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400 rounded-2xl shrink-0 shadow-lg shadow-fuchsia-500/5">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              Sentinel AI Investment Copilot
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              Unlock professional-grade quantitative portfolios. Gemini 3.5 Flash evaluates your ETF holdings, scans historical NTA spreads, and suggests low-fee capital growth strategies instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Tools Panel & Chat Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Hand: Intelligence Tools and Preset Prompts */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* Risk Profile Planner Quick Action */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>ETF Asset Allocator</span>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select your risk appetite to generate a customized, low-fee multi-ETF portfolio proposal.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {(['conservative', 'balanced', 'growth', 'high_growth'] as const).map((profile) => (
                <button
                  key={profile}
                  onClick={() => setSelectedRiskProfile(profile)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border capitalize transition-all cursor-pointer ${
                    selectedRiskProfile === profile
                      ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {profile.replace('_', ' ')}
                </button>
              ))}
            </div>

            <button
              onClick={triggerRiskProposal}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-slate-950 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-white text-xs font-black py-2.5 rounded-xl transition cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-fuchsia-400 animate-spin-slow" />
              <span>Generate Target Portfolio</span>
            </button>
          </div>

          {/* Quick Analysis Presets */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4 flex-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <Compass className="w-4 h-4 text-fuchsia-500" />
              <span>Intelligence Prompts</span>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Launch targeted analysis operations. The AI is pre-loaded with your exact watchlist and holdings.
            </p>

            <div className="space-y-2.5 pt-1">
              {PRESET_PROMPTS.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(preset.prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl border border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 hover:border-indigo-500/20 transition group flex flex-col gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {preset.title}
                    </span>
                    <span className="text-[9px] font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-1.5 py-0.2 rounded">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Hand: Interactive Chat Canvas */}
        <div className="xl:col-span-8 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xs overflow-hidden h-[620px]">
          
          {/* Chat Window Toolbar Header */}
          <div className="border-b border-slate-200 dark:border-slate-800 p-4 px-5 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              <div className="text-left">
                <span className="text-sm font-black text-slate-900 dark:text-white block">Sentinel Agent Session</span>
                <span className="text-[10px] text-emerald-500 font-bold block flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                  Gemini-3.5-Flash (API Connection Active)
                </span>
              </div>
            </div>

            <button
              onClick={clearChat}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-2 rounded-xl transition cursor-pointer"
              title="Clear Chat History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/20 dark:bg-slate-950/10">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3.5 max-w-[85%] ${
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`p-2.5 rounded-xl text-sm shrink-0 border shadow-2xs ${
                    msg.role === 'user'
                      ? 'bg-linear-to-tr from-indigo-600 to-indigo-500 border-indigo-500 text-white'
                      : 'bg-linear-to-tr from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-750 border-slate-200 dark:border-slate-700 text-fuchsia-400'
                  }`}>
                    {msg.role === 'user' ? 'ME' : 'AI'}
                  </div>

                  {/* Message Bubble text */}
                  <div className="space-y-1">
                    <div className={`p-4 rounded-2xl shadow-3xs text-left ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                        : 'bg-white dark:bg-slate-800 border border-slate-200/85 dark:border-slate-800 text-slate-800 dark:text-slate-150 rounded-tl-none'
                    }`}>
                      {msg.role === 'user' ? (
                        <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none text-slate-800 dark:text-slate-100 dark:prose-invert">
                          {parseMarkdownText(msg.text)}
                        </div>
                      )}
                    </div>
                    
                    {/* Timestamp log */}
                    <span className={`text-[9px] font-bold text-slate-400 font-mono block px-1.5 ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </motion.div>
              ))}

              {/* Typewriter loader animation during inference API fetching */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3.5 max-w-[80%]"
                >
                  <div className="p-2.5 bg-linear-to-tr from-slate-900 to-slate-800 border border-slate-200 dark:border-slate-700 text-fuchsia-400 rounded-xl shadow-2xs">
                    AI
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl rounded-tl-none shadow-3xs flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs font-black text-slate-400 font-mono uppercase tracking-wider pl-1.5">
                      Sentinel is analyzing...
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Message Input Panel Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask Sentinel AI a question about ASX ETFs, fees, overlap, tax..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 outline-hidden transition placeholder-slate-400 disabled:opacity-60"
            />
            
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl shadow-xs hover:shadow-md transition shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
