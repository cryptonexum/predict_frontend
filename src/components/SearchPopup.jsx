import { useState } from "react";

const SearchPopup = ({ isOpen, onClose, onSearchSubmit }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchClick = (e) => {
    // Prevent form from reloading the page
    if (e) e.preventDefault();
    
    if (!searchTerm.trim() || isSearching) return;

    setIsSearching(true);
    onSearchSubmit(searchTerm);
    onClose();
    
    setTimeout(() => {
      setIsSearching(false);
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 ">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-lg transition-opacity duration-300 ease-in-out"
      />
      
      {/* 1. Wrapped in a <form> for Enter key support */}
      <form 
        onSubmit={handleSearchClick}
        className="relative w-full max-w-2xl bg-modal border border-white/10 rounded-2xl shadow-2xl overflow-hidden shadow-black/60"
      >
        <div className="p-5 flex flex-col gap-4">
          
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-slate-400 font-bold text-xl font-outfit tracking-tight">Search</h2>
            <button 
              type="button" // Important: specify type="button" so it doesn't trigger search
              onClick={onClose} 
              className="p-2 -mr-2 text-dimtext hover:text-white rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Input Area */}
          <div className="relative flex items-center bg-white/5 rounded-xl border border-white/5 focus-within:border-lime/30 transition-colors">
            <svg className="w-5 h-5 text-dimtext ml-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              autoFocus
              type="text"
              placeholder="Start typing your search term..."
              className="w-full h-14 px-4 bg-transparent text-primary outline-none font-inter text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* 2. Button set to type="submit" */}
          <button
            type="submit"
            disabled={!searchTerm.trim() || isSearching}
            className="cursor-pointer w-full h-14 bg-slate-700 text-white font-extrabold text-lg rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-40"
          >
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Searching...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Confirm</span>
              </>
            )}
          </button>
        </div>

        <div className="h-4 border-t border-white/5 bg-black/10" />
      </form>
    </div>
  );
};

export default SearchPopup;