import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search, Filter, X, Wallet, CheckCircle2, Briefcase,
  RotateCcw, TrendingUp, ArrowUpRight, ArrowDownRight, LayoutGrid,
  History, PartyPopper, ExternalLink, Inbox,
  LogIn,
  FilterIcon,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  SearchIcon
} from 'lucide-react';
import callApi from "../helper/ApiHelper";
import { useUser } from "../context/userContext";
import {
  useTonAddress,
  useTonConnectUI,
  CHAIN,
  THEME,
} from "@tonconnect/ui-react";
import { mainnet } from 'viem/chains';
import DepositPopup from '../Components/DepositPopup';
import SearchPopup from '../components/SearchPopup';
import WalletModal from '../components/WalletModal';
import { BrowserProvider } from 'ethers'
import CountdownTimer from '../components/CountdownTimer';
import Header from '../components/Header';
import MarketsGrid from '../components/MarketGrid';
import PortfolioView from '../components/PortfolioView';
import TradeModal from '../components/TradeModal';
import CategoryNav from '../components/CategoryNav';
import EmptyState from '../components/EmptyState';



const CATEGORIES = ["All", "Politics", "Crypto", "Sports", "Science", "Entertainment","Tech","Bitcoin","Other"];

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
// const CountdownTimer = ({ targetDate }) => {
//   // 1. Initialize with an empty object or null to avoid "00:00" flicker
//   const [timeLeft, setTimeLeft] = useState(null);

//   useEffect(() => {
//     // 2. Extract logic into a function
//     const calculateTime = () => {
//       const now = new Date().getTime();
//       const distance = new Date(targetDate).getTime() - now;

//       if (distance < 0) {
//         return { d: 0, h: 0, m: 0, s: 0, expired: true };
//       }

//       return {
//         d: Math.floor(distance / (1000 * 60 * 60 * 24)),
//         h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
//         m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
//         s: Math.floor((distance % (1000 * 60)) / 1000),
//         expired: false
//       };
//     };

//     // 3. Run immediately
//     setTimeLeft(calculateTime());

//     // 4. Then start interval
//     const timer = setInterval(() => {
//       const updatedTime = calculateTime();
//       setTimeLeft(updatedTime);
//       if (updatedTime.expired) clearInterval(timer);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [targetDate]);

//   // 5. Handle initial null state (Loading)
//   if (!timeLeft) return <span className="opacity-0">--:--</span>;
  
//   if (timeLeft.expired) return <span className="text-red-500 font-bold uppercase text-[9px]">Ended</span>;

//   return (
//     <span className="flex items-center gap-1 font-mono text-slate-400">
//       {timeLeft.d > 0 && `${timeLeft.d}d `}
//       {String(timeLeft.h).padStart(2, '0')}h {String(timeLeft.m).padStart(2, '0')}m {String(timeLeft.s).padStart(2, '0')}s
//     </span>
//   );
// };


const maskAddress = (address) => {
  if (!address || address.length < 10) return address; // In case the address is too short, just return it as is.
  const start = address.slice(0, 6); // Get the first 6 characters
  const end = address.slice(-4); // Get the last 4 characters
  return `${start}...${end}`;
};


const Home = () => {
  const { initdata } = useUser();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 1000);

  const [markets, setMarkets] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [user, setUser] = useState(null);

  const [selectedMarket, setSelectedMarket] = useState(null);
  const [amount, setAmount] = useState('');
  const [tradeSide, setTradeSide] = useState('yes');
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [txStatus, setTxStatus] = useState('idle');
  const [portfolioTab, setPortfolioTab] = useState("Active");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");



  const [openSearchPopup, setOpenSearchPopup] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [tonConnectUI] = useTonConnectUI();
  const [disconnect, setDisconnect] = useState(false);
  const userFriendlyAddress = useTonAddress();
  const [expandedMarkets, setExpandedMarkets] = useState({});
  const [showSortMenu, setShowSortMenu] = useState(false);
const [sortBy, setSortBy] = useState('Trending'); 
const SORT_OPTIONS = ['Trending', 'New', 'Ends Soon', 'Ended','Yes/No','MultiChoice'];
const [page, setPage] = useState(1);
const [meta, setMeta] = useState({ totalPages: 1, hasMore: false });


const address = useTonAddress();




  useEffect(() => {
    // 1. Listen for status changes
    const unsubscribe = tonConnectUI.onStatusChange(async (wallet) => {
      if (!wallet) return;
      const chain = tonConnectUI?.account?.chain;
      if (chain != CHAIN.MAINNET) {
        setError("Please Connect with Mainnet"); return;
      }

      // 2. Check if we have a proof from the wallet
      const tonProof = wallet.connectItems?.tonProof;
      

      console.log("tonProof",tonProof)

      if (tonProof && 'proof' in tonProof) {
        // 3. Send proof to backend for verification
        const proof = tonProof.proof;
        try {
          const body =   {
              address: wallet.account.address,
              publicKey: wallet.account.publicKey,
              proof: {
                ...proof,
                state_init: wallet.account.walletStateInit,
				},
            }
          const { token } = await callApi("POST", "/verify",body,{ 'Content-Type': 'application/json' });
          setToken(token);
          if (token) {
            localStorage.setItem('token', token);
            console.log("Logged in successfully!");
          }
        } catch (err) {
          console.error("Auth failed", err);
          tonConnectUI.disconnect();
        }
      }
    });

    return () => unsubscribe();
  }, [tonConnectUI]);

  const handleLogin = async () => {
    if(!userFriendlyAddress){
    const { payload } = await callApi("GET", "/generate-payload");
        tonConnectUI.setConnectRequestParameters({
          state: 'ready',
          value: { tonProof: payload }
        });
    await tonConnectUI.openModal();
    }else{
     setShowWalletModal(true);
    }
    
  };



  tonConnectUI.uiOptions = {
    uiPreferences: {
      borderRadius: 's',
      theme: THEME.DARK
    }
  };




const handleDisconnect = async () => {
  tonConnectUI.disconnect();
  triggerHaptic('medium');
  setShowWalletModal(false);
  setIsWalletConnected(false);
  setWalletAddress("");
  setUserBalance(0);
  setShowPortfolio(false);
  localStorage.clear(); 
};



  // if (userFriendlyAddress) {
  //   fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${userFriendlyAddress}`)
  //     .then(res => res.json())
  //     .then(data => setUserBalance(data.result / 1e9)); // Convert nanoton to TON
  // }



  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedMarkets(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

useEffect(() => {
  if(localStorage.getItem("address")){
    setToken(localStorage.getItem("address"));
  }
}, [userFriendlyAddress, initdata,token]);

useEffect(() => {
    
    const fetchBalance = async () => {
      try {
        // It is better to pass the address as a query param if your API needs it
        const resp = await callApi("GET", `/getJettonBalance?address=${userFriendlyAddress}`, {}, { "Authorization":`Bearer ${token}` });

        console.log("--. Balance received:", resp);

        if (resp && resp.balance !== undefined) {
          setUserBalance(resp.balance);
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      }
    };

  if (!userFriendlyAddress || !initdata) return;
  fetchBalance();
}, [userFriendlyAddress, initdata,token]);


// useEffect(() => {
//   // 1. Define an async function inside useEffect
//   const handleWalletConnection = async () => {
//     if (!userFriendlyAddress) {
//       setButtonText("Connect TON Wallet");
//       setDisconnect(false);
//       return;
//     }

//     const chain = tonConnectUI?.account?.chain;

//     if (chain === CHAIN.MAINNET) {
//       setIsMainnet(true);

//       // 2. The proper TonConnect Auth Flow
//       if (!isWalletConnected) {
//         try {
//           // A. Fetch payload from your backend
//           const { payload } = await callApi("GET", "user/generate-payload");
          
//           // B. Prepare the connection request with the payload
//           tonConnectUI.setConnectRequestParameters({
//             state: 'ready',
//             value: { tonProof: payload }
//           });

//           // C. If the wallet is already connected but not verified, 
//           // you'd typically handle the 'tonProof' result from the tonConnectUI.onStatusChange
//           console.log("Payload ready for verification:", payload);
//         } catch (err) {
//           console.error("Auth initialization failed", err);
//         }
//       }

//       setWalletAddress(userFriendlyAddress);
//       setButtonText(maskAddress(userFriendlyAddress));
//       setDisconnect(true);
//       setIsWalletConnected(true);
//       setShowWalletModal(false);
//     } else {
//       setError("Please connect to TON Mainnet");
//       setIsMainnet(false);
//       tonConnectUI.disconnect();
//     }
//   };

//   handleWalletConnection();
// }, [userFriendlyAddress, tonConnectUI]);



// useEffect(() => {
//   const unsubscribe = tonConnectUI.onStatusChange(async (wallet) => {
//     if (!wallet) return;

//     // Check if the wallet provided the proof we requested
//     const proof = wallet.connectItems?.tonProof;

//     if (proof && 'proof' in proof) {
//       try {
//         const response = await callApi("POST", "user/verify", {
//           address: wallet.account.address,
//           network: wallet.account.chain,
//           publicKey: wallet.account.publicKey,
//           proof: proof.proof // This contains the signature, payload, and timestamp
//         });

//         if (response.token) {
//           console.log("Authenticated! JWT received.");
//           // Save token to localStorage or state
//         }
//       } catch (err) {
//         console.error("Verification failed", err);
//         tonConnectUI.disconnect(); // Disconnect if backend verification fails
//       }
//     }
//   });

//   return () => unsubscribe(); // Cleanup listener on unmount
// }, [tonConnectUI]);






  const filteredPortfolio = useMemo(() => {
    return portfolio.filter(trade => {
      const status = trade.status?.toLowerCase() || 'active';
      return portfolioTab === "Active" ? status === 'active' : status === 'settled';
    });
  }, [portfolio, portfolioTab]);


  // http://localhost:5002/api/v1/prediction/getUser

  const getUser = async () => {
    const resp = await callApi("GET", "/getuser", {}, { "Authorization":`Bearer ${localStorage.getItem("token")}` });
    setUser(resp);

  }



  const triggerHaptic = (style = 'light') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

    const fetchMarkets = useCallback(async (silent = false) => {

      if (!silent) setIsRefreshing(true);
      try {
            const resp = await callApi(
              "GET",
              `/?category=${activeTab}&search=${debouncedSearch}&sortBy=${sortBy}&page=${page}&limit=12`,
              {},
              { initdata }
            );
        setMarkets(resp.markets || []);
        setMeta(resp.meta)
      } catch (err) {
        console.error("Fetch Markets Error:", err);
        setMarkets([]);
      } finally {
        setIsRefreshing(false);
      }
    }, [activeTab, debouncedSearch, initdata, page, sortBy]);

    useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

// useEffect(() => {
//   setPage(1);
// }, [activeTab, sortBy]);



  const fetchPortfolio = useCallback(async () => {
    try {
      const resp = await callApi("GET", `/portfolio`, {}, { "Authorization":`Bearer ${localStorage.getItem("token")}` });
      if (resp) setPortfolio(resp);
    } catch (err) {
      console.error("Portfolio Error:", err);
    }
  }, [initdata,userFriendlyAddress]);

useEffect(() => {
  if(userFriendlyAddress)
  fetchPortfolio();
}, [fetchPortfolio]);

    useEffect(() => {
    getUser();
  }, []);


  const handleConfirmTx = async () => {
    if (!amount || txStatus === 'loading') return;
    triggerHaptic('heavy');
    setTxStatus('loading');

    if (parseFloat(amount) < 1) {
      setError("Minimum Bid Amount is 1$")
      setTxStatus('idle');
      return;
    }

    // if (parseFloat(amount) > userBalance) {
    //   setError("Insufficient balance");
    //   setTxStatus('idle');
    //   return;
    // }

    const payload = {
      marketId: selectedMarket._id,
      amount: parseFloat(amount),
      side: selectedMarket.type === 'binary' ? tradeSide : 'multi',
      optionId: selectedMarket.type === 'multi' ? selectedOptionId : null
    };





    try {
      const resp = await callApi("POST", "/execute", payload, { "Authorization":`Bearer ${localStorage.getItem("token")}` });
      if (resp?.success) {
        setTxStatus('success');
        fetchMarkets(true);
        fetchPortfolio();
      } else {

        setTxStatus('idle');
      }
    } catch (err) {
      console.log("resp", err);
      setError(err?.response?.data?.error || "Transaction failed");
      setTxStatus('idle');
    }
  };

  const handleOpenTrade = (market) => {
    triggerHaptic('light');
    setSelectedMarket(market);
    setTxStatus('idle');
    setTradeSide('yes');
    setSelectedOptionId(market.options?.length > 0 ? market.options[0].id : null);
    setAmount('');
  };

  const currentPrice = useMemo(() => {
    if (!selectedMarket) return 0;
    if (selectedMarket.type === 'binary') return tradeSide === 'yes' ? selectedMarket.yes : selectedMarket.no;
    return selectedMarket.options?.find(o => o.id === selectedOptionId)?.price || 0;
  }, [selectedMarket, tradeSide, selectedOptionId]);

  const potentialReturn = amount ? (parseFloat(amount) / (currentPrice / 100)).toFixed(2) : "0.00";

  const getPercentages = (market) => {

    if (!market) return { yes: 50, no: 50 };
    const total = (market.yesPool || 0) + (market.noPool || 0);
    if (total === 0) return { yes: 50, no: 50 };
    const yes = ((market.yesPool / total) * 100).toFixed(0);
    return { yes, no: 100 - yes };
  };

  const getPercentagesMulti = (market) => {
    if (!market?.options || market.options.length === 0) {
      return { name: "N/A", percentage: 0 };
    }

    // 1. Calculate the total pool sum of all options
    const totalPoolSum = market.options.reduce((sum, opt) => sum + (Number(opt.pool) || 0), 0);

    // 2. Find the option with the highest pool
    const leader = market.options.reduce((prev, current) => {
      return (Number(prev.pool) > Number(current.pool)) ? prev : current;
    });

    // 3. Calculate percentage (handle division by zero)
    const percentage = totalPoolSum > 0
      ? Math.round((Number(leader.pool) / totalPoolSum) * 100)
      : Math.round(100 / market.options.length);

    return {
      name: leader.name,
      percentage: percentage
    };
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden select-none">

      {/* HEADER */}
      {/* <header className="shrink-0 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md z-30 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter leading-none flex items-center gap-1">
              <span className="text-white">NOTY</span>
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">PREDICT</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">MARKETPLACE</span>
          </div>
          <div className="flex items-center gap-2">
            {userFriendlyAddress ? (

              <button onClick={() => { triggerHaptic('light'); setShowPortfolio(!showPortfolio); }}
                className={`p-2 rounded-md border transition-all ${showPortfolio ? 'bg-blue-600 border-blue-500' : 'bg-slate-900 border-slate-800'}`}>
                <Briefcase size={20} className={showPortfolio ? "text-white" : "text-slate-400"} />
              </button>
            ) : ""
            }

            <SearchIcon className='text-blue-400' onClick={()=>{setOpenSearchPopup(true)}} />
            <div
              onClick={() => { triggerHaptic('light'); handleLogin(true); }}
              className="flex items-center gap-3 px-4 py-2 rounded-md border border-slate-800 cursor-pointer active:scale-95 transition-all hover:border-blue-500/50"
            >
          
              {userFriendlyAddress ? (
                <>
                  <Wallet size={16} className="text-blue-400" />
                  <span className="text-sm font-mono font-bold text-blue-400">
                    ${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </>
              ) : (
                <>
                  <LogIn size={16} className="text-blue-400" />
                  <span className="text-sm font-bold text-blue-400 uppercase tracking-tighter">
                    Connect
                  </span>
                 
                </>
              )}
            </div>

          </div>
        </div>

      </header> */}
     <Header 
  userFriendlyAddress={userFriendlyAddress}
  userBalance={userBalance}
  showPortfolio={showPortfolio}
  setShowPortfolio={setShowPortfolio}
  handleLogin={handleLogin}
  setOpenSearchPopup={setOpenSearchPopup}
  triggerHaptic={triggerHaptic}
/>

    <SearchPopup 
    isOpen={openSearchPopup} 
    onClose={() => setOpenSearchPopup(false)}
    onSearchSubmit={(val) => {
      setSearchQuery(val);
      setIsRefreshing(true);
    }} 
    />
{/*        
    <WalletModal
      isOpen={showWalletModal} 
      onClose={() => setShowWalletModal(false)} 
      onSelect={handleWalletSelect} 
    /> */}
    {/* <WalletModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)} 
        onSelect={handleWalletSelect} 
      /> */}

      <WalletModal 
        userBalance={userBalance}
        isOpen={showWalletModal} 
        handleDisconnect={handleDisconnect}
        onClose={() => setShowWalletModal(false)} 
      />


      {!showPortfolio ? (
        <>
    {/* 
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 pr-4">
          <Filter size={16} className="text-slate-500 mr-2 shrink-0" />
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { triggerHaptic('light'); setActiveTab(cat); setSortBy(""); setSearchQuery(""); }}
              className={`px-5 py-2 rounded-xl text-xs font-bold border shrink-0 transition-all ${activeTab === cat ? "bg-white text-black border-white" : "bg-slate-900 text-slate-400 border-slate-800"}`}>
              {cat}
            </button>
          ))}
        </div>

   
        <div className="relative shrink-0">
          <button 
            onClick={() => { triggerHaptic('light'); setShowSortMenu(!showSortMenu); }}
            className={`p-2.5 rounded-xl border transition-all ${showSortMenu ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"}`}
          >
            <SlidersHorizontal size={18} />
          </button>

          {showSortMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)} />
              <div className="absolute text-black right-0 mt-3 w-44 bg-slate-300 border border-slate-800 rounded-2xl shadow-2xl z-40 py-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 pb-2 mb-1 border-b border-slate-800">
                  <span className="text-[10px] font-black  uppercase tracking-widest">Filter By</span>
                </div>
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt}
                    onClick={() => { triggerHaptic('medium'); setSortBy(opt); setShowSortMenu(false); setActiveTab("All") }}
                    className={`w-full text-black text-left px-4 py-2.5 text-xs font-bold transition-colors ${sortBy === opt ? "text-white bg-slate-800" : "text-black hover:bg-slate-800 hover:text-white"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </nav> */}

    <CategoryNav
  CATEGORIES={CATEGORIES}
  SORT_OPTIONS={SORT_OPTIONS}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  sortBy={sortBy}
  setSortBy={setSortBy}
  showSortMenu={showSortMenu}
  setShowSortMenu={setShowSortMenu}
  triggerHaptic={triggerHaptic}
/>

    <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950 custom-scrollbar">
  <div className="max-w-7xl mx-auto space-y-5 pb-10">
    
    {isRefreshing ? (
      /* 1. LOADING STATE */
      <div className="py-20 flex justify-center">
        <RotateCcw className="text-blue-500 animate-spin" size={40} />
      </div>
    ) : markets.length > 0 ? (
      /* 2. GRID CONTAINER - Outside the .map() */
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-start">
//         {markets.map((market) => {
//           const percs = market.type === "multi" ? getPercentagesMulti(market) : getPercentages(market);
          
//           const totalPoolSum = market.type === 'multi'
//             ? (market.options?.reduce((sum, opt) => sum + (Number(opt.pool) || 0), 0) || 0)
//             : ((Number(market.yesPool) || 0) + (Number(market.noPool) || 0));

//           const displayVolume = market.totalVolume || totalPoolSum;
//           const displayTrades = market.totalTrades || 0;

//           const sortedOptions = market.type === 'multi'
//             ? [...(market.options || [])].sort((a, b) => b.pool - a.pool)
//             : [];

//           return (
//             <div
//               key={market._id}
//               className="bg-slate-900 border border-slate-800 rounded-[1.5rem] p-6 cursor-pointer hover:border-slate-600 hover:bg-slate-800/80 transition-all duration-300 shadow-xl flex flex-col h-full"
//               onClick={(e) => {
//                 if(market.status==="resolved") return;
//                 if (e.target.closest('.expand-toggle')) return;
//                 handleOpenTrade(market);
//               }}
//             >
//               {/* Header: Category & Timer */}
//               <div className="flex justify-between items-center mb-5">
//                 <span className="text-[11px] font-bold text-blue-400 uppercase px-3 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20 tracking-wider">
//                   {market.category}
//                 </span>
//                 <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
//                   {
//                     market.status === "resolved"? "Ended": <CountdownTimer targetDate={market.expiresAt}  />
//                   }
                 
//                 </div>
//               </div>

//               {/* Question with Image */}
//               <div className="flex gap-4 mb-5">
//                 {market.imageUrl && (
//                   <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
//                     <img
//                       src={market.imageUrl}
//                       alt=""
//                       className="w-full h-full object-cover"
//                       onError={(e) => e.target.style.display = 'none'}
//                     />
//                   </div>
//                 )}
//                 <h3 className={`text-lg font-bold text-slate-100 leading-snug tracking-tight ${market.imageUrl ? 'pt-1' : ''}`}>
//                   {market.question}
//                 </h3>
//               </div>

//               {/* Market Stats */}
//               <div className="flex items-center justify-between mb-6 pb-5 border-b border-slate-800">
//                 <div className="flex flex-col gap-1 flex-1">
//                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Volume</span>
//                   <span className="text-[12px] font-bold text-slate-200">
//                     ${displayVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
//                   </span>
//                 </div>
//                 <div className="w-[1px] h-8 bg-slate-800" />
//                 <div className="flex flex-col gap-1 flex-1 text-center">
//                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trades</span>
//                   <span className="text-[12px] font-bold text-slate-200">
//                     {displayTrades.toLocaleString()}
//                   </span>
//                 </div>
//                 <div className="w-[1px] h-8 bg-slate-800" />
//                 <div className="flex flex-col gap-1 flex-1 text-right">
//                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
//                     {
//                     market.status === "resolved"? "Result": "Chance"
//                     }
//                     </span>
//                    <span className="text-[12px] font-bold text-slate-200">
//   {market.status === "resolved" ? (
//     <span className="text-green-400 uppercase tracking-wider">
//       {/* Show the winning side name/ID */}
//       {market.type === "binary" ? market.winningSide : market.winningOptionId}
//     </span>
//   ) : (
//     /* Active State: Show Percentage Chance */
//     `${market.type === "binary" ? `Yes | ${percs.yes}%` : `${percs.percentage}%`}`
//   )}
// </span>


                  

//                 </div>
//               </div>

//               {/* Action Area: Buttons Pushed to Bottom */}
//               <div className="mt-auto">
//                 {market.type === 'binary' ? (
//                   <div className="grid grid-cols-2 gap-3 px-2">
//                     <button className="flex items-center justify-center gap-2 rounded-xl bg-[#539365] py-2 px-6 transition-all active:scale-95 shadow-lg shadow-black/20">
//                       <span className="text-lg font-bold text-[#E2E8F0]">Yes</span>
//                       <span className="text-lg font-bold text-white">{market.yes}¢</span>
//                     </button>
//                     <button className="flex items-center justify-center gap-2 rounded-xl bg-[#a84444] py-2 px-6 transition-all active:scale-95 shadow-lg shadow-black/20">
//                       <span className="text-lg font-bold text-[#E2E8F0]">No</span>
//                       <span className="text-lg font-bold text-white">{market.no}¢</span>
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {(() => {
//                       const colors = ['bg-[#539365]', 'bg-[#2D333B]', 'bg-[#4466a8]', 'bg-[#8c44a8]'];
//                       const isExpanded = expandedMarkets[market._id];
//                       const visibleOptions = isExpanded ? sortedOptions : sortedOptions.slice(0, 1);

//                       return (
//                         <>
//                           {visibleOptions.map((opt, index) => {
//                             const optPerc = totalPoolSum > 0
//                               ? ((opt.pool / totalPoolSum) * 100).toFixed(0)
//                               : (100 / sortedOptions.length).toFixed(0);
//                             const bgColor = colors[index % colors.length];

//                             return (
//                               <div
//                                 key={opt.id}
//                                 className={`relative overflow-hidden ${bgColor} p-3 rounded-xl transition-all duration-300 active:scale-[0.98] shadow-lg shadow-black/20`}
//                               >
//                                 <div className="flex justify-between items-center relative z-10">
//                                   <span className="text-sm font-bold text-white">{opt.name}</span>
//                                   <div className="flex items-center gap-3">
//                                     <span className="text-sm font-black text-white">{opt.price}¢</span>
//                                     <span className="text-[10px] text-white font-mono font-black px-1.5 py-0.5 rounded bg-black/20">
//                                       {optPerc}%
//                                     </span>
//                                   </div>
//                                 </div>
//                                 <div className="absolute left-0 top-0 bottom-0 bg-white/10" style={{ width: `${optPerc}%` }} />
//                               </div>
//                             );
//                           })}
//                           {sortedOptions.length > 1 && (
//                             <div className="expand-toggle flex items-center justify-center pt-1">
//                               <button
//                                 className="w-full py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-400 transition-all"
//                                 onClick={(e) => toggleExpand(market._id, e)}
//                               >
//                                 {isExpanded ? "Show Less" : `+ ${sortedOptions.length - 1} More Options`}
//                               </button>
//                             </div>
//                           )}
//                         </>
//                       );
//                     })()}
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
<MarketsGrid
  markets={markets}
  handleOpenTrade={handleOpenTrade}
  getPercentages={getPercentages}
  getPercentagesMulti={getPercentagesMulti}
  expandedMarkets={expandedMarkets}
  toggleExpand={toggleExpand}
  page={page}
  setPage={setPage}
  meta={meta}
  triggerHaptic={triggerHaptic}
  activeTab={activeTab}
  setActiveTab={setActiveTab}
  setSortBy={setSortBy}
/>
    ) : (
      /* 3. EMPTY STATE - Outside the Grid for Proper Centering */

  <EmptyState activeTab={activeTab} setActiveTab={setActiveTab} />

    )}
  </div>
  {/* PAGINATION CONTROLS */}
{/* {meta.totalPages > 1 && (
  <div className="flex items-center justify-center gap-2 pb-40">
    <button
      disabled={page === 1}
      onClick={() => { triggerHaptic('light');
  setActiveTab(activeTab);
  setSortBy("");
  setPage(1); triggerHaptic('light'); }}
      className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
    >
      <ChevronLeft size={20} />
    </button>

    <div className="flex items-center gap-1 mx-2">
      {[...Array(meta.totalPages)].map((_, i) => {
        const pageNum = i + 1;
        // Logic to show only a few pages if there are many
        if (meta.totalPages > 5 && Math.abs(pageNum - page) > 1 && pageNum !== 1 && pageNum !== meta.totalPages) {
           if (pageNum === 2 || pageNum === meta.totalPages - 1) return <span key={pageNum} className="text-slate-600">...</span>;
           return null;
        }

        return (
          <button
            key={pageNum}
            onClick={() => { setPage(pageNum); triggerHaptic('light'); }}
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
      onClick={() => { setPage(p => p + 1); triggerHaptic('light'); }}
      className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
    >
      <ChevronRight size={20} />
    </button>
  </div>
)} */}
</main>
        </>
      ) : (
        /* PORTFOLIO VIEW */
        // <main className="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar">
        //   <div className="max-w-3xl mx-auto p-4 md:p-8 pb-48 space-y-6">

        //     {/* Portfolio Header & Toggle */}
        //     <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md py-4 z-20 space-y-6">
        //       {/* TOP ROW: TITLE & CLOSE */}
        //       <div className="flex items-center justify-between">
        //         <div className="flex flex-col">
        //           <h2 className="text-2xl font-black text-white">Your Trades</h2>
        //           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manage Positions</span>
        //         </div>
        //         <button
        //           onClick={() => { triggerHaptic('light'); setShowPortfolio(false); }}
        //           className="p-2.5 bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 active:scale-95 transition-all"
        //         >
        //           <X size={20} />
        //         </button>
        //       </div>

        //       {/* NEW STATS ROW */}
        //       <div className="grid grid-cols-[1.2fr_1.2fr_0.6fr] gap-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-4">
        //         {/* In Trade */}
        //         <div className="flex flex-col items-center border-r border-slate-800">
        //           <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-1">In Trade</span>
        //           <span className="text-sm font-bold text-blue-400 font-mono">
        //             ${portfolio.filter(t => t.status === 'active').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
        //           </span>
        //         </div>

        //         {(() => {
        //           // 1. Filter only settled trades (Resolved markets)
        //           const settledTrades = portfolio.filter(t => t.status === 'settled');

        //           // 2. Sum up payouts and amounts for these trades
        //           const totalPayout = settledTrades.reduce((sum, t) => sum + (Number(t.payout) || 0), 0);

        //           const netProfit = totalPayout;
        //           const isPositive = netProfit >= 0;

        //           return (
        //             <div className="flex flex-col items-center border-r border-slate-800">
        //               <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-1">
        //                 All Time
        //               </span>
        //               <span className={`text-sm font-bold font-mono ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
        //                 {netProfit > 0 ? isPositive ? '+' : '-' : ""} ${netProfit.toFixed(2)}
        //               </span>
        //             </div>
        //           );
        //         })()}
        //         {/* Total Trades Count */}
        //         <div className="flex flex-col items-center">
        //           <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-1">Trades</span>
        //           <span className="text-sm font-bold text-slate-200 font-mono">
        //             {portfolio.length}
        //           </span>
        //         </div>
        //       </div>

        //       {/* CATEGORY TABS (Active / Settled) */}
        //       <div className="flex p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
        //         {["Active", "Settled"].map((tab) => (
        //           <button
        //             key={tab}
        //             onClick={() => { triggerHaptic('light'); setPortfolioTab(tab); }}
        //             className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${portfolioTab === tab
        //               ? "bg-white/80 text-black shadow-lg shadow-blue-900/40"
        //               : "text-white"
        //               }`}
        //           >
        //             {tab} {portfolioTab === tab && <span className="ml-1 opacity-60">({filteredPortfolio.length})</span>}
        //           </button>
        //         ))}
        //       </div>
        //     </div>

        //     {/* List of Trades */}
        //     <div className="grid grid-cols-1 gap-4">
        //       {filteredPortfolio.length > 0 ? (
        //         filteredPortfolio.map((trade) => {
        //           const isBinary = trade.marketId?.type === 'binary';
        //           const isWin = trade.payout > 0;
        //           const payoutAmount = trade.shares || (Number(trade.amount) / (Number(trade.avgPrice) / 100));
        //           const userSelection = isBinary
        //             ? (trade.side || "N/A")
        //             : (trade.marketId?.options?.find(opt => opt.id === trade.optionId)?.name || "Option " + trade.optionId);

        //           return (
        //             <div key={trade._id || Math.random()} className="group relative bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden transition-all duration-300">
        //               {/* Top Accent Bar */}
        //               <div className={`h-1 w-full ${portfolioTab === "Active" ? 'bg-blue-500/40' : (isWin ? 'bg-green-500/60' : 'bg-red-900/40')}`} />

        //               <div className="p-5 flex flex-col md:flex-row gap-6">
        //                 <div className="flex-1 space-y-3">
        //                   <div className="flex flex-wrap items-center gap-2">
        //                     {/* Market Type Badge */}
        //                     <span className="text-[9px] font-black px-2 py-0.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-600 uppercase tracking-tighter">
        //                       {isBinary ? "BINARY" : "MULTI"}
        //                     </span>

        //                     {portfolioTab === "Active" && (
        //                       <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase flex border-slate-700`}>
        //                         <div className='mr-1 text-green-600 blink'>
        //                           Live:
        //                         </div>
        //                         <div>
        //                           <CountdownTimer  targetDate={trade.marketId.expiresAt} />
        //                         </div>

        //                       </span>
        //                     )}


        //                     {portfolioTab === "Settled" && (
        //                       <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase ${isWin ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
        //                         }`}>
        //                         {isWin ? 'Won' : 'Lost'}
        //                       </span>
        //                     )}
        //                   </div>
        //                   <div className='flex'>
        //                     {trade.marketId && (
        //                       <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border border-slate-800 bg-slate-950 shadow-inner mr-2">
        //                         <img
        //                           src={trade.marketId?.imageUrl}
        //                           alt=""
        //                           className="w-full h-full object-cover"
        //                           onError={(e) => e.target.style.display = 'none'}
        //                         />
        //                       </div>
        //                     )}

        //                     <div className=' flex flex-col'>
        //                   <div className="text-sm font-bold text-slate-400 leading-snug">
                                  
        //                   {trade.marketId?.question || "Market Prediction"}
        //                   </div>
        //                   <div className="text-sm font-bold text-slate-400 leading-snug mt-2">
        //                    ✔ {String(userSelection).toUpperCase()}
        //                   </div>
        //                   </div>
        //                   </div>
        //                 </div>

        //                 {/* Financials Box - 50/50 Split */}
        //                 <div className="grid grid-cols-2 w-full md:w-64 bg-slate-950/50 border border-slate-800/50 rounded-md p-3 divide-x divide-slate-800">
        //                   <div className="flex flex-col items-center justify-center">
        //                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1">Stake</p>
        //                     <p className="text-xs font-mono font-bold text-slate-300">
        //                       ${Number(trade.amount).toFixed(2)}
        //                     </p>
        //                   </div>

        //                   <div className="flex flex-col items-center justify-center">
        //                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter mb-1">
        //                       {portfolioTab === "Active" ? (<span className=''>Est. Payout</span>) : isWin ? "Win" : "Loss"}
        //                     </p>
        //                     <div className="flex items-center justify-center gap-1">
        //                       <span className={`text-sm font-mono font-black ${portfolioTab === "Active" ? "text-amber-400" : (isWin ? "text-green-400" : "text-red-500")
        //                         }`}>

        //                         {portfolioTab === "Settled" ? (
        //                           !isWin ? `- $${Number(trade.amount).toFixed(2)}` : `+ $${payoutAmount.toFixed(2)}`
        //                         ) : `$${payoutAmount.toFixed(2)}`}
        //                       </span>
        //                     </div>
        //                   </div>
        //                 </div>
        //               </div>
        //             </div>
        //           );
        //         })
        //       ) : (
        //         <div className="py-24 text-center space-y-4">
        //           <History size={48} className="mx-auto text-slate-800" />
        //           <p className="text-slate-500 font-bold">No {portfolioTab.toLowerCase()} trades found</p>
        //         </div>
        //       )}
        //     </div>
        //   </div>
        // </main>
        <PortfolioView
    portfolio={portfolio}
    portfolioTab={portfolioTab}
    setPortfolioTab={setPortfolioTab}
    filteredPortfolio={filteredPortfolio}
    setShowPortfolio={setShowPortfolio}
    triggerHaptic={triggerHaptic}
  />
      )}





      {/* ERROR POPUP */}
      {error && (
        <div className="fixed top-6 left-4 right-4 z-[100] animate-in slide-in-from-top duration-300 pointer-events-none flex justify-center">
          <div className="bg-slate-900 border-2 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)] rounded-md p-4 flex items-center gap-4 w-full max-w-md pointer-events-auto">
            <div className="shrink-0 w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 border border-rose-500/20">
              <X size={20} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Transaction Error</p>
              <p className="text-sm font-bold text-slate-200">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}



      {/* BOTTOM SHEET */}
    {selectedMarket && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
//     {/* Background Overlay Click to Close */}
//     <div className="absolute inset-0" onClick={() => setSelectedMarket(null)} />

//     {/* Modal Container */}
//     <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300">
      
//       {txStatus === 'success' ? (
//         <div className="p-12 text-center space-y-6">
//           <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 border border-green-500/20">
//             <PartyPopper size={40} />
//           </div>
//           <div className="space-y-2">
//             <h2 className="text-2xl font-black text-white">Trade Confirmed</h2>
//             <p className="text-slate-400 text-sm">Your position has been successfully placed.</p>
//           </div>
//           <button 
//             onClick={() => setSelectedMarket(null)} 
//             className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold text-white transition-all shadow-lg shadow-blue-600/20"
//           >
//             Return to Markets
//           </button>
//         </div>
//       ) : (
//         <>
//           {/* Header */}
//           <div className="px-8 py-5 flex justify-between items-center border-b border-slate-800/50 bg-slate-900/50 sticky top-0 z-20">
//             <div className="flex flex-col">
//               <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Execution Terminal</span>
//               <h2 className="text-sm font-bold text-slate-300">PREDICT EVENT</h2>
//             </div>
//             <button 
//               onClick={() => setSelectedMarket(null)} 
//               className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
//             >
//               <X size={20} />
//             </button>
//           </div>

//           <div className="px-8 py-6 space-y-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
//             {/* Market Question Section */}
//             <div className="flex gap-5">
//               {selectedMarket.imageUrl && (
//                 <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-2xl">
//                   <img
//                     src={selectedMarket.imageUrl}
//                     alt=""
//                     className="w-full h-full object-cover"
//                     onError={(e) => e.target.style.display = 'none'}
//                   />
//                 </div>
//               )}
//               <h3 className="text-xl font-bold text-white leading-tight tracking-tight pt-1">
//                 {selectedMarket.question}
//               </h3>
//             </div>

//             {/* Selection Area */}
//             {selectedMarket.type === 'binary' ? (
//               <div className="grid grid-cols-2 gap-4">
//                 <button 
//                   onClick={() => setTradeSide('yes')}
//                   className={`relative flex flex-col items-center py-4 rounded-2xl border-2 transition-all ${
//                     tradeSide === 'yes' 
//                       ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
//                       : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
//                   }`}
//                 >
//                   <span className={`text-[10px] font-black mb-1 ${tradeSide === 'yes' ? 'text-emerald-400' : 'text-slate-500'}`}>YES {getPercentages(selectedMarket).yes}%</span>
//                   <span className={`text-xl font-black ${tradeSide === 'yes' ? 'text-white' : 'text-slate-400'}`}>{selectedMarket.yes}¢</span>
//                 </button>

//                 <button 
//                   onClick={() => setTradeSide('no')}
//                   className={`relative flex flex-col items-center py-4 rounded-2xl border-2 transition-all ${
//                     tradeSide === 'no' 
//                       ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
//                       : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
//                   }`}
//                 >
//                   <span className={`text-[10px] font-black mb-1 ${tradeSide === 'no' ? 'text-rose-400' : 'text-slate-500'}`}>NO {getPercentages(selectedMarket).no}%</span>
//                   <span className={`text-xl font-black ${tradeSide === 'no' ? 'text-white' : 'text-slate-400'}`}>{selectedMarket.no}¢</span>
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-2.5">
//                 {(() => {
//                   const colors = ['bg-[#539365]', 'bg-[#2D333B]', 'bg-[#4466a8]', 'bg-[#8c44a8]'];
//                   const mTotal = selectedMarket.options.reduce((sum, o) => sum + (Number(o.pool) || 0), 0) || 1;

//                   return selectedMarket.options?.map((opt, index) => {
//                     const oPerc = ((Number(opt.pool) || 0) / mTotal * 100).toFixed(0);
//                     const isSelected = selectedOptionId === opt.id;
//                     const bgColor = colors[index % colors.length];

//                     return (
//                       <button 
//                         key={opt.id} 
//                         onClick={() => setSelectedOptionId(opt.id)}
//                         className={`w-full relative overflow-hidden flex justify-between items-center p-4 rounded-2xl border-2 transition-all duration-200 ${
//                           isSelected ? 'border-blue-500 ring-4 ring-blue-500/10 scale-[1.01]' : `border-transparent ${bgColor} opacity-80 hover:opacity-100`
//                         }`}
//                       >
//                         <div className="flex items-center gap-3 relative z-10">
//                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-white border-white' : 'border-white/40'}`}>
//                             {isSelected && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
//                           </div>
//                           <span className="text-sm font-bold text-white">{opt.name}</span>
//                         </div>
//                         <div className="flex items-center gap-4 relative z-10">
//                           <span className="text-sm font-black text-white">{opt.price}¢</span>
//                           <span className="text-[10px] text-white font-black px-2 py-1 rounded-lg bg-black/30 backdrop-blur-sm">
//                             {oPerc}%
//                           </span>
//                         </div>
//                         <div className="absolute left-0 top-0 bottom-0 bg-white/5 transition-all duration-500" style={{ width: `${oPerc}%` }} />
//                       </button>
//                     );
//                   });
//                 })()}
//               </div>
//             )}

//             {/* Input Section */}
//             <div className="space-y-4 pt-2">
//               <div className="relative">
//                 <input 
//                   type="number" 
//                   value={amount} 
//                   onChange={(e) => setAmount(e.target.value)} 
//                   placeholder="Enter amount..." 
//                   className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl py-3 px-6 text-md font-mono text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" 
//                 />
//                 <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-600">$</span>
//               </div>

//               <div className="bg-slate-950/50 rounded-2xl p-5 border border-slate-800/50 flex justify-between items-center">
//                 <div className="flex flex-col">
//                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Potential Return</span>
//                   <span className="text-xs text-slate-400">If correct</span>
//                 </div>
//                 <span className="text-2xl font-bold text-emerald-400 font-mono">${potentialReturn}</span>
//               </div>
//             </div>
             
//              {userFriendlyAddress && (
//               <div className='text-center font-mono text-slate-300'>
//                 Avl bal: $ {userBalance}
//               </div>
             
              
//               )}

//             {/* Action Button */}
//             {userFriendlyAddress?(
//             <button 
//               disabled={!amount || txStatus === 'loading'} 
//               onClick={handleConfirmTx} 
//               className="w-full bg-white disabled:bg-slate-800 py-5 rounded-2xl font-black text-base text-black transition-all active:scale-[0.98] shadow-xl hover:bg-slate-100 disabled:text-slate-500"
//             >
//               {txStatus === 'loading' ? (
//                 <div className="flex items-center justify-center gap-3">
//                   <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-900 animate-spin rounded-full" />
//                   <span>Processing...</span>
//                 </div>
//               ) : 'Confirm & Place Trade'}
//             </button>
//             ):(
//               <button 
//               onClick={() => { triggerHaptic('light'); handleLogin(true); }}
//               className="w-full bg-white disabled:bg-slate-800 py-5 rounded-2xl font-black text-base text-black transition-all active:scale-[0.98] shadow-xl hover:bg-slate-100 disabled:text-slate-500"
//             >
//              Connect Wallet
//             </button>
//             )
// }
//           </div>
//         </>
//       )}
//     </div>
//   </div>
<TradeModal
  selectedMarket={selectedMarket}
  setSelectedMarket={setSelectedMarket}
  txStatus={txStatus}
  tradeSide={tradeSide}
  setTradeSide={setTradeSide}
  selectedOptionId={selectedOptionId}
  setSelectedOptionId={setSelectedOptionId}
  amount={amount}
  setAmount={setAmount}
  potentialReturn={potentialReturn}
  handleConfirmTx={handleConfirmTx}
  getPercentages={getPercentages}
  userFriendlyAddress={userFriendlyAddress}
  userBalance={userBalance}
  handleLogin={handleLogin}
  triggerHaptic={triggerHaptic}
/>
)}
    </div>
  );
};

export default Home;