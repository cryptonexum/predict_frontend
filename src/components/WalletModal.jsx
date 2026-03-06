import React, { useState } from 'react';
import { Wallet, X } from 'lucide-react';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import DepositPopup from './DepositPopup';

// Destructure handleDisconnect from props
export default function TonWalletModal({ isOpen, onClose, userBalance, handleDisconnect }) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  
  const userFriendlyAddress = useTonAddress();
  const isWalletConnected = !!userFriendlyAddress;

  if (!isOpen) return null;

  const triggerHaptic = (style) => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-sm border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900">
        <div className="p-8 text-center bg-slate-900">
          <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <Wallet size={36} className="text-blue-400" />
          </div>

          {isWalletConnected ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Wallet Connected</h2>
                <p className="text-sm text-slate-500 mt-1 font-mono break-all px-4">
                  {userFriendlyAddress.slice(0, 6)}...{userFriendlyAddress.slice(-6)}
                </p>
              </div>

              <div className="rounded-2xl p-5 border border-slate-800 bg-slate-900/50">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Wallet Balance</span>
                <span className="text-2xl font-black text-blue-400 font-mono">{userBalance.toLocaleString()} USDT</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { triggerHaptic('medium'); setIsDepositModalOpen(true); }}
                  className="cursor-pointer w-full py-4 text-xs font-bold uppercase tracking-[0.15em] bg-white hover:bg-slate-300 text-black rounded-xl transition-all shadow-lg active:scale-[0.98]"
                >
                  Deposit USDT 
                </button>
                <p className='font-mono text-[10px]'>Please deposit or swap for USDT.Funds stay in your wallet—you maintain full control of your assets at all times.</p>

                <button
                  onClick={handleDisconnect} // This now calls the function from Home.jsx
                  className="cursor-pointer w-full py-4 text-xs font-black text-rose-900 hover:text-white uppercase tracking-widest hover:bg-rose-800 rounded-xl transition-all"
                >
                  Disconnect Wallet
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center">
  <div className="text-center">
    <h2 className="text-xl font-bold text-white">Get Started With Your TON Wallet</h2>
    <p className="text-sm text-slate-400 mt-2 px-4 leading-relaxed">
      Connect your wallet to deposit USDT and start trading.
    </p>
  </div>

  <div className="ton-connect-wrapper scale-110 py-2">
    <TonConnectButton />
  </div>

  {/* Supported Wallets Section */}
  <div className="pt-2 text-[10px]">
    Supports TON chain wallet
    <p className=" text-slate-500 font-bold uppercase tracking-[0.2em] mb-3">
     TONKEEPER,MYTONWALLET,TELEGRAM-WALLET, and MORE
    </p>
  </div>
</div>
          )}
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {isDepositModalOpen && (
        <DepositPopup
          isOpen={isDepositModalOpen}
          walletAddress={userFriendlyAddress}
          onClose={() => setIsDepositModalOpen(false)}
        />
      )}
    </div>
  );
}