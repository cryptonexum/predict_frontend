import { X, PartyPopper } from "lucide-react";

const TradeModal = ({
  selectedMarket,
  setSelectedMarket,
  txStatus,
  tradeSide,
  setTradeSide,
  selectedOptionId,
  setSelectedOptionId,
  amount,
  setAmount,
  potentialReturn,
  handleConfirmTx,
  getPercentages,
  userFriendlyAddress,
  userBalance,
  handleLogin,
  triggerHaptic
}) => {
  if (!selectedMarket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      
      {/* Background Click */}
      <div
        className="absolute inset-0"
        onClick={() => setSelectedMarket(null)}
      />

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300">
        
        {txStatus === "success" ? (
          <div className="p-12 text-center space-y-6">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 border border-green-500/20">
              <PartyPopper size={40} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                Trade Confirmed
              </h2>
              <p className="text-slate-400 text-sm">
                Your position has been successfully placed.
              </p>
            </div>

            <button
              onClick={() => setSelectedMarket(null)}
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-white transition-all shadow-lg shadow-blue-600/20"
            >
              Return to Markets
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-8 py-5 flex justify-between items-center border-b border-slate-800/50 bg-slate-900/50 sticky top-0 z-20">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                  Execution Terminal
                </span>
                <h2 className="text-sm font-bold text-slate-300">
                  PREDICT EVENT
                </h2>
              </div>

              <button
                onClick={() => setSelectedMarket(null)}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">

              {/* Question */}
              <div className="flex gap-5">
                {selectedMarket.imageUrl && (
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl">
                    <img
                      src={selectedMarket.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        (e.target.style.display = "none")
                      }
                    />
                  </div>
                )}

                <h3 className="text-xl font-bold text-white leading-tight tracking-tight pt-1">
                  {selectedMarket.question}
                </h3>
              </div>

              {/* Binary */}
              {selectedMarket.type === "binary" ? (
                <div className="grid grid-cols-2 gap-4">
                  {["yes", "no"].map((side) => {
                    const isYes = side === "yes";
                    const selected = tradeSide === side;
                    const perc = getPercentages(selectedMarket)[side];

                    return (
                      <button
                        key={side}
                        onClick={() => setTradeSide(side)}
                        className={`relative flex flex-col items-center py-4 rounded-2xl border-2 transition-all ${
                          selected
                            ? isYes
                              ? "border-emerald-500 bg-emerald-500/10"
                              : "border-rose-500 bg-rose-500/10"
                            : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-black mb-1 ${
                            selected
                              ? isYes
                                ? "text-emerald-400"
                                : "text-rose-400"
                              : "text-slate-500"
                          }`}
                        >
                          {side.toUpperCase()} {perc}%
                        </span>

                        <span
                          className={`text-xl font-black ${
                            selected
                              ? "text-white"
                              : "text-slate-400"
                          }`}
                        >
                          {selectedMarket[side]}¢
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedMarket.options?.map((opt) => {
         
                    
                    const isSelected =
                      selectedOptionId === opt.id;

                    return (
                      <button
                        key={opt.id}
                        onClick={() =>
                          setSelectedOptionId(opt.id)
                        }
                        className={`w-full p-4 rounded-2xl border-2 transition-all ${
                          isSelected
                            ? "border-slate-500 bg-slate-700"
                            : `border-slate-800`
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-white">
                            {opt.name}
                          </span>
                          <span className="text-sm font-black text-white">
                            {opt.price}¢
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Amount */}
              <input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="Enter amount..."
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-3 px-6 text-md font-mono text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

{/* Amount & Return Section */}
<div className="flex flex-row items-center bg-slate-800/30 p-6 rounded-2xl font-sans text-white justify-between border border-slate-800/50">
  <div className="flex flex-col">
    <span className="font-medium tracking-tight text-white flex items-center gap-1">
      To win <span className="text-xs">💵</span>
    </span>
    <span className="text-slate-400 text-xs">
      Avg. Price {
        selectedMarket.type === "binary" 
          ? selectedMarket[tradeSide] // Uses 'yes' or 'no' price
          : selectedMarket.options?.find(o => o.id === selectedOptionId)?.price // Finds selected option price
      }¢
    </span>
  </div>

  <div className="flex items-baseline">
    <span className="text-3xl font-black text-[#57b876] tabular-nums tracking-tighter">
      ${potentialReturn || "0.00"}
    </span>
  </div>
</div>

              {userFriendlyAddress ? (
                <>
                  <div className="text-center font-mono text-slate-300">
                    Avl bal: $ {userBalance}
                  </div>

                  <button
                    disabled={!amount || txStatus === "loading"}
                    onClick={handleConfirmTx}
                    className="w-full bg-white py-5 rounded-2xl font-black text-black"
                  >
                    {txStatus === "loading"
                      ? "Processing..."
                      : "Confirm & Place Trade"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    triggerHaptic("light");
                    handleLogin(true);
                  }}
                  className="w-full bg-white py-5 rounded-2xl font-black text-black"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TradeModal;