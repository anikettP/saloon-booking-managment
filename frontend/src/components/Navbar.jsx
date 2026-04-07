// src/components/Navbar.jsx
import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { SalonContext } from "../context/SalonContext";
import AOS from "aos";

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const { setShowSearch, token, logout, user } = useContext(SalonContext);

  useEffect(() => {
    AOS.refresh();
  }, [visible, token]);

  const handleProfileClick = () => {
    if (!token) {
      navigate("/login");
    } else {
      if (window.innerWidth < 640) {
        setIsProfileOpen(!isProfileOpen);
      } else {
        navigate("/profile");
      }
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    if (user.role === "artist") return "/artist-dashboard";
    return "/dashboard";
  };

  return (
    <>
      {/* MAIN NAVBAR */}
        <nav
          className="fixed top-4 left-4 right-4 z-[999] flex items-center justify-between px-6 py-4 font-medium bg-white/70 backdrop-blur-3xl border border-rose-100 rounded-[2.5rem] shadow-2xl transition-all duration-700 hover:border-rose-200"
          style={{
            position: "fixed",
            top: "calc(env(safe-area-inset-top, 16px))",
            left: "1rem",
            right: "1rem",
          }}
          data-aos="fade-down"
          data-aos-duration="1200"
        >
          {/* Logo with Premium Glow */}
          <Link
            to="/"
            className="hover:scale-105 transition-all duration-500 hover:rotate-1"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src={assets.logo}
              className="w-16 sm:w-28 drop-shadow-[0_0_15px_rgba(225,29,72,0.1)] filter brightness-100"
              alt="Book.My.Glow"
            />
          </Link>

        {/* Desktop Links */}
        <ul className="hidden sm:flex gap-8 text-[11px] font-black tracking-[0.2em] text-rose-950/60" data-aos="fade-up" data-aos-duration="700" data-aos-delay="150">
          <li><NavLink to="/" className={({isActive}) => `transition-colors hover:text-rose-600 ${isActive ? 'text-rose-600' : ''}`}>HOME</NavLink></li>
          <li><NavLink to="/salons" className={({isActive}) => `transition-colors hover:text-rose-600 ${isActive ? 'text-rose-600' : ''}`}>SALONS</NavLink></li>
          <li><NavLink to="/gallery" className={({isActive}) => `transition-colors hover:text-rose-600 ${isActive ? 'text-rose-600' : ''}`}>GALLERY</NavLink></li>
          <li><NavLink to="/about" className={({isActive}) => `transition-colors hover:text-rose-600 ${isActive ? 'text-rose-600' : ''}`}>ABOUT</NavLink></li>
          <li><NavLink to="/contact" className={({isActive}) => `transition-colors hover:text-rose-600 ${isActive ? 'text-rose-600' : ''}`}>CONTACT</NavLink></li>
        </ul>

        {/* Icons */}
        <div className="flex items-center gap-6">
          {/* Search */}
          <img
            onClick={() => setShowSearch(true)}
            src={assets.search_icon}
            className="w-5 cursor-pointer hover:scale-110 transition-all duration-300 filter invert-0 opacity-40 hover:opacity-100"
            alt="Search"
            data-aos="zoom-in"
            data-aos-delay="200"
          />

          {/* Profile */}
          <div className="group relative" data-aos="zoom-in" data-aos-delay="250">
            <button
              type="button"
              onClick={handleProfileClick}
              className="flex items-center justify-center"
            >
              <img
                className="w-5 cursor-pointer hover:scale-110 transition-all duration-300 filter invert-0 opacity-40 hover:opacity-100"
                src={assets.profile_icon}
                alt="Profile"
              />
            </button>

            {/* Desktop Dropdown */}
            {token && (
              <div className="hidden sm:block absolute right-0 pt-6 opacity-0 scale-95 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 origin-top-right">
                <div className="flex flex-col w-64 bg-white/95 backdrop-blur-3xl border border-rose-100 shadow-2xl rounded-2xl overflow-hidden text-rose-950 ring-1 ring-rose-500/5">
                  <div className="px-6 py-4 border-b border-rose-50 bg-rose-50/30">
                    <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Client Profile</p>
                    <p className="text-sm font-black text-rose-950 uppercase">{user?.name || "Welcome back!"}</p>
                    {user?.role && <p className="text-[9px] text-rose-600 font-bold uppercase tracking-widest mt-0.5">{user.role}</p>}
                  </div>
                  <div className="py-2">
                    <p onClick={() => navigate("/profile")} className="cursor-pointer px-6 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-colors">My Profile</p>
                    <p onClick={() => navigate("/my-bookings")} className="cursor-pointer px-6 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-colors">My Bookings</p>
                    <p onClick={() => navigate(getDashboardLink())} className="cursor-pointer px-6 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-colors">Dashboard</p>
                    <div className="h-[1px] bg-rose-50 mx-4 my-1"></div>
                    <p onClick={() => { logout(); setIsProfileOpen(false); }} className="cursor-pointer px-6 py-3 text-[11px] font-black uppercase tracking-widest text-rose-900/40 hover:bg-rose-50 hover:text-rose-600 transition-colors">Logout</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Book Now CTA (Premium Rose) */}
          <Link
            to="/salons"
            className="hidden lg:flex items-center gap-3 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-full hover:bg-rose-700 hover:shadow-[0_0_30px_rgba(225,29,72,0.3)] transition-all shadow-xl shadow-rose-500/10"
            data-aos="zoom-in"
            data-aos-delay="300"
          >
             Secure Session
          </Link>

          {/* Mobile Menu Icon */}
          <img
            onClick={() => setVisible(true)}
            src={assets.menu_icon}
            className="w-6 cursor-pointer sm:hidden hover:scale-110 transition-transform duration-300 filter invert-0 opacity-60"
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
            <div className="h-full overflow-auto pt-16 p-4">
              <div onClick={() => setVisible(false)} className="flex items-center gap-4 p-2 cursor-pointer hover:text-red-500">
                <img className="h-4 rotate-180" src={assets.dropdown_icon} alt="Back" />
                <p className="font-medium text-lg">Back</p>
              </div>
              <nav className="mt-4 flex flex-col text-sm">
                <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b" to="/">HOME</NavLink>
                <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b" to="/salons">SALONS</NavLink>
                <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b" to="/gallery">GALLERY</NavLink>
                <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b" to="/about">ABOUT</NavLink>
                <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b" to="/contact">CONTACT</NavLink>
                {token ? (
                  <>
                    <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b" to="/my-bookings">MY BOOKINGS</NavLink>
                    <NavLink onClick={() => setVisible(false)} className="py-3 pl-6 border-b" to="/dashboard">DASHBOARD</NavLink>
                    <button onClick={() => { setVisible(false); logout(); }} className="text-left py-3 pl-6 border-b text-red-500">LOGOUT</button>
                  </>
                ) : (
                  <button onClick={() => { setVisible(false); navigate("/login"); }} className="text-left py-3 pl-6 border-b text-pink-600 font-semibold">LOGIN / SIGN UP</button>
                )}
              </nav>

              {/* Mobile Book Now */}
              <div className="mt-6 px-4">
                <button
                  onClick={() => { setVisible(false); navigate("/salons"); }}
                  className="w-full bg-pink-500 text-white py-3 rounded-2xl font-semibold hover:bg-pink-600 transition"
                >
                  ✂️ Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Profile Modal */}
      {token && isProfileOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm sm:hidden"
          onClick={() => setIsProfileOpen(false)}
        >
          <div
            className="w-[85%] max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-pink-50 px-6 py-4 border-b border-pink-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-pink-500 uppercase tracking-widest">Account</p>
                <p className="text-lg font-bold text-gray-800">{user?.name || "My Profile"}</p>
                {user?.role && <p className="text-xs text-pink-400 capitalize">{user.role}</p>}
              </div>
              <button onClick={() => setIsProfileOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="flex flex-col py-2">
              <button onClick={() => { navigate("/profile"); setIsProfileOpen(false); }} className="text-left px-6 py-4 text-gray-700 hover:bg-gray-50 font-medium border-b border-gray-50">My Profile</button>
              <button onClick={() => { navigate("/my-bookings"); setIsProfileOpen(false); }} className="text-left px-6 py-4 text-gray-700 hover:bg-gray-50 font-medium border-b border-gray-50">My Bookings</button>
              <button onClick={() => { navigate(getDashboardLink()); setIsProfileOpen(false); }} className="text-left px-6 py-4 text-gray-700 hover:bg-gray-50 font-medium border-b border-gray-50">Dashboard</button>
              <button onClick={() => { logout(); setIsProfileOpen(false); }} className="text-left px-6 py-4 text-red-600 hover:bg-red-50 font-medium">Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;