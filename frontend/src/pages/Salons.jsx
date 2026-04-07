// frontend/src/pages/Salons.jsx
import React, { useContext, useEffect, useState } from "react";
import { SalonContext } from "../context/SalonContext";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Sparkles, Scissors, ArrowRight, Search } from "lucide-react";
import { assets } from "../assets/assets";

const CATEGORIES = ["All", "Hair", "Spa", "Nails", "Makeup", "Beard", "Skincare"];

const Salons = () => {
  const { salons, fetchSalons } = useContext(SalonContext);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchSalons();
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    let data = [...salons];
    if (activeCategory !== "All") {
      data = data.filter(s => s.categories?.includes(activeCategory));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(s =>
        s.name?.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(data);
  }, [salons, activeCategory, search]);

  return (
    <div className="min-h-screen pt-40 pb-24 px-6 sm:px-12 bg-[#FFFBFA] text-rose-950 selection:bg-rose-100">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section (Premium Light) */}
        <div className="text-center mb-24 animate-fade-in relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-rose-500/5 blur-[120px] -mt-40 pointer-events-none" />
           <div className="flex items-center justify-center gap-3 text-rose-600 font-black uppercase tracking-[0.4em] text-[10px] mb-6">
              <Sparkles size={16} className="animate-pulse" /> Verified Network
           </div>
           <h1 className="text-6xl md:text-8xl font-black text-rose-950 uppercase tracking-tighter mb-8 leading-[0.9]">
              The <span className="italic text-transparent bg-clip-text bg-gradient-to-b from-rose-600 via-rose-500 to-rose-400 underline decoration-rose-200 underline-offset-[12px]">Signature</span> Collection
           </h1>
           <p className="text-rose-900/40 max-w-2xl mx-auto text-lg font-medium leading-relaxed uppercase tracking-widest text-[10px]">
             Curated professional workspaces, verified for technical excellence and luxury grade standards. Establish your presence.
           </p>
        </div>

        {/* Search & Filter bar (Premium Light) */}
        <div className="flex flex-col md:flex-row gap-6 mb-20 items-center justify-between bg-white border border-rose-50 p-8 rounded-[3.5rem] shadow-2xl shadow-rose-500/5 relative z-20">
           <div className="relative w-full md:w-96 group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-rose-600 transition-colors" size={20} />
             <input
               type="text"
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Search Signature Studios..."
               className="w-full bg-rose-50/30 border border-rose-100 rounded-2xl pl-16 pr-6 py-5 text-sm font-black text-rose-950 outline-none focus:border-rose-300 transition uppercase tracking-widest placeholder:text-rose-950/20 shadow-inner"
             />
           </div>

           <div className="flex flex-wrap gap-3 justify-center">
             {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${
                    activeCategory === cat 
                    ? "bg-rose-600 text-white border-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.2)]" 
                    : "bg-white text-rose-950/40 border-rose-100 hover:border-rose-300 hover:text-rose-600 shadow-sm"
                  }`}
                >
                  {cat}
                </button>
             ))}
           </div>
        </div>

        {/* Salons Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1,2,3,4,5,6].map(i => (
               <div key={i} className="h-[550px] bg-white rounded-[4rem] border border-rose-50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filtered.map(salon => (
              <SalonCard key={salon._id} salon={salon} onClick={() => navigate(`/salon/${salon._id}`)} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-rose-100 shadow-xl shadow-rose-500/5">
             <div className="text-6xl mb-8 opacity-10">💎</div>
             <h3 className="text-xl font-black text-rose-950/40 uppercase tracking-widest">No Authorized Studios Found</h3>
             <p className="text-rose-900/20 text-[10px] font-black uppercase tracking-[0.4em] mt-4">Try refining your discovery criteria</p>
          </div>
        )}

      </div>
    </div>
  );
};

const SalonCard = ({ salon, onClick }) => {
  const fallback = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80";
  const image = salon.images?.[0] || assets.salon_placeholder || fallback;

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-[4rem] p-6 border border-rose-50 cursor-pointer shadow-xl hover:shadow-2xl hover:border-rose-100 hover:-translate-y-3 transition-all duration-1000 flex flex-col relative overflow-hidden"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[3.5rem] mb-10 translate-z-0 shadow-lg">
        <img 
          src={image} 
          alt={salon.name} 
          className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-125"
          onError={e => { e.target.src = fallback; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700" />
        
        <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-2xl px-5 py-2.5 rounded-2xl flex items-center gap-2 text-[11px] font-black text-rose-600 shadow-2xl border border-rose-50">
          <Star size={14} className="fill-rose-600" />
          <span>4.9</span>
        </div>
      </div>

      <div className="px-4 pb-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-6">
           <div>
              <p className="text-rose-600 font-black uppercase tracking-[0.4em] text-[9px] mb-3">{salon.categories?.[0] || 'Premium Workspace'}</p>
              <h3 className="text-3xl font-black text-rose-950 uppercase tracking-tighter leading-none group-hover:text-rose-600 transition-colors duration-500">{salon.name}</h3>
           </div>
           <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 text-rose-600 shadow-2xl group-hover:rotate-12 transition-transform duration-700">
             <Sparkles size={20} />
           </div>
        </div>

        <div className="flex items-center gap-3 text-rose-950/40 text-[10px] font-black uppercase tracking-widest mb-10">
          <MapPin size={14} className="text-rose-600" />
          <span className="truncate">{salon.location}</span>
        </div>

        <div className="mt-auto pt-8 border-t border-rose-50 flex items-center justify-between">
           <div>
              <p className="text-[9px] text-rose-950/20 font-black uppercase tracking-widest mb-1">Service Tier</p>
              <p className="text-rose-950 font-black text-2xl tracking-tighter">₹299 <span className="text-rose-900/20 text-[10px] ml-1 font-bold">START</span></p>
           </div>
           <button className="bg-rose-600 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all duration-500 shadow-2xl shadow-rose-500/20 flex items-center gap-2">
             Reserve <ArrowRight size={14} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default Salons;
