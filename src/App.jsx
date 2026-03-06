import Home from "./pages/Home"

function App() {
  return (
    <Home />
  )

}
export default App

// src/App.jsx

// import { useState } from 'react';
// import { Outlet } from "react-router-dom";
// import LoginModal from './components/LoginModal';

// function App() {
//   const [isModalOpen, setModalOpen] = useState(false);
//   const [user, setUser] = useState(null);

//   const handleLogin = async (chain) => {
//     console.log(`Starting login for: ${chain}`);
//     // Here is where you call your authEVM(), authSolana(), etc.
//     // After success:
//     // setModalOpen(false);
//     // setUser(result.user);
//   };

//   return (
//     <div className="min-h-screen bg-[#0f172a] text-white">
//       <header className="flex justify-between items-center p-6 border-b border-slate-800 bg-[#0f172a]/50 sticky top-0 backdrop-blur-md">
//         <div className="text-xl font-bold tracking-tighter text-blue-400">PREDICT.IO</div>
        
//         {user ? (
//           <div className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700 text-sm">
//             {user.address.slice(0, 6)}...{user.address.slice(-4)}
//           </div>
//         ) : (
//           <button 
//             onClick={() => setModalOpen(true)}
//             className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-bold transition-all"
//           >
//             Connect Wallet
//           </button>
//         )}
//       </header>

//       {/* <main className="p-6">
//         <Outlet />
//       </main> */}

//       <LoginModal 
//         isOpen={isModalOpen} 
//         onClose={() => setModalOpen(false)} 
//         onLogin={handleLogin} 
//       />
//     </div>
//   );
// }

// export default App