import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Send, CheckCircle2, Sparkles, Filter, AlertCircle, PlusCircle, Lightbulb, Star, Shield, X, ChevronRight } from 'lucide-react';

export interface FeedbackItem {
  id: string;
  title: string;
  description: string;
  category: 'Feature Request' | 'Missing ETF Data' | 'UI & Usability' | 'Tax Calculator' | 'General';
  upvotes: number;
  status: 'Under Review' | 'Planned' | 'In Development' | 'Completed';
  createdAt: string;
  authorName?: string;
  hasUpvoted?: boolean;
}

const INITIAL_SUGGESTIONS: FeedbackItem[] = [
  {
    id: 'sug-1',
    title: 'Export Screener & Comparison Table to CSV / Excel',
    description: 'Allow downloading filtered screener views and ETF comparison metrics directly as a CSV file for personal spreadsheet analysis.',
    category: 'Feature Request',
    upvotes: 42,
    status: 'In Development',
    createdAt: '2026-07-15',
    authorName: 'Alex M. (Sydney)',
  },
  {
    id: 'sug-2',
    title: 'Add Live Price & NTA Threshold Email Alerts',
    description: 'Set custom price alerts when an ETF like IVV or VAS drops to a target discount against its underlying Net Asset Value (NTA).',
    category: 'Feature Request',
    upvotes: 38,
    status: 'Planned',
    createdAt: '2026-07-18',
    authorName: 'David K. (Melbourne)',
  },
  {
    id: 'sug-3',
    title: 'Include Betashares & Global X Crypto / Tech Sector ETFs',
    description: 'Expand covered tickers with more niche thematic funds including CRYP, NDQ, and HACK detailed holdings.',
    category: 'Missing ETF Data',
    upvotes: 29,
    status: 'Under Review',
    createdAt: '2026-07-20',
    authorName: 'Sarah B. (Brisbane)',
  },
  {
    id: 'sug-4',
    title: 'ATO AMMA Tax Component Breakdown in Franking Calculator',
    description: 'Break down non-assessable capital gains distribution alongside franking credits for EOFY tax returns.',
    category: 'Tax Calculator',
    upvotes: 24,
    status: 'Completed',
    createdAt: '2026-07-10',
    authorName: 'Michael P. (Perth)',
  },
];

interface VisitorFeedbackProps {
  isOpen?: boolean;
  onClose?: () => void;
  standaloneColumn?: boolean;
}

export function VisitorFeedback({ isOpen = false, onClose, standaloneColumn = false }: VisitorFeedbackProps) {
  const [suggestions, setSuggestions] = useState<FeedbackItem[]>(() => {
    try {
      const saved = localStorage.getItem('asx_visitor_feedback');
      return saved ? JSON.parse(saved) : INITIAL_SUGGESTIONS;
    } catch {
      return INITIAL_SUGGESTIONS;
    }
  });

  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'board' | 'submit'>('board');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FeedbackItem['category']>('Feature Request');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('asx_visitor_feedback', JSON.stringify(suggestions));
    } catch (e) {
      console.warn('Unable to persist feedback to localStorage', e);
    }
  }, [suggestions]);

  const handleUpvote = (id: string) => {
    setSuggestions(prev =>
      prev.map(item => {
        if (item.id === id) {
          const hasUpvoted = !item.hasUpvoted;
          return {
            ...item,
            upvotes: hasUpvoted ? item.upvotes + 1 : item.upvotes - 1,
            hasUpvoted,
          };
        }
        return item;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newItem: FeedbackItem = {
      id: `sug-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      upvotes: 1,
      status: 'Under Review',
      createdAt: new Date().toISOString().split('T')[0],
      authorName: authorName.trim() || 'Anonymous Investor',
      hasUpvoted: true,
    };

    setSuggestions([newItem, ...suggestions]);
    setIsSubmitted(true);
    setTitle('');
    setDescription('');
    setAuthorName('');
    
    setTimeout(() => {
      setIsSubmitted(false);
      setActiveTab('board');
    }, 1800);
  };

  const filteredSuggestions = suggestions.filter(s =>
    filterCategory === 'All' ? true : s.category === filterCategory
  );

  const content = (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shadow-inner">
            <Lightbulb className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Visitor Feedback &amp; Suggestions
              </h2>
              <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Community
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Help shape the future of ASX ETF Screener with your ideas &amp; feature requests
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close Feedback Panel"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-3 gap-2">
        <button
          onClick={() => setActiveTab('board')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-t-xl transition cursor-pointer border-b-2 ${
            activeTab === 'board'
              ? 'bg-white border-indigo-600 text-indigo-900 shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          Suggestions Board ({suggestions.length})
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-t-xl transition cursor-pointer border-b-2 ${
            activeTab === 'submit'
              ? 'bg-white border-indigo-600 text-indigo-900 shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-500" />
          Submit Feedback
        </button>
      </div>

      {/* Content Area */}
      <div className="p-5 overflow-y-auto max-h-[600px] flex-1 space-y-4">
        {activeTab === 'board' && (
          <>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
                <span className="text-[11px] font-extrabold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                {['All', 'Feature Request', 'Missing ETF Data', 'Tax Calculator', 'UI & Usability'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition whitespace-nowrap cursor-pointer ${
                      filterCategory === cat
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-bold text-slate-400">
                Sorted by Community Votes
              </span>
            </div>

            {/* Suggestions Cards */}
            <div className="space-y-3">
              {filteredSuggestions.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
                  <Lightbulb className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">No suggestions in this category yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Be the first to submit a recommendation!</p>
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition cursor-pointer"
                  >
                    Submit New Idea
                  </button>
                </div>
              ) : (
                filteredSuggestions.map(item => (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-indigo-200 transition group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      {/* Upvote Button */}
                      <button
                        onClick={() => handleUpvote(item.id)}
                        aria-label={`Upvote ${item.title}`}
                        className={`flex flex-col items-center justify-center p-2.5 min-w-[52px] rounded-xl border transition cursor-pointer ${
                          item.hasUpvoted
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-black shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 font-bold'
                        }`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${item.hasUpvoted ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                        <span className="text-xs font-mono mt-1">{item.upvotes}</span>
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-indigo-950 transition">
                            {item.title}
                          </h3>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                              item.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : item.status === 'In Development'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : item.status === 'Planned'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium pt-1">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 font-bold">
                            {item.category}
                          </span>
                          <span>• {item.authorName}</span>
                          <span>• {item.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'submit' && (
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-slate-900">Thank You for Your Feedback!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your suggestion has been added to our community board. Our product team reviews all suggestions regularly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Feedback Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    aria-label="Feedback Category"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 outline-hidden cursor-pointer"
                  >
                    <option value="Feature Request">💡 Feature Request</option>
                    <option value="Missing ETF Data">📈 Missing ETF Data / Ticker</option>
                    <option value="Tax Calculator">🧮 Tax / Franking Calculator</option>
                    <option value="UI & Usability">🎨 UI &amp; Design Improvement</option>
                    <option value="General">💬 General Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Suggestion Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Add Portfolio Correlation Heatmap or Export to Excel"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    aria-label="Suggestion Title"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 outline-hidden placeholder-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    Details &amp; Explanation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    maxLength={500}
                    placeholder="Describe what feature or data improvement you would like to see on ASX ETF Screener..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    aria-label="Details & Explanation"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:border-indigo-500 outline-hidden placeholder-slate-400 leading-relaxed"
                  />
                  <span className="text-[10px] text-slate-400 float-right mt-1 font-mono">
                    {description.length}/500 chars
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Your Name / Handle <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Investor Sam"
                      value={authorName}
                      onChange={e => setAuthorName(e.target.value)}
                      aria-label="Your Name or Handle"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      Overall App Rating
                    </label>
                    <div className="flex items-center gap-1.5 pt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                        >
                          <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-600 ml-2">{rating}/5</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> Submit Suggestion
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1 text-slate-600 font-bold">
          <Shield className="w-3.5 h-3.5 text-emerald-600" /> Community Moderated &amp; Private
        </span>
        <span className="font-mono text-slate-400">ASX ETF Screener v2.5</span>
      </div>
    </div>
  );

  if (standaloneColumn) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl my-auto animate-in fade-in zoom-in-95 duration-150">
        {content}
      </div>
    </div>
  );
}
