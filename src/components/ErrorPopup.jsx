import React from "react";
import { X } from "lucide-react";

const ErrorPopup = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="fixed top-6 left-4 right-4 z-[100] animate-in slide-in-from-top duration-300 pointer-events-none flex justify-center">
      <div className="bg-slate-900 border-2 border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)] rounded-md p-4 flex items-center gap-4 w-full max-w-md pointer-events-auto">
        <div className="shrink-0 w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500 border border-rose-500/20">
          <X size={20} />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">
            Transaction Error
          </p>
          <p className="text-sm font-bold text-slate-200">{error}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default ErrorPopup;