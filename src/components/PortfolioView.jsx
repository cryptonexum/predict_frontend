import { X, History, AlertCircle } from "lucide-react";
import CountdownTimer from "./CountdownTimer";

const PortfolioView = ({
  portfolio,
  portfolioTab,
  setPortfolioTab,
  filteredPortfolio,
  setShowPortfolio,
  triggerHaptic,
  userFriendlyAddress
}) => {
  return (
    <main className="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar">
      <div className="max-w-3xl mx-auto p-4 md:p-8 pb-48 space-y-6">

        {/* Sticky Header */}
        <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md py-4 z-20 space-y-6">

          {/* Top Row */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h2 className="text-2xl font-black text-white">Your Trades</h2>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Manage Positions
              </span>
            </div>

            <button
              onClick={() => {
                triggerHaptic("light");
                setShowPortfolio(false);
              }}
              className="p-2.5 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 active:scale-95 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-[1.2fr_1.2fr_0.6fr] gap-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-4">

            {/* In Trade */}
            <div className="flex flex-col items-center border-r border-slate-800">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-1">
                In Trade
              </span>
              <span className="text-sm font-bold text-blue-400 font-mono">
                $
                {portfolio
                  .filter((t) => t.status === "active")
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toLocaleString()}
              </span>
            </div>

            {/* All Time */}
            {(() => {
              const settledTrades = portfolio.filter(
                (t) => t.status === "settled"
              );

              const totalPayout = settledTrades.reduce(
                (sum, t) => sum + (Number(t.payout) || 0),
                0
              );

              const isPositive = totalPayout >= 0;

              return (
                <div className="flex flex-col items-center border-r border-slate-800">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-1">
                    All Time
                  </span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      isPositive ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {isPositive ? "+" : "-"} $
                    {Math.abs(totalPayout).toFixed(2)}
                  </span>
                </div>
              );
            })()}

            {/* Trades Count */}
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-1">
                Trades
              </span>
              <span className="text-sm font-bold text-slate-200 font-mono">
                {portfolio.length}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
            {["Active", "Settled"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  triggerHaptic("light");
                  setPortfolioTab(tab);
                }}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                  portfolioTab === tab
                    ? "bg-white/80 text-black shadow-lg shadow-blue-900/40"
                    : "text-white"
                }`}
              >
                {tab}
                {portfolioTab === tab && (
                  <span className="ml-1 opacity-60">
                    ({filteredPortfolio.length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Trades List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredPortfolio.length > 0 ? (
            filteredPortfolio.map((trade) => {
              const isBinary = trade.marketId?.type === "binary";
              const isWin = trade.payout > 0;
              const payoutAmount =
                trade.shares ||
                Number(trade.amount) /
                  (Number(trade.avgPrice) / 100);

              const userSelection = isBinary
                ? trade.side || "N/A"
                : trade.marketId?.options?.find(
                    (opt) => opt.id === trade.side
                  )?.name || "Option " + trade.optionId;

              return (
                <div
                  key={trade._id}
                  className="group relative bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden transition-all duration-300"
                >
                  <div
                    className={`h-1 w-full ${
                      portfolioTab === "Active"
                        ? "bg-blue-500/40"
                        : isWin
                        ? "bg-green-500/60"
                        : "bg-red-900/40"
                    }`}
                  />

                  <div className="p-5 flex flex-col md:flex-row gap-6">

                    {/* Left */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-600 uppercase tracking-tighter">
                          {isBinary ? "BINARY" : "MULTI"}
                        </span>

                        {portfolioTab === "Active" && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase flex border-slate-700">
                            <div className="mr-1 text-green-600 blink">
                              Live:
                            </div>
                            <CountdownTimer
                              targetDate={trade.marketId.expiresAt}
                            />
                          </span>
                        )}

                        {portfolioTab === "Settled" && (
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${
                              isWin
                                ? "bg-green-500/10 text-green-600 border-green-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}
                          >
                            {isWin ? "Won" : "Lost"}
                          </span>
                        )}
                      </div>

                      <div className="flex">
                        {trade.marketId && (
                          <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-slate-800 bg-slate-950 shadow-inner mr-2">
                            <img
                              src={trade.marketId?.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) =>
                                (e.target.style.display = "none")
                              }
                            />
                          </div>
                        )}

                        <div className="flex flex-col">
                          <div className="text-sm font-bold text-slate-400">
                            {trade.marketId?.question ||
                              "Market Prediction"}
                          </div>
                          <div className="text-sm font-bold text-slate-400 mt-2">
                            ✔ {String(userSelection).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Box */}
                    <div className="grid grid-cols-2 w-full md:w-64 bg-slate-950/50 border border-slate-800/50 rounded-md p-3 divide-x divide-slate-800">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">
                          Stake
                        </p>
                        <p className="text-xs font-mono font-bold text-slate-300">
                          ${Number(trade.amount).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase mb-1">
                          {portfolioTab === "Active"
                            ? "Est. Payout"
                            : isWin
                            ? "Win"
                            : "Loss"}
                        </p>
                        <span
                          className={`text-sm font-mono font-black ${
                            portfolioTab === "Active"
                              ? "text-amber-400"
                              : isWin
                              ? "text-green-400"
                              : "text-red-500"
                          }`}
                        >
                          {portfolioTab === "Settled"
                            ? !isWin
                              ? `- $${Number(trade.amount).toFixed(2)}`
                              : `+ $${payoutAmount.toFixed(2)}`
                            : `$${payoutAmount.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
           userFriendlyAddress?(
            <div className="py-24 text-center space-y-4">
              <History size={48} className="mx-auto text-slate-800" />
              <p className="text-slate-500 font-bold">
                No {portfolioTab.toLowerCase()} trades found
              </p>
            </div>
           ):(
            <div className="py-24 text-center space-y-4">
              <AlertCircle size={48} className="mx-auto text-slate-800" />
              <p className="text-slate-500 font-bold">
                Connect your wallet to see Your Trades
              </p>
            </div>
           )
          )
          }
        </div>
      </div>
    </main>
  );
};

export default PortfolioView;