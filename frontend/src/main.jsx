import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import SalonContextProvider from './context/SalonContext.jsx';
import ScrollToTop from "./ScrollToTop";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ScrollToTop />
    <SalonContextProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <App />
    </SalonContextProvider>
  </BrowserRouter>
);