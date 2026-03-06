import CountdownTimer from "./CountdownTimer";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MarketsGrid = ({
  markets,
  handleOpenTrade,
  getPercentages,
  getPercentagesMulti,
  expandedMarkets,
  toggleExpand,
  page,
  setPage,
  meta,
  triggerHaptic,
  activeTab,
  setActiveTab,
  setSortBy
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
        {markets.map((market) => {
          const percs =
            market.type === "multi"
              ? getPercentagesMulti(market)
              : getPercentages(market);

          const totalPoolSum =
            market.type === "multi"
              ? market.options?.reduce((sum, opt) => sum + (Number(opt.shares) || 0), 0) || 0
              : (Number(market.yesPool) || 0) + (Number(market.noPool) || 0);

          const displayVolume = market.volume;
          const displayTrades = market.totalTrades || 0;

          const sortedOptions =
            market.type === "multi"
              ? [...(market.options || [])].sort((a, b) => b.shares - a.shares)
              : [];

          return (
            <div
              key={market._id}
              className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-6  hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-300 shadow-xl flex flex-col h-full"
              
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-5">
                <span className="text-[11px] font-bold text-blue-400 uppercase px-3 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20 tracking-wider">
                  {market.category}
                </span>
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                  {market.status === "resolved" ? (
                    "Ended"
                  ) : (
                    <CountdownTimer targetDate={market.expiresAt} />
                  )}
                </div>
              </div>

              {/* Question + Image */}
              <div className="flex gap-4 mb-5">
                {market.imageUrl && (
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
                    <img
                      src={market.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )}
                <h3
                  className={`text-lg font-bold text-slate-100 leading-snug tracking-tight ${
                    market.imageUrl ? "pt-1" : ""
                  }`}
                >
                  {market.question}
                </h3>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-800">
                <div className="flex flex-col gap-1 flex-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Volume
                  </span>
                  <span className="text-[12px] font-bold text-slate-200">
                    ${displayVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="w-[1px] h-8 bg-slate-800" />

                <div className="flex flex-col gap-1 flex-1 text-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Trades
                  </span>
                  <span className="text-[12px] font-bold text-slate-200">
                    {displayTrades.toLocaleString()}
                  </span>
                </div>

                <div className="w-[1px] h-8 bg-slate-800" />

                <div className="flex flex-col gap-1 flex-1 text-right">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {market.status === "resolved" ? "Result" : "Chance"}
                  </span>
                  <span className="text-[12px] font-bold text-slate-200">
                    {market.status === "resolved" ? (
                      <span className="text-green-400 uppercase tracking-wider">
                        {market.type === "binary" ? market.winningSide : market.winningOptionId}
                      </span>
                    ) : market.type === "binary" ? (
                      `Yes | ${percs.yes}%`
                    ) : (
                      `${percs.name.slice(0,5)}`
                    )}
                  </span>
                </div>
              </div>

              {/* Bottom Action Area */}
              <div className="mt-auto">
                {market.type === "binary" ? (
                  <div className="grid grid-cols-2 gap-3 px-2 ">
                    <button className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#539365] hover:bg-[#1d5a2e] py-2 px-6 transition-all active:scale-95 shadow-lg shadow-black/20" 
                    onClick={(e) => {
                if (market.status === "resolved") return;
                if (e.target.closest(".expand-toggle")) return;
                handleOpenTrade(market,"yes");
              }}
                    >
                      <span className="text-lg text-slate-300">Yes</span>
                      <span className="text-md text-white">{market.yes}¢</span>
                    </button>

                    <button className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#8f3d3d] hover:bg-[#7a2929] py-2 px-6 transition-all active:scale-95 shadow-lg shadow-black/20"
                    onClick={(e) => {
                if (market.status === "resolved") return;
                if (e.target.closest(".expand-toggle")) return;
                handleOpenTrade(market,"no");
              }}
                    >
                      <span className="text-lg text-slate-300">No</span>
                      <span className="text-md text-white">{market.no}¢</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const colors = ["bg-[#539365]", "bg-[#2D333B]", "bg-[#4466a8]", "bg-[#8c44a8]"];
                      const isExpanded = expandedMarkets[market._id];
                      const visibleOptions = isExpanded ? sortedOptions : sortedOptions.slice(0, 1);

                      return (
                        <>
                          {visibleOptions.map((opt, index) => {
                            const optPerc = totalPoolSum > 0 ? ((opt.shares / totalPoolSum) * 100).toFixed(0) : (100 / sortedOptions.length).toFixed(0);
                            const bgColor = colors[index % colors.length];
                            return (
                              <div
                                key={opt.id}
                                className={`relative overflow-hidden ${bgColor} p-3 rounded-xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-black/20`}
                                onClick={(e) => {
                                if (market.status === "resolved") return;
                                if (e.target.closest(".expand-toggle")) return;
                                handleOpenTrade(market,opt.id,);
                                }}
                              >
                                <div className="flex justify-between items-center relative z-10 cursor-pointer">
                                  <span className="text-sm font-bold text-white">{opt.name}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-white">{opt.price}¢</span>
                                    <span className="text-[10px] text-white font-mono font-black px-1.5 py-0.5 rounded bg-black/20">
                                      {optPerc}%
                                    </span>
                                  </div>
                                </div>
                                <div className="absolute left-0 top-0 bottom-0 bg-white/10" style={{ width: `${optPerc}%` }} />
                              </div>
                            );
                          })}

                          {sortedOptions.length > 1 && (
                            <div className="expand-toggle flex items-center justify-center pt-1">
                              <button
                                className="w-full py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-400 transition-all"
                                onClick={(e) => toggleExpand(market._id, e)}
                              >
                                {isExpanded ? "Show Less" : `+ ${sortedOptions.length - 1} More Options`}
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pb-40 mt-8">
          <button
            disabled={page === 1}
            onClick={() => {
              triggerHaptic("light");
              setActiveTab(activeTab);
              setSortBy("");
              setPage(1);
            }}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex items-center gap-1 mx-2">
            {[...Array(meta.totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (meta.totalPages > 5 && Math.abs(pageNum - page) > 1 && pageNum !== 1 && pageNum !== meta.totalPages) {
                if (pageNum === 2 || pageNum === meta.totalPages - 1)
                  return (
                    <span key={pageNum} className="text-slate-600">
                      ...
                    </span>
                  );
                return null;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => {
                    setPage(pageNum);
                    triggerHaptic("light");
                  }}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                    page === pageNum
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            disabled={!meta.hasMore}
            onClick={() => {
              setPage((p) => p + 1);
              triggerHaptic("light");
            }}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </>
  );
};

export default MarketsGrid;