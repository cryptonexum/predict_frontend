import { History } from "lucide-react";

const EmptyState = ({ activeTab, setActiveTab,setSearchQuery,setIsRefreshing,setSortBy }) => {
  return (
    <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 w-full">
      <div className="bg-slate-900/50 p-6 rounded-full border border-slate-800/50">
        <History size={48} className="text-slate-700" />
      </div>
      <div className="space-y-1">
        <p className="text-slate-200 font-bold text-lg">No Markets Found</p>
        <p className="text-slate-500 text-sm">
          There are currently no active markets in the {activeTab} category.
        </p>
      </div>
      <button
        onClick={() => {setActiveTab("All"); setSearchQuery("");setIsRefreshing(true),setSortBy("")}}
        className="mt-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
      >
        View All Markets
      </button>
    </div>
  );
};

export default EmptyState;