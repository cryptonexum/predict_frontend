import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { X, RotateCcw } from "lucide-react";
import callApi from "../helper/ApiHelper";
import { useUser } from "../context/userContext";
import {
  useTonAddress,
  useTonConnectUI,
  CHAIN,
  THEME,
} from "@tonconnect/ui-react";
import SearchPopup from "../components/SearchPopup";
import WalletModal from "../components/WalletModal";
import Header from "../components/Header";
import MarketsGrid from "../components/MarketGrid";
import PortfolioView from "../components/PortfolioView";
import TradeModal from "../components/TradeModal";
import CategoryNav from "../components/CategoryNav";
import EmptyState from "../components/EmptyState";
import ErrorPopup from "../components/ErrorPopup";

const CATEGORIES = [
  "All",
  "Politics",
  "Crypto",
  "Sports",
  "Science",
  "Entertainment",
  "Tech",
  "Bitcoin",
  "Other",
];

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

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

  const [selectedMarket, setSelectedMarket] = useState(null);
  const [amount, setAmount] = useState("");
  const [tradeSide, setTradeSide] = useState("yes");
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [txStatus, setTxStatus] = useState("idle");
  const [portfolioTab, setPortfolioTab] = useState("Active");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  const [openSearchPopup, setOpenSearchPopup] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();
  const [expandedMarkets, setExpandedMarkets] = useState({});
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState("Trending");
  const SORT_OPTIONS = [
    "Trending",
    "New",
    "Ends Soon",
    "Ended",
    "Yes/No",
    "MultiChoice",
  ];
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1, hasMore: false });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, [userFriendlyAddress, initdata]);

  useEffect(() => {
    // 1. Listen for status changes
    const unsubscribe = tonConnectUI.onStatusChange(async (wallet) => {
      if (!wallet) return;
      const chain = tonConnectUI?.account?.chain;
      if (chain != CHAIN.MAINNET) {
        setError("Please Connect with Mainnet");
        return;
      }

      // 2. Check if we have a proof from the wallet
      const tonProof = wallet.connectItems?.tonProof;

      console.log("tonProof", tonProof);

      if (tonProof && "proof" in tonProof) {
        // 3. Send proof to backend for verification
        const proof = tonProof.proof;
        try {
          const body = {
            address: wallet.account.address,
            publicKey: wallet.account.publicKey,
            proof: {
              ...proof,
              state_init: wallet.account.walletStateInit,
            },
          };
          const { token } = await callApi("POST", "/verify", body, {
            "Content-Type": "application/json",
          });
          setToken(token);
          if (token) {
            localStorage.setItem("token", token);
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
    if (!userFriendlyAddress) {
      const { payload } = await callApi("GET", "/generate-payload");
      tonConnectUI.setConnectRequestParameters({
        state: "ready",
        value: { tonProof: payload },
      });
      await tonConnectUI.openModal();
    } else {
      setShowWalletModal(true);
    }
  };

  tonConnectUI.uiOptions = {
    uiPreferences: {
      borderRadius: "s",
      theme: THEME.DARK,
    },
  };

  const handleDisconnect = async () => {
    tonConnectUI.disconnect();
    triggerHaptic("medium");
    setShowWalletModal(false);
    setUserBalance(0);
    setShowPortfolio(false);
    localStorage.removeItem("token");
  };

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedMarkets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    if (localStorage.getItem("address")) {
      setToken(localStorage.getItem("address"));
    }
  }, [userFriendlyAddress, initdata, token]);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // It is better to pass the address as a query param if your API needs it
        const resp = await callApi(
          "GET",
          `/getJettonBalance?address=${userFriendlyAddress}`,
          {},
          { Authorization: `Bearer ${token}` },
        );

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
  }, [userFriendlyAddress, initdata, token]);

  const filteredPortfolio = useMemo(() => {
    return portfolio.filter((trade) => {
      const status = trade.status?.toLowerCase() || "active";
      return portfolioTab === "Active"
        ? status === "active"
        : status === "settled";
    });
  }, [portfolio, portfolioTab]);

  const triggerHaptic = (style = "light") => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const fetchMarkets = useCallback(
    async (silent = false) => {
      if (!silent) setIsRefreshing(true);
      try {
        const resp = await callApi(
          "GET",
          `/?category=${activeTab}&search=${debouncedSearch}&sortBy=${sortBy}&page=${page}&limit=12`,
          {},
          { initdata },
        );
        console.log(">>",resp.markets )
        setMarkets(resp.markets || []);
        setMeta(resp.meta);
      } catch (err) {
        console.error("Fetch Markets Error:", err);
        setMarkets([]);
      } finally {
        setIsRefreshing(false);
      }
    },
    [activeTab, debouncedSearch, initdata, page, sortBy],
  );

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  const fetchPortfolio = useCallback(async () => {
    try {
      const resp = await callApi(
        "GET",
        `/portfolio`,
        {},
        { Authorization: `Bearer ${localStorage.getItem("token")}` },
      );
      if (resp) setPortfolio(resp);
    } catch (err) {
      console.error("Portfolio Error:", err);
    }
  }, [initdata, userFriendlyAddress]);

  useEffect(() => {
    if (userFriendlyAddress) fetchPortfolio();
  }, [fetchPortfolio]);

  const handleConfirmTx = async () => {
    if (!amount || txStatus === "loading") return;
    triggerHaptic("heavy");
    setTxStatus("loading");

    if (parseFloat(amount) < 1) {
      setError("Minimum Bid Amount is 1$");
      setTxStatus("idle");
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
      side: selectedMarket.type === "binary" ? tradeSide : "multi",
      optionId: selectedMarket.type === "multi" ? selectedOptionId : null,
    };

    try {
      const resp = await callApi("POST", "/execute", payload, {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      });
      if (resp?.success) {
        setTxStatus("success");
        fetchMarkets(true);
        fetchPortfolio();
      } else {
        setTxStatus("idle");
      }
    } catch (err) {
      console.log("resp", err);
      setError(err?.response?.data?.error || "Transaction failed");
      setTxStatus("idle");
    }
  };

  const handleOpenTrade = (market,side) => {
    triggerHaptic("light");
    setSelectedMarket(market);
    setTxStatus("idle");
    if(side=="yes" || side=="no"){
      setTradeSide(side);
    }else{
    setSelectedOptionId(side);
    }
  

    setAmount("");
  };

  const currentPrice = useMemo(() => {
    if (!selectedMarket) return 0;
    if (selectedMarket.type === "binary")
      return tradeSide === "yes" ? selectedMarket.yes : selectedMarket.no;
    return (
      selectedMarket.options?.find((o) => o.id === selectedOptionId)?.price || 0
    );
  }, [selectedMarket, tradeSide, selectedOptionId]);

  const potentialReturn = amount
    ? (parseFloat(amount) / (currentPrice / 100)).toFixed(2)
    : "0.00";

const getPercentages = (market) => {
  const yesShares = Number(market.yesShares) || 0;
  const noShares = Number(market.noShares) || 0;

  const totalShares = yesShares + noShares;

  if (totalShares === 0) {
    return { yes: "50.00", no: "50.00" }; // default equal
  }

  const yesChance = ((yesShares / totalShares) * 100).toFixed(2);
  const noChance = ((noShares / totalShares) * 100).toFixed(2);

  return { yes: yesChance, no: noChance };
};
 const getPercentagesMulti = (market) => {
  if (!market?.options?.length) {
    return { name: "N/A", percentage: 0 };
  }

  const options = market.options.map(opt => ({
    ...opt,
    shares: Number(opt.shares) || 0,
  }));

  const totalPoolSum = options.reduce(
    (sum, opt) => sum + opt.shares,
    0
  );

  const leader = options.reduce((max, opt) =>
    opt.shares > max.shares ? opt : max
  );

  let percentage = 0;

  if (totalPoolSum > 0) {
    percentage = (leader.shares / totalPoolSum) * 100;
  } else {
    percentage = 100 / options.length;
  }

  return {
    name: leader.name,
    percentage: parseFloat(percentage.toFixed()),
  };
};
  return (
    <div className="h-screen bg-slate-950 text-slate-100 font-sans flex flex-col overflow-hidden select-none">
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

      <WalletModal
        userBalance={userBalance}
        isOpen={showWalletModal}
        handleDisconnect={handleDisconnect}
        onClose={() => setShowWalletModal(false)}
      />

      {!showPortfolio ? (
        <>
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
                <div className="py-20 flex justify-center">
                  <RotateCcw className="text-blue-500 animate-spin" size={40} />
                </div>
              ) : markets.length > 0 ? (
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
                <EmptyState activeTab={activeTab} setActiveTab={setActiveTab} setSearchQuery={setSearchQuery} setIsRefreshing={setIsRefreshing} setSortBy={setSortBy}  />
              )}
            </div>
          </main>
        </>
      ) : (
        <PortfolioView
          portfolio={portfolio}
          portfolioTab={portfolioTab}
          setPortfolioTab={setPortfolioTab}
          filteredPortfolio={filteredPortfolio}
          setShowPortfolio={setShowPortfolio}
          triggerHaptic={triggerHaptic}
          userFriendlyAddress={userFriendlyAddress}
        />
      )}

      {/* ERROR POPUP */}
      {error && <ErrorPopup error={error} onClose={() => setError(null)} />}

      {selectedMarket && (
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
