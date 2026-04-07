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
    <footer className="mt-20 px-6 sm:px-12 py-16 bg-white border-t border-rose-50">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-16 max-w-7xl mx-auto">
        <div>
          <img src={assets.logo} className="mb-8 w-32 filter brightness-100" alt="Book.My.Glow logo" />
          <p className="w-full md:w-3/4 text-sm font-medium text-rose-950/60 leading-relaxed uppercase tracking-widest text-[11px]">
            Book.My.Glow is Bharat's most prestigious sanctuary for effortless salon synchronization. We curated a verified ensemble of professional masters to guarantee your technical excellence.
          </p>
        </div>

        <div className="relative backdrop-blur-3xl bg-[#FFFBFA] border border-rose-100 rounded-[2.5rem] p-8 shadow-xl transition-all hover:border-rose-300 group">
          <p className="text-[10px] font-black mb-6 flex items-center gap-2 text-rose-950 uppercase tracking-[0.4em]">
            Elite Links <span className="inline-block w-8 h-0.5 bg-rose-600 rounded-full animate-pulse" />
          </p>
          <ul className="flex flex-col gap-2">
            {[
              { label: "Studio Discovery", path: "/salons", id: "salons" },
              { label: "Visual Gallery", path: "/gallery", id: "gallery" },
              { label: "Our Philosophy", path: "/about", id: "about" },
              { label: "Registry Profile", path: "/profile", id: "profile" },
            ].map((item) => (
              <li key={item.label}>
                <button
                  onClick={(e) => item.path ? goToSection(e, item.path, item.id) : window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="w-full text-left flex items-center gap-3 px-2 py-2 text-[10px] font-black text-rose-900/40 uppercase tracking-widest hover:text-rose-600 transition-colors"
                >
                  <span className="w-1 h-1 bg-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-[10px] font-black mb-6 text-rose-950 uppercase tracking-[0.4em]">Establish Contact</p>
          <ul className="flex flex-col gap-3">
             <li>
               <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Master Concierge</p>
               <p className="text-sm font-black text-rose-950">+91-9759883087</p>
             </li>
             <li>
               <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest">Electronic Mail</p>
               <p className="text-sm font-black text-rose-950">concierge@bookmyglow.com</p>
             </li>
          </ul>
        </div>
      </div>

      <div className="mt-20 max-w-7xl mx-auto">
        <hr className="border-rose-50 mb-10" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-black text-rose-950 flex items-center gap-2 uppercase tracking-[0.3em]">
            Book.My.<span className="text-rose-600 italic">Glow</span>
          </p>
          <p className="text-[9px] text-rose-900/20 font-black uppercase tracking-[0.4em]">Copyright 2026 @ Book.My.Glow - Premium Edition. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;