// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white px-4">
      {/* Visual Element: Large "404" or an Illustration */}
      <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse">
        404
      </h1>
      
      <div className="text-center mt-4">
        <h2 className="text-3xl font-bold mb-2">Lost in the Universe?</h2>
        <p className="text-slate-400 max-w-md mb-8">
          The market you're looking for has either expired, settled, or never existed in this dimension.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/20"
          >
            Back to Markets
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-semibold transition-all"
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}