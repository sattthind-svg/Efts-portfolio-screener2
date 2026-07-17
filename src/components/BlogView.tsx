import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Clock, 
  ArrowLeft, 
  User, 
  Tag, 
  TrendingUp, 
  Search, 
  Compass, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../blogData';

interface BlogViewProps {
  onNavigateToTab: (tab: string, ticker?: string) => void;
  selectedPostId: string | null;
  onSelectPost: (id: string | null) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({ 
  onNavigateToTab, 
  selectedPostId, 
  onSelectPost 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Handle URL updates gracefully for routing
  const handlePostClick = (id: string) => {
    onSelectPost(id);
    window.history.pushState(null, '', `/blog/${id}`);
  };

  const handleBackToArchive = () => {
    onSelectPost(null);
    window.history.pushState(null, '', '/blog');
  };

  // Filter & Search Post archive
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
        post.relatedTickers.some(tick => tick.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  const activePost = useMemo(() => {
    if (!selectedPostId) return null;
    return BLOG_POSTS.find(p => p.id === selectedPostId) || null;
  }, [selectedPostId]);

  // Categories list
  const categories = ['All', 'Investing Guide', 'Comparison', 'Tax & Wealth', 'Property'];

  // A custom high-fidelity renderer that translates basic markdown to beautiful HTML
  const renderContent = (markdownText: string) => {
    const blocks = markdownText.split('\n\n');
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // H3 Headers (### ...)
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl sm:text-2xl font-bold text-slate-900 mt-8 mb-4 tracking-tight border-b border-slate-100 pb-2">
            {trimmed.replace('### ', '')}
          </h3>
        );
      }

      // Bullets (* ...)
      if (trimmed.startsWith('* ')) {
        const items = trimmed.split('\n');
        return (
          <ul key={idx} className="space-y-2.5 my-4 pl-1">
            {items.map((item, i) => {
              const cleanItem = item.replace('* ', '').trim();
              // Parse basic bold (**text**)
              const parts = cleanItem.split('**');
              return (
                <li key={i} className="flex items-start gap-2.5 text-slate-600 text-sm sm:text-base leading-relaxed">
                  <span className="inline-block w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2.5 shrink-0" />
                  <span>
                    {parts.map((part, pIdx) => (
                      pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-slate-900">{part}</strong> : part
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        );
      }

      // Ordered list numbered elements (1. ...)
      if (/^\d+\.\s+/.test(trimmed)) {
        const items = trimmed.split('\n');
        return (
          <ol key={idx} className="space-y-3 my-5 list-decimal pl-5 text-slate-600">
            {items.map((item, i) => {
              const cleanItem = item.replace(/^\d+\.\s+/, '').trim();
              const parts = cleanItem.split('**');
              return (
                <li key={i} className="text-sm sm:text-base leading-relaxed pl-1">
                  {parts.map((part, pIdx) => (
                    pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-slate-900">{part}</strong> : part
                  ))}
                </li>
              );
            })}
          </ol>
        );
      }

      // Blockquotes (> ...)
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="border-l-4 border-indigo-600 bg-indigo-50/50 rounded-r-xl px-4 py-3 text-sm sm:text-base text-slate-700 font-medium italic my-5">
            {trimmed.replace('> ', '')}
          </blockquote>
        );
      }

      // Tables (| ... |)
      if (trimmed.startsWith('|')) {
        const rows = trimmed.split('\n');
        // Filter out separator rows like | :--- |
        const cleanRows = rows.filter(row => !row.includes('---'));
        return (
          <div key={idx} className="overflow-x-auto my-6 border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {cleanRows[0].split('|').map((col, cIdx) => {
                    const cell = col.trim();
                    if (cIdx === 0 || cIdx === cleanRows[0].split('|').length - 1) return null;
                    return <th key={cIdx} className="px-4 py-3 font-bold text-slate-700">{cell}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {cleanRows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50">
                    {row.split('|').map((col, cIdx) => {
                      const cell = col.trim();
                      if (cIdx === 0 || cIdx === row.split('|').length - 1) return null;
                      
                      // Highlight bold cells
                      const isBold = cell.startsWith('**') && cell.endsWith('**');
                      const cleanCell = cell.replace(/\*\*/g, '');

                      return (
                        <td key={cIdx} className="px-4 py-3 text-slate-600">
                          {isBold ? <strong className="font-bold text-slate-900">{cleanCell}</strong> : cleanCell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }

      // Default paragraph
      // Support basic **bold** tags inline
      const inlineParts = trimmed.split('**');
      return (
        <p key={idx} className="text-slate-600 text-sm sm:text-base leading-relaxed my-4">
          {inlineParts.map((part, pIdx) => (
            pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-slate-900">{part}</strong> : part
          ))}
        </p>
      );
    });
  };

  if (activePost) {
    return (
      <div className="space-y-6">
        
        {/* Navigation Action */}
        <button
          onClick={handleBackToArchive}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-950 transition bg-white border border-slate-200 px-3.5 py-2 rounded-xl cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          Back to Blog Archive
        </button>

        {/* Detailed Article Card */}
        <motion.article 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs"
        >
          {/* Header Banner styling */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-2xl"></div>

            <div className="relative z-10 max-w-4xl space-y-4">
              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 rounded-md">
                {activePost.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {activePost.title}
              </h1>

              {/* Author and Date Meta block */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300 pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-white text-[11px] font-bold">
                    {activePost.author.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-white">{activePost.author}</span>
                    <span className="text-[10px] text-slate-400 block -mt-0.5">{activePost.authorRole}</span>
                  </div>
                </div>

                <div className="h-4 w-px bg-white/20"></div>

                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{activePost.date}</span>
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{activePost.readTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Post body contents */}
          <div className="p-6 sm:p-10 max-w-4xl mx-auto prose prose-slate">
            {renderContent(activePost.content)}
          </div>

          {/* Footer Interactive Actions box */}
          <div className="border-t border-slate-100 bg-slate-50 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-500" />
                Deep Link: Monitor Tickers Discussed
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                This guide references live market data for these Sentinel assets. Select a ticker below to view active discounts, premiums, historical tables, or configure custom buying notifications.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activePost.relatedTickers.map(ticker => (
                <button
                  key={ticker}
                  onClick={() => onNavigateToTab('watchlist', ticker)}
                  className="inline-flex items-center gap-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black text-slate-800 shadow-3xs hover:border-slate-300 transition duration-150 cursor-pointer"
                >
                  <span className="text-emerald-500 font-mono font-black">{ticker}</span>
                  <span className="text-slate-400">Sentinel</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </motion.article>

        {/* Read Next Sidebar Suggestions */}
        <div className="space-y-3.5">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">More Popular Guides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BLOG_POSTS.filter(p => p.id !== activePost.id).slice(0, 2).map(post => (
              <div 
                key={post.id}
                onClick={() => handlePostClick(post.id)}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-300 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {post.category}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-2 hover:text-indigo-600 transition">
                    {post.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-4">
                  <span>{post.readTime}</span>
                  <span className="font-bold text-indigo-600 flex items-center gap-0.5">
                    Read Post <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Hero Welcome banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl"></div>
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-white/10 text-emerald-300 rounded-full border border-white/5">
            Educational Hub
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            Australasia ETF Knowledge Base
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Gain a major competitive advantage. Learn how to navigate management expense ratios (MER), analyze premium fluctuations, utilize franking credits, and design a tax-efficient $1M passive portfolio.
          </p>
        </div>
      </div>

      {/* Controls Bar: Search & Category Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-3xs">
        
        {/* Category List Pills */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl w-fit overflow-x-auto no-scrollbar whitespace-nowrap gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-white text-slate-950 shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat === 'All' ? '📂 All Guides' : cat}
            </button>
          ))}
        </div>

        {/* Local Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guides, codes, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 focus:border-indigo-500 focus:bg-white rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-slate-800 outline-hidden transition"
          />
        </div>

      </div>

      {/* Main Blog Archive Feed */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-md mx-auto">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Articles Found</h3>
          <p className="text-xs text-slate-500 mt-1">We couldn't find any articles matching your filters. Try resetting your search query.</p>
          <button
            onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
            className="mt-4 text-xs font-bold bg-indigo-50 text-indigo-700 px-3.5 py-2 rounded-lg"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handlePostClick(post.id)}
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-indigo-400 hover:shadow-xs transition duration-200 flex flex-col justify-between group cursor-pointer"
            >
              <div className="p-5 sm:p-6 space-y-4">
                
                {/* Meta Header */}
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md">
                    {post.category}
                  </span>
                  
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>

                {/* Content info */}
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* Tag Pill Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {post.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      {tag}
                    </span>
                  ))}
                </div>

              </div>

              {/* Card Footer panel */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex items-center justify-between">
                
                {/* Author badge */}
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 text-[10px] font-bold">
                    {post.author.charAt(0)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-600">{post.author}</span>
                </div>

                {/* Action CTA */}
                <span className="text-xs font-black text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition duration-150">
                  Read Article
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>

              </div>

            </motion.div>
          ))}
        </div>
      )}

      {/* Suggested Strategy Callout Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Configure Your Targeted Core Allocation</h4>
            <p className="text-xs text-slate-500 max-w-xl">
              Now that you've reviewed low-cost fees and tax-efficient structures, use our multi-source Overlap Analyzer and historical charts to customize your portfolio Sentinel.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToTab('screener')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
        >
          Open ETF Screener
        </button>
      </div>

    </div>
  );
};
