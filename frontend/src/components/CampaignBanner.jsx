// frontend/src/components/CampaignBanner.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { SalonContext } from "../context/SalonContext";

const CampaignBanner = () => {
  const { apiBase } = useContext(SalonContext);
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(`${apiBase}/banners/list?type=marquee`);
        if (res.data.success) {
          setCampaigns(res.data.banners.filter(b => b.isActive));
        }
      } catch (err) {
        console.error("Failed to fetch marquee campaigns");
      }
    };
    fetchCampaigns();
  }, [apiBase]);

  if (campaigns.length === 0) return null;

  return (
    <div className="bg-gray-900 overflow-hidden py-2 whitespace-nowrap relative group select-none">
      {/* Decorative Gradient Overlays */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none"></div>

      <div className="inline-block animate-marquee group-hover:pause">
        {/* Render twice for seamless loop */}
        {[...campaigns, ...campaigns].map((camp, i) => (
          <div key={i} className="inline-flex items-center mx-6 sm:mx-10">
            <span className="text-[10px] sm:text-xs font-black text-pink-500 uppercase tracking-widest bg-pink-500/10 px-2 py-0.5 rounded border border-pink-500/20 mr-3 shrink-0">
               {camp.title || "CAMPAIGN"}
            </span>
            <p className="text-white text-xs sm:text-sm font-bold tracking-tight uppercase">
              {camp.subtitle}
            </p>
            {camp.linkUrl && (
               <a 
                 href={camp.linkUrl} 
                 className="ml-3 text-[10px] sm:text-xs font-black text-white/40 hover:text-pink-400 transition-colors underline decoration-pink-500/30 underline-offset-4 uppercase tracking-tighter"
               >
                 View Details
               </a>
            )}
            <span className="ml-8 sm:ml-12 text-pink-600/30 font-black text-lg">✦</span>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
        .pause {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
};

export default CampaignBanner;
