import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import {TonConnectUIProvider } from '@tonconnect/ui-react';
import Home from "./pages/Home";
import App from './App';
import { AuthContextProvider } from "./context/AuthContext";
import { UserProvider } from "./context/userContext";
import "./App.css";
import "./fire.scss"; 
import './index.css';
import './config/walletConnect'
import NotFound from './pages/NotFound';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/",
        element: <App />, 
      },
    ],
  }
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <TonConnectUIProvider manifestUrl="https://naughtycoin.fun/tonconnect-manifest.json">
    <AuthContextProvider>
      <UserProvider> {/* ✅ Add UserProvider here */}
        <React.StrictMode>
          <RouterProvider router={router} />
        </React.StrictMode>
      </UserProvider>
    </AuthContextProvider>
  </TonConnectUIProvider>
);
