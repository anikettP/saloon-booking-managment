import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { motion, AnimatePresence } from "framer-motion";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showCollaborators, setShowCollaborators] = useState(false);

  const collaborators = [
    { name: "Aniket Patel", linkedin: "https://www.linkedin.com/in/aniketpatel23?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
    { name: "Ankit Singh Chouhan", linkedin: "https://www.linkedin.com/in/ankitsinghchouhan1309?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
    { name: "Nidhi Mishra", linkedin: "https://www.linkedin.com/in/nidhi-mishra-512327243?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
    { name: "Girija Sharma", linkedin: "https://www.linkedin.com/in/girija-sharma-86b289272?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
  ];

  const goToSection = (e, path, id) => {
    if (e && e.preventDefault) e.preventDefault();
    const scrollToId = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    };
    if (location.pathname === path) scrollToId();
    else {
      navigate(path);
      setTimeout(scrollToId, 300);
    }
  };

  return (
    <footer className="mt-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 text-sm">
        <div>
          <img src={assets.logo} className="mb-5 w-32" alt="WowWoolies logo" />
          <p className="w-full md:w-2/3 text-gray-600">
            WowWoolies is a Jaipur-based handcrafted string-art brand — premium materials, careful finishing, and artisan-made quality you can trust.
          </p>
        </div>

        <div className="relative backdrop-blur-lg bg-white/20 border border-white/30 rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)]">
          <p className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-800">
            LINKS <span className="inline-block w-8 h-1 bg-rose-600 rounded animate-pulse shadow-[0_0_6px_#fb7185]" />
          </p>
          <ul className="flex flex-col gap-1 text-gray-700">
            {[
              { label: "Home", path: "/", id: "home" },
              { label: "About", path: "/about", id: "about" },
              { label: "Orders", path: "/orders", id: "orders" },
              { label: "Cart", path: "/cart", id: "cart" },
              { label: "Back to top", path: null, id: null },
            ].map((item) => (
              <li key={item.label} className="overflow-hidden">
                <button
                  onClick={(e) => item.path ? goToSection(e, item.path, item.id) : window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="group w-full text-left flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 bg-white/5 hover:bg-white/30 focus:bg-white/40 border border-white/20 hover:border-white/40 focus:outline-none focus:ring-1 focus:ring-rose-200 backdrop-blur-md"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full opacity-90 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-xs font-medium group-hover:text-rose-600 transition-colors">{item.label}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xl font-medium mb-5 text-black">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-black">
            <li>Tel: +91-9352424085</li>
            <li>Email: wowwoolies25@gmail.com</li>
          </ul>
        </div>
      </div>

      <div className="py-8">
        <hr className="border-gray-200 mb-6" />
        <div className="max-w-screen-lg mx-auto px-4 text-center">
          <p className="text-[16px] sm:text-lg font-medium text-gray-800 flex flex-wrap justify-center items-center gap-2">
            <span onClick={() => setShowCollaborators((s) => !s)} className="cursor-pointer hover:text-gray-900 transition-colors">
              This website was developed in collaboration with
            </span>
            <a href="#" className="relative font-bold text-gray-900 hover:text-rose-600 transition-colors duration-300">
              MOON.
            </a>
          </p>

          <AnimatePresence>
            {showCollaborators && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }} className="mt-3">
                <p className="text-sm text-gray-800">
                  {collaborators.map((person, i) => (
                    <span key={person.name}>
                      <a href={person.linkedin} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-800 hover:text-rose-600 transition-colors">
                        {person.name}
                      </a>
                      {i < collaborators.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-sm text-gray-700 mt-4 mb-0">Copyright 2025@wowwoolies.co.in - Version 2.0 All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;