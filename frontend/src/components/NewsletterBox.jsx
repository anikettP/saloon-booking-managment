import React from "react";
import { assets } from "../assets/assets";

const NewsletterBox = () => {
  const myWhatsAppNumber = "919759883087"; 
  
  return (
    <div className="flex flex-col gap-8 md:flex-row justify-center px-6">
      {/* WhatsApp Card (Premium Light) */}
      <div className="flex flex-col sm:flex-row flex-1 max-w-2xl items-center gap-10 rounded-[3rem] bg-white border border-rose-50 shadow-2xl shadow-rose-500/5 p-10 min-h-[260px] transition-all hover:scale-[1.01] hover:border-rose-100 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 blur-3xl -mr-10 -mt-10" />
        <div className="relative shrink-0">
           <img 
             src={assets.WA_QR || 'https://via.placeholder.com/150'} 
             alt="WhatsApp QR" 
             className="w-36 h-36 object-contain group-hover:scale-105 transition-transform duration-700" 
           />
           <div className="absolute -top-3 -right-3 bg-rose-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-2xl">SCAN ME</div>
        </div>
        <div className="text-center sm:text-left flex-1">
          <p className="text-rose-600 font-black uppercase tracking-[0.4em] text-[9px] mb-3">Professional Support</p>
          <h3 className="text-2xl font-black text-rose-950 mb-3 uppercase tracking-tight">Direct <span className="text-rose-600 italic">Concierge</span></h3>
          <p className="text-rose-900/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-8">
            Encountering an issue? Connect with our ensemble via <span className="text-rose-600 font-black" >WhatsApp</span> for instant synchronization.
          </p>
          <a
            href={`https://wa.me/${myWhatsAppNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-rose-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-2xl shadow-rose-500/20"
          >
            ESTABLISH CONTACT
          </a>
        </div>
      </div>
    </div>
  );
};

export default NewsletterBox;