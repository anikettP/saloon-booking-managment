// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import SearchBar from "./components/SearchBar.jsx";

import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import Orders from "./pages/Orders.jsx";
import Product from "./pages/Product.jsx";
import Collection from "./pages/Collection.jsx";
import PlaceOrder from "./pages/PlaceOrder.jsx";
import LatestCollectionPage from "./pages/LatestCollectionPage.jsx";
import BestSellerPage from "./pages/BestSellerPage.jsx";
import Verify from "./pages/Verify.jsx";

import Profile from "./pages/Profile";

import ScrollToTop from "./ScrollToTop.jsx";

import { PopupProvider } from './context/PopupContext';
import AddToCartPopup from './components/AddToCartPopup';

// 1. Import the new WhatsApp Button
import WhatsAppButton from './components/WhatsAppButton';


const App = () => {
  return (
    <div className="font-outfit">
      <PopupProvider>
        
        <ScrollToTop />
        <Navbar />
        
        <SearchBar />

        <AddToCartPopup />

        {/* 2. Add the WhatsApp Button here (it is fixed position, so it floats) */}
        <WhatsAppButton />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/collection" element={<Collection />} />
          <Route path="/product/:productId" element={<Product />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/place-order" element={<PlaceOrder />} />

          <Route path="/login" element={<Login />} />

          <Route path="/orders" element={<Orders />} />

          <Route path="/collection/latest" element={<LatestCollectionPage />} />
          <Route path="/collection/bestsellers" element={<BestSellerPage />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/verify" element={<Verify />} />

        </Routes>

        <Footer />
        
      </PopupProvider>
    </div>
  );
};

export default App;