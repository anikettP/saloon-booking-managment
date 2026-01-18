// frontend/src/context/ShopContext.jsx
// ... imports remain the same
import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io as ioClient } from "socket.io-client";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "₹";
  const delivery_fee = 0;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const apiBase = `${backendUrl.replace(/\/$/, "")}/api`;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);

  // --- Add to Cart ---
  const addToCart = async (itemId, size, customData = null) => {
    let sizeKey = size;
    // Create unique key combining size + custom data
    if (customData && Object.keys(customData).length > 0) {
      const customString = JSON.stringify(customData);
      sizeKey = `${size}__custom__${customString}`;
    }

    const newCart = structuredClone(cartItems);

    if (newCart[itemId]) {
      newCart[itemId][sizeKey] = (newCart[itemId][sizeKey] || 0) + 1;
    } else {
      newCart[itemId] = { [sizeKey]: 1 };
    }

    setCartItems(newCart);
    toast.success("Added to cart");

    if (token) {
      try {
        await axios.post(
          `${apiBase}/cart/add`,
          { itemId, size: sizeKey }, 
          { headers: { token } }
        );
      } catch (err) {
        console.log("cart add error:", err?.response?.data || err.message);
      }
    } else {
      localStorage.setItem("cartItems", JSON.stringify(newCart));
    }
  };

  // --- ✅ UPDATED: Get Cart Amount (Includes Extra Prices) ---
  const getCartAmount = () => {
    let total = 0;
    for (let id in cartItems) {
      const product = products.find((p) => p._id === id);
      if (!product) continue;

      for (let sizeKey in cartItems[id]) {
        const qty = cartItems[id][sizeKey];
        if (qty <= 0) continue;

        // 1. Get Base Size Price
        let itemPrice = product.price; // fallback
        const rawSizeName = sizeKey.split('__custom__')[0];
        
        if (Array.isArray(product.sizes)) {
          const sizeObj = product.sizes.find(s => s.name === rawSizeName);
          if (sizeObj) {
            itemPrice = Number(sizeObj.price);
          }
        }

        // 2. ✅ CHECK FOR EXTRA PRICE MODIFIERS (Hidden in the key)
        let extraCost = 0;
        if (sizeKey.includes('__custom__')) {
          try {
            const jsonPart = sizeKey.split('__custom__')[1];
            const customObj = JSON.parse(jsonPart);
            if (customObj.__extra) {
              extraCost = Number(customObj.__extra);
            }
          } catch(e) {
            console.error("Error parsing cart custom data", e);
          }
        }

        total += (itemPrice + extraCost) * qty;
      }
    }
    return total;
  };

  // ... (Keep getCartCount, updateQuantity, getProductsData, loadCart, useEffects exact same as before)
  const getCartCount = () => {
    if (!cartItems || typeof cartItems !== "object") return 0;
    let total = 0;
    Object.values(cartItems).forEach((sizes) => {
      Object.values(sizes || {}).forEach((qty) => {
        if (qty > 0) total += qty;
      });
    });
    return total;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    const newCart = structuredClone(cartItems);
    newCart[itemId][size] = quantity;
    setCartItems(newCart);
    if (token) {
      try {
        await axios.post(`${apiBase}/cart/update`, { itemId, size, quantity }, { headers: { token } });
      } catch (err) {}
    } else {
      localStorage.setItem("cartItems", JSON.stringify(newCart));
    }
  };

  const getProductsData = async () => {
    try {
      const res = await axios.get(`${apiBase}/product/list`);
      if (res.data.success) setProducts(res.data.products.reverse());
    } catch (err) {}
  };

  const loadCart = async () => {
    const savedToken = localStorage.getItem("token");
    if (token || savedToken) {
      const authToken = token || savedToken;
      setToken(authToken);
      try {
        const res = await axios.post(`${apiBase}/cart/get-auth`, {}, { headers: { token: authToken } });
        if (res.data.success) setCartItems(res.data.cartData || {});
      } catch (err) {}
    } else {
      const local = localStorage.getItem("cartItems");
      if (local) setCartItems(JSON.parse(local));
    }
  };

  useEffect(() => { getProductsData(); }, []);
  useEffect(() => { loadCart(); }, [token]);

  useEffect(() => {
    const rawBackend = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    const socketUrl = rawBackend.replace(/\/$/, "");
    try {
      const s = ioClient(socketUrl, { transports: ["websocket", "polling"], path: "/socket.io" });
      setSocket(s);
      return () => s.disconnect();
    } catch (err) {}
  }, [token]);

  const value = {
    products, currency, delivery_fee, search, setSearch, showSearch, setShowSearch,
    cartItems, addToCart, setCartItems, getCartCount, updateQuantity, getCartAmount,
    navigate, backendUrl, setToken, token, socket
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;