import React, { useContext, useEffect, useState } from "react";
import { SalonContext } from "../context/SalonContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Sparkles, MapPin, Share2, Scissors, ArrowRight, Heart } from "lucide-react";
import { toast } from "react-toastify";

const Gallery = () => {
  const { backendUrl } = useContext(SalonContext);
  const navigate = useNavigate();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchGallery();
  }, [backendUrl]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/gallery/community`);
      if (res.data.success) {
        setGallery(res.data.gallery);
      }
    } catch (err) {
      console.error("Gallery fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const shareLook = (item) => {
    const url = `${window.location.origin}/salon/${item.salonId}`;
    if (navigator.share) {
      navigator.share({
        title: `Check out this look from ${item.salonName}`,
        text: `Found this amazing transformation on Book.My.Glow!`,
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard! 🔗");
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-32 px-6 bg-black text-white selection:bg-gold/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section (Premium) */}
        <div className="text-center mb-24 animate-fade-in relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 blur-[120px] -mt-40 pointer-events-none" />
           
           <div className="flex items-center justify-center gap-3 text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-6">
              <Sparkles size={16} className="animate-pulse" /> The Obsidian Collection
           </div>
           
           <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">
              The <span className="italic text-transparent bg-clip-text bg-gradient-to-b from-gold via-gold/80 to-gold/40 underline decoration-gold/20 underline-offset-[12px]">Glow</span> Gallery
           </h1>
           
           <p className="text-white/40 max-w-2xl mx-auto text-lg font-medium leading-relaxed uppercase tracking-widest text-[10px]">
             Curated transformations from our verified network of professional boutique studios. Elite artistry, captured in high fidelity.
           </p>
        </div>

        {/* Masonry Layout (Premium) */}
        {loading ? (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-8 space-y-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-[3rem] animate-pulse h-64 md:h-80 border border-white/5" />
            ))}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-8 space-y-8">
            {gallery.map((item, idx) => (
              <div 
                key={idx} 
                className="group relative break-inside-avoid rounded-[3.5rem] overflow-hidden bg-[#111] border border-white/5 shadow-2xl hover:shadow-gold/10 transition-all duration-1000 cursor-none"
              >
                {/* Image */}
                <img 
                  src={item.img} 
                  alt={item.salonName} 
                  className="w-full h-auto object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                />

                {/* Glass Overlay (Premium) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-10">
                   
                   <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                     <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 bg-gold/10 backdrop-blur-xl px-4 py-2 rounded-full border border-gold/20">
                           <div className="w-1.5 h-1.5 bg-gold rounded-full animate-ping" />
                           <span className="text-gold text-[9px] font-black uppercase tracking-[0.2em]">Verified Look</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); shareLook(item); }}
                          className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-2xl flex items-center justify-center text-white border border-white/10 hover:bg-gold hover:text-black transition-all duration-500"
                        >
                           <Share2 size={18} />
                        </button>
                     </div>

                     <h3 className="text-white font-black text-2xl leading-tight uppercase tracking-tighter mb-2 group-hover:text-gold transition-colors">{item.salonName}</h3>
                     <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
                        <MapPin size={10} className="text-gold" />
                        <span>{item.location}</span>
                     </div>

                     <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/salon/${item.salonId}`); }}
                        className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-gold transition-all shadow-2xl flex items-center justify-center gap-3 group/btn"
                     >
                        Secure This Session <Scissors size={14} className="group-hover/btn:rotate-45 transition-transform duration-500" />
                     </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State (Premium) */}
        {!loading && gallery.length === 0 && (
          <div className="text-center py-40 bg-[#0A0A0A] rounded-[4rem] border border-dashed border-white/5">
             <Sparkles size={48} className="mx-auto text-gold/20 mb-8 animate-pulse" />
             <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-3">The Gallery is Gathering...</h3>
             <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Elite transformations are currently in synchronization.</p>
          </div>
        )}

        {/* Floating CTA (Premium) */}
        <div className="mt-32 bg-[#111] rounded-[4rem] p-16 lg:p-24 text-center relative overflow-hidden border border-gold/10 group">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -mr-64 -mt-64 group-hover:bg-gold/10 transition-all duration-1000" />
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -ml-64 -mb-64 group-hover:bg-gold/10 transition-all duration-1000" />
           
           <div className="relative z-10">
              <p className="text-gold font-black uppercase tracking-[0.5em] text-[10px] mb-8">Salon Network Registry</p>
              <h2 className="text-4xl md:text-7xl font-black text-white mb-8 uppercase tracking-tighter leading-[0.9]">
                Own a Luxury Studio? <br />
                <span className="text-gold italic underline decoration-gold/20 underline-offset-8">Exhibit Your Artistry</span>
              </h2>
              <p className="text-white/40 max-w-xl mx-auto mb-16 text-sm font-medium leading-relaxed uppercase tracking-[0.1em]">
                Join Bharat's most prestigious salon network. Showcase your creative portfolio to an elite audience of high-value clientele.
              </p>
              <button 
                onClick={() => navigate('/register-salon')}
                className="bg-gold text-black px-16 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-white hover:scale-105 transition-all duration-500 shadow-[0_0_50px_rgba(212,175,55,0.2)] flex items-center gap-4 mx-auto"
              >
                Onboard Your Workspace <ArrowRight size={20} />
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Gallery;
