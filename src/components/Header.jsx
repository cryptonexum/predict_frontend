import { Wallet, LogIn, Briefcase, SearchIcon } from "lucide-react";

const Header = ({
  userFriendlyAddress,
  userBalance,
  showPortfolio,
  setShowPortfolio,
  handleLogin,
  setOpenSearchPopup,
  triggerHaptic,
}) => {
  return (
    <header className="shrink-0 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md z-30 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tighter leading-none">
            <span className="text-white">NOTY</span>
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              PREDICT
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
        
            <button
              onClick={() => {
                triggerHaptic("light");
                setShowPortfolio(!showPortfolio);
              }}
              className={`p-2 rounded-md border ${
                showPortfolio
                  ? "bg-blue-600 border-blue-500"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              <Briefcase size={20} />
            </button>
    

          <SearchIcon
            className="text-blue-400 cursor-pointer"
            onClick={() => setOpenSearchPopup(true)}
          />

          <div
            onClick={handleLogin}
            className="flex items-center gap-3 px-4 py-2 rounded-md border border-slate-800 cursor-pointer"
          >
            {userFriendlyAddress ? (
              <>
                <Wallet size={16} className="text-blue-400" />
                <span className="text-sm font-mono font-bold text-blue-400">
                  ${Number(userBalance || 0).toFixed(2)}
                </span>
              </>
            ) : (
              <>
                <LogIn size={16} className="text-blue-400" />
                <span className="text-sm font-bold text-blue-400 uppercase">
                  Connect
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
