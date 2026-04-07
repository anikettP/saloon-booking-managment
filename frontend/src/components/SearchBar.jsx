import React, { useContext, useEffect, useRef, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { X, Search, ArrowRight, ShoppingBag } from 'lucide-react'; 

// --- Fuzzy Search Logic (Kept efficient) ---
const levenshtein = (a = '', b = '') => {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const dp = Array.from({ length: an + 1 }, () => new Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) dp[i][0] = i;
  for (let j = 0; j <= bn; j++) dp[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[an][bn];
};

const similarityScore = (a = '', b = '') => {
  const A = a.trim().toLowerCase();
  const B = b.trim().toLowerCase();
  if (!A || !B) return 0;
  if (A === B) return 1;
  if (A.includes(B) || B.includes(A)) return 0.95;
  const dist = levenshtein(A, B);
  const maxLen = Math.max(A.length, B.length);
  return Math.max(0, 1 - dist / maxLen);
};

// --- Main Component ---
const SearchBar = () => {
  const { setSearch, showSearch, setShowSearch, products, currency } = useContext(ShopContext);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle Opening Animation & Locking Body Scroll
  useEffect(() => {
    if (showSearch) {
      setIsAnimating(true);
      // Don't scroll to top immediately, just lock scroll to keep user context
      document.body.style.overflow = 'hidden'; 
      setTimeout(() => inputRef.current?.focus(), 50); 
    } else {
      setTimeout(() => setIsAnimating(false), 400); // Wait for exit anim
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showSearch]);

  // Fuzzy Filter Logic
  useEffect(() => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    const handler = setTimeout(() => {
      const q = query.trim().toLowerCase();
      const scored = products
        .map((p) => ({ product: p, score: similarityScore(p.name || '', q) }))
        .filter((s) => s.score > 0.25) // Slightly lower threshold for broader matches
        .sort((a, b) => b.score - a.score)
        .slice(0, 6) 
        .map((s) => s.product);
      setSuggestions(scored);
      setActiveIndex(-1);
    }, 100); // Fast debounce
    return () => clearTimeout(handler);
  }, [query, products]);

  // Actions
  const onSelect = (product) => {
    handleClose();
    if (product._id) navigate(`/product/${product._id}`);
  };

  const handleClose = () => {
    setShowSearch(false);
    setTimeout(() => {
      setSearch('');
      setQuery('');
      setSuggestions([]);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') handleClose();
    if (!suggestions.length && e.key === 'Enter') handleClose();
    
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = suggestions[activeIndex >= 0 ? activeIndex : 0];
        if (selected) onSelect(selected);
      }
    }
  };

  if (!showSearch && !isAnimating) return null;

  return (
    // Z-INDEX FIX: z-[99999] ensures it's absolutely on top of everything (Navbar, Modals, etc.)
    <div className={`fixed inset-0 z-[99999] flex items-start justify-center pt-4 sm:pt-24 transition-all duration-300 ${showSearch ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
      
      {/* 1. Ultra-Blur Glass Overlay */}
      <div 
        className="absolute inset-0 bg-white/20 backdrop-blur-xl transition-opacity duration-500 ease-out"
        onClick={handleClose}
      />

      {/* 2. Main Search Container (Apple-style Bouncy Animation) */}
      <div 
        className={`relative w-[95%] sm:w-[85%] md:max-w-2xl transform transition-all duration-500 cubic-bezier(0.19, 1, 0.22, 1) 
          ${showSearch ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-12 scale-95 opacity-0'}`}
      >
        {/* Glass Card */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden ring-1 ring-black/5">
          
          {/* Header & Input Area */}
          <div className="flex items-center px-5 py-4 border-b border-gray-100/50 gap-3">
            <div className="p-2 bg-pink-50 rounded-full text-pink-600">
               <Search className="w-5 h-5" strokeWidth={2.5} />
            </div>
            
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-lg text-gray-800 placeholder-gray-400 h-10 font-medium tracking-tight"
              type="text"
              placeholder="What are you looking for?"
              autoComplete="off"
            />

            {/* Clear Button */}
            {query && (
              <button 
                onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
                className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-all active:scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            <button 
              onClick={handleClose}
              className="text-sm font-semibold text-gray-400 hover:text-gray-800 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100/50"
            >
              Cancel
            </button>
          </div>

          {/* Suggestions List */}
          <div className="max-h-[65vh] overflow-y-auto custom-scrollbar bg-white/50">
            {suggestions.length > 0 ? (
              <div className="p-3 space-y-2">
                <p className="text-[10px] uppercase font-bold text-gray-400 px-3 py-1 tracking-widest">
                  Products
                </p>
                {suggestions.map((p, i) => (
                  <div
                    key={p._id || i}
                    onClick={() => onSelect(p)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`group flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all duration-300 ease-out border border-transparent
                      ${activeIndex === i 
                        ? 'bg-white shadow-lg border-pink-100 scale-[1.02] -translate-y-0.5' 
                        : 'hover:bg-white/60 hover:shadow-sm'}`}
                  >
                    {/* Product Image */}
                    <div className="w-14 h-14 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 shadow-sm relative group">
                      <img 
                        src={(p.image && p.image[0]) || assets.product_placeholder} 
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className={`text-sm font-bold truncate transition-colors ${activeIndex === i ? 'text-pink-600' : 'text-gray-800'}`}>
                        {p.name}
                      </h4>
                      <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-pink-300"></span>
                        {p.category} {p.type && `• ${p.type}`}
                      </p>
                    </div>

                    {/* Price Tag */}
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm transition-colors
                        ${activeIndex === i ? 'bg-pink-500 text-white' : 'bg-white text-gray-900 border border-gray-100'}`}>
                        {currency}{p.price}
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                         ${activeIndex === i ? 'bg-pink-100 text-pink-600 translate-x-0 opacity-100' : 'translate-x-2 opacity-0'}`}>
                         <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              // Empty State
              <div className="py-16 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-4 text-pink-300 shadow-inner">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <p className="text-base text-gray-600 font-medium">No results for "<span className="text-pink-600">{query}</span>"</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">We couldn't find any matches. Try checking for typos or use broader terms.</p>
              </div>
            ) : (
              // Initial State
              <div className="py-12 text-center opacity-50 flex flex-col items-center">
                <Search className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-xs text-gray-400 font-medium">Type something to search...</p>
              </div>
            )}
          </div>
          
          {/* Footer Hint - Hidden on mobile to save space */}
          <div className="hidden sm:flex bg-gray-50/80 backdrop-blur-sm px-6 py-2.5 border-t border-gray-100 items-center justify-between text-[10px] text-gray-400">
             <span className="font-medium tracking-wide">Book.My.Glow Instant Search</span>
             <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><kbd className="font-sans bg-white border border-gray-200 rounded px-1.5 py-0.5 shadow-sm text-gray-500">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1.5"><kbd className="font-sans bg-white border border-gray-200 rounded px-1.5 py-0.5 shadow-sm text-gray-500">↵</kbd> Select</span>
                <span className="flex items-center gap-1.5"><kbd className="font-sans bg-white border border-gray-200 rounded px-1.5 py-0.5 shadow-sm text-gray-500">Esc</kbd> Close</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SearchBar;