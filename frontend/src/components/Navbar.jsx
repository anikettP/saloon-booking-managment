// src/components/Navbar.jsx
import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import AOS from "aos";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State for Mobile Menu

  const {
    setShowSearch,
    navigate,
    token,
    setToken,
    setCartItems,
    getCartCount,
  } = useContext(ShopContext);

  useEffect(() => {
    AOS.refresh();
  }, [visible, token]);

  const logout = () => {
    navigate("/login");
    localStorage.removeItem("token");
    setToken("");
    setCartItems({});
    setIsProfileOpen(false);
  };

  const handleProfileClick = () => {
    if (!token) {
      navigate("/login?redirect=/profile");
    } else {
      // On mobile, this toggles the center modal
      // On desktop, the hover CSS handles it, but clicking acts as a backup
      if (window.innerWidth < 640) {
        setIsProfileOpen(!isProfileOpen);
      } else {
        navigate("/profile");
      }
    }
  };

  const cartCount = getCartCount();

  return (
    <>
      {/* --- MAIN NAVBAR --- */}
      <nav
        className="fixed top-4 left-4 right-4 z-[999] flex items-center justify-between px-6 py-3 font-medium bg-white/20 backdrop-blur-xl border border-white/40 rounded-3xl shadow-xl transition-all duration-500 hover:shadow-2xl"
        style={{
          position: "fixed",
          top: "calc(env(safe-area-inset-top, 0px) + 16px)",
          left: "1rem",
          right: "1rem",
        }}
        data-aos="fade-down"
        data-aos-duration="700"
      >
        {/* Logo */}
        <Link
          to="/"
          data-aos="fade-right"
          data-aos-delay="100"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src={assets.logo}
            className="w-16 sm:w-24 drop-shadow-md"
            alt="Logo"
          />
        </Link>

        {/* Desktop Links */}
        <ul
          className="hidden sm:flex gap-6 text-sm"
          data-aos="fade-up"
          data-aos-duration="700"
          data-aos-delay="150"
        >
          <li><NavLink to="/" className="nav-link">HOME</NavLink></li>
          <li><NavLink to="/collection" className="nav-link">COLLECTION</NavLink></li>
          <li><NavLink to="/about" className="nav-link">ABOUT</NavLink></li>
          <li><NavLink to="/contact" className="nav-link">CONTACT</NavLink></li>
        </ul>

        {/* Icons */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <img
            onClick={() => setShowSearch(true)}
            src={assets.search_icon}
            className="w-5 cursor-pointer hover:scale-110 transition-transform duration-300"
            alt="Search"
            data-aos="zoom-in"
            data-aos-delay="200"
          />

          {/* Profile Icon */}
          <div className="group relative" data-aos="zoom-in" data-aos-delay="250">
            <button
              type="button"
              onClick={handleProfileClick}
              className="flex items-center justify-center"
            >
              <img
                className="w-5 cursor-pointer hover:scale-110 transition-transform duration-300"
                src={assets.profile_icon}
                alt="Profile"
              />
            </button>

            {/* --- DESKTOP HOVER MENU (Hidden on Mobile) --- */}
            {token && (
              <div className="hidden sm:block absolute right-0 pt-4 opacity-0 scale-95 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 origin-top-right">
                <div className="flex flex-col w-60 bg-white/90 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-xl overflow-hidden text-gray-700 ring-1 ring-black/5">
                  <div className="px-5 py-3 border-b border-gray-200 bg-gray-50/50">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Account</p>
                    <p className="text-sm font-bold text-gray-800">Welcome Back!</p>
                  </div>
                  <div className="py-2">
                    <p onClick={() => navigate("/profile")} className="cursor-pointer px-5 py-3 text-sm hover:bg-pink-50 hover:text-pink-600">My Profile</p>
                    <p onClick={() => navigate("/orders")} className="cursor-pointer px-5 py-3 text-sm hover:bg-pink-50 hover:text-pink-600">Orders</p>
                    <div className="h-[1px] bg-gray-100 mx-4 my-1"></div>
                    <p onClick={logout} className="cursor-pointer px-5 py-3 text-sm text-gray-600 hover:bg-red-50 hover:text-red-600">Logout</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative hover:scale-110 transition-transform duration-300"
            data-aos="zoom-in"
            data-aos-delay="300"
          >
            <img src={assets.cart_icon} className="w-6 min-w-6" alt="Cart" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-rose-600 rounded-full shadow-md">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Icon */}
          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            className="w-6 cursor-pointer sm:hidden hover:scale-110 transition-transform duration-300"
            alt="Menu"
            data-aos="zoom-in"
            data-aos-delay="350"
          />
        </div>

        {/* Side Menu (Mobile) */}
        <div
          className={`fixed top-0 right-0 h-screen z-[60] transition-transform duration-500 ease-in-out ${
            visible ? "translate-x-0 w-3/4 sm:w-1/2" : "translate-x-full w-0"
          }`}
        >
          <div className="h-full bg-white text-black shadow-2xl rounded-l-2xl overflow-hidden">
             {/* Side menu content same as before... */}
             <div className="h-full overflow-auto pt-16 p-4">
                <div onClick={() => setVisible(false)} className="flex items-center gap-4 p-2 cursor-pointer hover:text-red-500">
                  <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="Back" />
                  <p className="font-medium text-lg">Back</p>
                </div>
                <nav className="mt-4 flex flex-col text-sm">
                   <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b" to="/">HOME</NavLink>
                   <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b" to="/collection">COLLECTION</NavLink>
                   <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b" to="/about">ABOUT</NavLink>
                   <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b" to="/contact">CONTACT</NavLink>
                   {!token && <button onClick={() => { setVisible(false); navigate("/login"); }} className="text-left py-3 pl-6 border-b">LOGIN</button>}
                </nav>
             </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE PROFILE MODAL (OUTSIDE NAV) --- */}
      {/* This sits outside the nav so it covers the WHOLE screen properly */}
      {token && isProfileOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm sm:hidden"
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            className="w-[85%] max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()} // Prevent close on click inside
          >
            {/* Header */}
            <div className="bg-pink-50 px-6 py-4 border-b border-pink-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-pink-500 uppercase tracking-widest">Account</p>
                <p className="text-lg font-bold text-gray-800">My Profile</p>
              </div>
              <button onClick={() => setIsProfileOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            {/* Links */}
            <div className="flex flex-col py-2">
              <button
                onClick={() => { navigate("/profile"); setIsProfileOpen(false); }}
                className="text-left px-6 py-4 text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-3 border-b border-gray-50"
              >
                My Profile
              </button>
              <button
                onClick={() => { navigate("/orders"); setIsProfileOpen(false); }}
                className="text-left px-6 py-4 text-gray-700 hover:bg-gray-50 font-medium flex items-center gap-3 border-b border-gray-50"
              >
                Orders
              </button>
              <button
                onClick={logout}
                className="text-left px-6 py-4 text-red-600 hover:bg-red-50 font-medium flex items-center gap-3"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;