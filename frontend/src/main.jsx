import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import ShopContextProvider from './context/ShopContext.jsx';
import ScrollToTop from "./ScrollToTop";

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ScrollToTop />
    <ShopContextProvider>
      <App />
    </ShopContextProvider>
  </BrowserRouter>
);