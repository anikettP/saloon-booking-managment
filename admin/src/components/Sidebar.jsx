import React from "react";
import { NavLink } from "react-router-dom";
import { assets } from "../assets/assets";

const SidebarItem = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
         ${
           isActive
             ? "bg-black text-white shadow-md"
             : "text-gray-700 hover:bg-gray-100"
         }`
      }
      title={label}
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-md bg-transparent group-hover:bg-gray-100">
        <img src={icon} alt={label} className="w-5 h-5" />
      </div>
      <span className="hidden md:inline-block font-medium">{label}</span>
    </NavLink>
  );
};

const Sidebar = () => {
  // Fallback for banner icon if specific asset doesn't exist
  const bannerIcon = assets.image_icon || assets.add_icon;

  return (
    <aside className="w-full md:w-[18%] min-h-screen border-r bg-white flex-shrink-0">
      <div className="px-4 py-6 flex flex-col gap-4">
        <div className="mb-4 px-2">
          <h3 className="text-lg font-semibold">Admin</h3>
          <p className="text-xs text-gray-500">
            Manage products, orders & content
          </p>
        </div>

        {/* MAIN NAV */}
        <nav className="flex flex-col gap-2">
          {/* ✅ ADDED: Dashboard Link at the top */}
          <SidebarItem to="/dashboard" icon={assets.order_icon} label="Dashboard" />
          
          <div className="my-1 border-t border-gray-100"></div>

          <SidebarItem to="/add" icon={assets.add_icon} label="Add Items" />
          <SidebarItem to="/list" icon={assets.order_icon} label="List Items" />
          <SidebarItem to="/orders" icon={assets.order_icon} label="Orders" />
          
          <div className="my-1 border-t border-gray-100"></div>
          
          <SidebarItem to="/banners" icon={bannerIcon} label="Banners" />
          
          {/* Banner 2 Link */}
          <SidebarItem to="/banner2" icon={bannerIcon} label="Banner 2" />

          <SidebarItem to="/categories" icon={assets.add_icon} label="Categories" />
          
          <SidebarItem 
            to="/testimonials" 
            icon={assets.order_icon} 
            label="Testimonials" 
          />

          <div className="my-2 border-t border-gray-100"></div>
        </nav>

        {/* QUICK ACTIONS – DESKTOP */}
        <div className="mt-auto pt-6">
          <div className="hidden md:block text-xs text-gray-500 px-2">
            <p className="mb-1">Quick actions</p>
            <div className="flex flex-col gap-2">
              <NavLink
                to="/add"
                className="text-sm px-3 py-2 rounded hover:bg-gray-100"
              >
                + Add new product
              </NavLink>
              <NavLink
                to="/orders"
                className="text-sm px-3 py-2 rounded hover:bg-gray-100"
              >
                Check orders
              </NavLink>
            </div>
          </div>

          {/* MOBILE BOTTOM NAV */}
          <div className="md:hidden flex items-center justify-around border-t pt-3 mt-4">
             {/* ✅ Added Dashboard to Mobile Menu */}
            <NavLink to="/dashboard" className="flex flex-col items-center text-gray-600">
              <img src={assets.order_icon} alt="dash" className="w-6 h-6" />
              <span className="text-[10px] mt-1">Dash</span>
            </NavLink>

            <NavLink
              to="/add"
              className="flex flex-col items-center text-gray-600"
            >
              <img src={assets.add_icon} alt="add" className="w-6 h-6" />
              <span className="text-[10px] mt-1">Add</span>
            </NavLink>

            <NavLink
              to="/list"
              className="flex flex-col items-center text-gray-600"
            >
              <img src={assets.order_icon} alt="list" className="w-6 h-6" />
              <span className="text-[10px] mt-1">List</span>
            </NavLink>

            <NavLink
              to="/orders"
              className="flex flex-col items-center text-gray-600"
            >
              <img src={assets.order_icon} alt="orders" className="w-6 h-6" />
              <span className="text-[10px] mt-1">Orders</span>
            </NavLink>
            
            <NavLink
              to="/banner2"
              className="flex flex-col items-center text-gray-600"
            >
              <img src={bannerIcon} alt="banner" className="w-6 h-6" />
              <span className="text-[10px] mt-1">Banner 2</span>
            </NavLink>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;