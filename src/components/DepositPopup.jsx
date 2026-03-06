import React, { useState } from 'react';
import { X, Copy, Check, AlertTriangle, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react'; // npm install qrcode.react

const DepositQRModal = ({ isOpen, onClose, walletAddress }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0F1115] shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 p-6 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <QrCode size={20} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Deposit USDT  (TON)</h2>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full bg-white/5 p-2 text-gray-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 pt-4">
          {/* CRITICAL WARNING BANNER */}
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
            <AlertTriangle size={20} className="shrink-0 text-amber-500 mt-0.5" />
            <p className="text-xs font-semibold text-amber-200 leading-snug">
              Deposit <span className="text-white decoration-amber-500">USDT on TON network only</span>. 
              Sending via other chains will result in permanent loss.
            </p>
          </div>

          {/* QR CODE CONTAINER */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-[2rem] bg-white p-5 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
              <QRCodeSVG 
                value={walletAddress} 
                size={180} 
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
          
          {/* ADDRESS DISPLAY */}
          <div className="space-y-2">
            <span className="block text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Your TON Wallet Address
            </span>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-950 px-4 py-4 border border-white/5 group transition-all hover:border-blue-500/30">
              <span className="truncate font-mono text-sm text-slate-300 select-all">
                {walletAddress}
              </span>
              <button 
                onClick={handleCopy} 
                className="shrink-0 p-2 rounded-lg bg-white/5 text-blue-400 hover:bg-blue-500 hover:text-white transition-all active:scale-90"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          {/* FOOTER INFO */}
          <p className="mt-6 text-center text-[11px] text-slate-500 font-medium">
            Scan QR or copy address to transfer funds
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepositQRModal;