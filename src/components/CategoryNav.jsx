import { Filter, SlidersHorizontal } from "lucide-react";

const CategoryNav = ({
  CATEGORIES,
  SORT_OPTIONS,
  activeTab,
  setActiveTab,
  sortBy,
  setSortBy,
  showSortMenu,
  setShowSortMenu,
  triggerHaptic
}) => {
  return (
    <nav className="shrink-0 border-b border-slate-900 bg-slate-950 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4">
        
        {/* Left: Category Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 pr-4">
          <Filter size={16} className="text-slate-500 mr-2 shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                triggerHaptic("light");
                setActiveTab(cat);
                setSortBy("");
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold border shrink-0 transition-all ${
                activeTab === cat
                  ? "bg-white text-black border-white"
                  : "bg-slate-900 text-slate-400 border-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right: Sorting Trigger */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              triggerHaptic("light");
              setShowSortMenu(!showSortMenu);
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              showSortMenu
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>

          {showSortMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowSortMenu(false)}
              />
              <div className="absolute text-black right-0 mt-3 w-44 bg-slate-300 border border-slate-800 rounded-2xl shadow-2xl z-40 py-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 pb-2 mb-1 border-b border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Filter By
                  </span>
                </div>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      triggerHaptic("medium");
                      setSortBy(opt);
                      setShowSortMenu(false);
                      setActiveTab("All");
                    }}
                    className={`w-full text-black text-left px-4 py-2.5 text-xs font-bold transition-colors ${
                      sortBy === opt
                        ? "text-white bg-slate-800"
                        : "text-black hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;