// frontend/src/context/SalonContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io as ioClient } from "socket.io-client";

export const SalonContext = createContext();

// Named hook for cleaner imports
export const useSalon = () => useContext(SalonContext);

// Keep ShopContext as alias for backward compat
export const ShopContext = SalonContext;

const SalonContextProvider = ({ children }) => {
  const currency = "₹";
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
  const apiBase = `${backendUrl.replace(/\/$/, "")}/api`;

  const navigate = useNavigate();

  // ─── Auth State ────────────────────────────────────────────────────────────
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);

  // ─── Salon & Service State ─────────────────────────────────────────────────
  const [salons, setSalons] = useState([]);
  const [featuredSalons, setFeaturedSalons] = useState([]);

  // ─── Booking Flow State ────────────────────────────────────────────────────
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedArtist, setSelectedArtist] = useState(null);

  // ─── Search / UI State ─────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // ─── Socket ────────────────────────────────────────────────────────────────
  const [socket, setSocket] = useState(null);

  // ─── Load Current User ─────────────────────────────────────────────────────
  const loadUser = useCallback(async (authToken) => {
    try {
      const res = await axios.get(`${apiBase}/user/me`, {
        headers: { token: authToken }
      });
      if (res.data.success) setUser(res.data.user);
    } catch {}
  }, [apiBase]);

  // ─── Fetch Salons ──────────────────────────────────────────────────────────
  const fetchSalons = useCallback(async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`${apiBase}/salons?${params}`);
      if (res.data.success) {
        setSalons(res.data.salons);
        setFeaturedSalons(res.data.salons.filter(s => s.featured));
      }
    } catch (err) {
      console.error("fetchSalons error:", err);
    }
  }, [apiBase]);

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    navigate("/login");
  };

  // ─── Reset Booking Flow ───────────────────────────────────────────────────
  const resetBookingFlow = () => {
    setSelectedSalon(null);
    setSelectedService(null);
    setSelectedDate("");
    setSelectedSlot("");
    setSelectedArtist(null);
  };

  // ─── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      loadUser(token);
    }
  }, [token, loadUser]);

  useEffect(() => {
    const rawBackend = import.meta.env.VITE_BACKEND_URL || window.location.origin;
    const socketUrl = rawBackend.replace(/\/$/, "");
    try {
      const s = ioClient(socketUrl, { transports: ["websocket", "polling"], path: "/socket.io" });
      setSocket(s);
      return () => s.disconnect();
    } catch {}
  }, []);

  const value = {
    // Auth
    token, setToken, user, setUser, logout, backendUrl, apiBase,

    // Data
    salons, featuredSalons, fetchSalons,

    // Booking Flow
    selectedSalon, setSelectedSalon,
    selectedService, setSelectedService,
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    selectedArtist, setSelectedArtist,
    resetBookingFlow,

    // UI
    currency, search, setSearch, showSearch, setShowSearch,
    navigate,

    // Socket
    socket,

    // Legacy compatibility (for components that still use ShopContext)
    products: salons,
    cartItems: {},
    getCartCount: () => 0,
    setCartItems: () => {},
    addToCart: () => toast.info("Booking system: use Book Now"),
  };

  return (
    <SalonContext.Provider value={value}>
      {children}
    </SalonContext.Provider>
  );
};

export default SalonContextProvider;
