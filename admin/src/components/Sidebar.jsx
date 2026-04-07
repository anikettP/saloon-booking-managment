import React from "react";
import { NavLink } from "react-router-dom";

const SidebarItem = ({ to, icon, label, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive
        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`
    }
    title={label}
  >
    <span className="text-lg flex-shrink-0">{icon}</span>
    <span className="hidden md:inline-block font-medium text-sm flex-1">{label}</span>
    {badge && (
      <span className="hidden md:inline-block bg-pink-100 text-pink-600 text-xs px-2 py-0.5 rounded-full font-semibold">
        {badge}
      </span>
    )}
  </NavLink>
);

const SectionLabel = ({ label }) => (
  <p className="hidden md:block text-[10px] font-bold uppercase text-gray-400 tracking-widest px-3 mt-5 mb-2">
    {label}
  </p>
);

const Sidebar = () => {
  return (
    <aside className="w-[60px] md:w-[220px] min-h-screen border-r bg-white flex-shrink-0 transition-all duration-200">
      <div className="px-3 py-6 flex flex-col gap-1 h-full">

        {/* Brand (Desktop) */}
        <div className="hidden md:block mb-6 px-2">
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Book.My.<span className="text-pink-600">Glow</span></h3>
          <p className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-widest">Global Admin Dashboard</p>
        </div>

        {/* OVERVIEW */}
        <SectionLabel label="Summary" />
        <SidebarItem to="/dashboard" icon="📊" label="Stats Overview" />

        {/* SALON NETWORK */}
        <SectionLabel label="Salon Network" />
        <SidebarItem to="/salon-approvals" icon="✅" label="Approvals" />
        <SidebarItem to="/services" icon="✂️" label="All Services" />
        <SidebarItem to="/artists" icon="👥" label="Artist Directory" />

        {/* BOOKINGS */}
        <SectionLabel label="Bookings" />
        <SidebarItem to="/bookings" icon="📅" label="All Bookings" />

        {/* CUSTOMER CONTENT */}
        <SectionLabel label="Customer Content" />
        <SidebarItem to="/banners" icon="🖼️" label="Home Banners" />
        <SidebarItem to="/testimonials" icon="⭐" label="Public Reviews" />

        {/* USER ACCOUNTS */}
        <SectionLabel label="User Accounts" />
        <SidebarItem to="/users" icon="👥" label="Platform Users" />

        <div className="mt-auto pt-4 border-t border-gray-100 items-center justify-center flex">
          <p className="text-[10px] hidden md:block font-bold text-gray-400 text-center px-2 uppercase tracking-widest leading-relaxed">Book.My.Glow Platform<br/>Version 2.0.5</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;