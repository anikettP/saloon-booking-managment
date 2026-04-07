import React from 'react'
import { assets } from '../assets/assets'

const Navbar = ({ setToken }) => {
  return (
    <header className="w-full bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left - Logo */}
        <div className="flex items-center gap-2">
          <img
            src={assets.logo}
            alt="Logo"
            className="w-[max(10%,80px)] h-auto object-contain"
          />
          <h1 className="hidden sm:block text-lg font-black text-gray-900 tracking-tight">
            Book.My.<span className="text-pink-600">Glow</span> Admin
          </h1>
        </div>

        {/* Right - Logout */}
        <button
          onClick={() => setToken('')}
          className="bg-black text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm hover:opacity-90 transition-all shadow-md"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Navbar
