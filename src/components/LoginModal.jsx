// src/components/LoginModal.jsx
import React from 'react';

const NETWORKS = [
  { id: 'evm', name: 'MetaMask', icon: '🦊', color: 'bg-orange-500/20' },
  { id: 'solana', name: 'Phantom', icon: '👻', color: 'bg-purple-500/20' },
  { id: 'ton', name: 'Tonkeeper', icon: '💎', color: 'bg-blue-500/20' },
];

export default function LoginModal({ isOpen, onClose, onLogin }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1e293b] border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
        
        <h2 className="text-2xl font-bold text-white text-center mb-2">Connect Wallet</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">Select a network to access the prediction market.</p>

        <div className="space-y-4">
          {NETWORKS.map((net) => (
            <button
              key={net.id}
              onClick={() => onLogin(net.id)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border border-slate-700 hover:border-blue-500 transition-all group ${net.color}`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{net.icon}</span>
                <span className="text-white font-medium text-lg">{net.name}</span>
              </div>
              <span className="text-slate-500 group-hover:text-blue-400">→</span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-[10px] text-slate-500 text-center uppercase tracking-widest">
          Secure Multi-Chain Auth v1.0
        </p>
      </div>
    </div>
  );
}