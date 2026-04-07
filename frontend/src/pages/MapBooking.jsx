import React, { useContext, useState, useEffect } from "react";
import { SalonContext } from "../context/SalonContext";
import { MapPin, Search, Navigation, Info, ExternalLink, Calendar, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateDistance } from "../utils/distance";

const MapBooking = () => {
  const { salons, navigate } = useContext(SalonContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("All");
  const [userLocation, setUserLocation] = useState(null);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log('Location access denied', err)
      );
    }
  }, []);
  
  const cities = ["All", ...new Set(salons.map(s => s.city).filter(Boolean))];

  const filteredSalons = salons.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === "All" || s.city === selectedCity;
    return s.approved && matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="animate-fade-in-up">
             <div className="flex items-center gap-2 text-pink-600 font-black uppercase tracking-widest text-xs mb-3">
                <Navigation size={18} /> Book.My.Glow Precision
             </div>
             <h1 className="text-5xl font-black text-gray-900 leading-tight">Explore <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">Salons by Map</span></h1>
             <p className="text-gray-500 mt-4 max-w-xl text-lg font-medium leading-relaxed">Discover top-tier salon's with pinpoint geographic accuracy. Use our precise mapping system to find your next transformation near you.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <div className="relative group flex-1 sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by name or area..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:ring-2 focus:ring-pink-400 outline-none shadow-sm h-14"
                />
             </div>
             <select 
               value={selectedCity} 
               onChange={(e) => setSelectedCity(e.target.value)}
               className="bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-700 focus:ring-2 focus:ring-pink-400 outline-none shadow-sm h-14"
             >
               {cities.map(city => <option key={city} value={city}>{city}</option>)}
             </select>
          </div>
        </div>

        {/* Dynamic Mapping Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
           
           {/* Discover List */}
           <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                 <h2 className="font-black text-gray-400 uppercase tracking-widest text-xs">Available Workspaces ({filteredSalons.length})</h2>
                 <p className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-black uppercase tracking-tighter shadow-sm shadow-green-50">Global Network Live</p>
              </div>

              <div className="grid grid-cols-1 gap-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                 {filteredSalons.map((salon) => {
                    const dist = salon.coordinates?.lat && userLocation
                      ? calculateDistance(userLocation.lat, userLocation.lng, salon.coordinates.lat, salon.coordinates.lng)
                      : null;
                    
                    return (
                        <motion.div 
                          key={salon._id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-xl hover:border-pink-200 transition-all group flex flex-col sm:flex-row gap-6"
                        >
                           <div className="w-full sm:w-44 h-44 rounded-2xl overflow-hidden shrink-0 shadow-lg relative">
                              <img src={salon.images?.[0] || 'https://via.placeholder.com/300x300'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={salon.name} />
                              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                                 <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                 <span className="text-[10px] font-black">{salon.rating || 4.9}</span>
                              </div>
                              {dist !== null && (
                                 <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-pink-100">
                                   <MapPin size={12} className="text-pink-600" />
                                   <span className="text-[10px] font-black text-gray-900">{dist.toFixed(1)} km</span>
                                 </div>
                              )}
                           </div>

                       <div className="flex-1 min-w-0 flex flex-col">
                          <div className="mb-auto">
                             <p className="text-[10px] font-bold text-pink-600 uppercase tracking-widest mb-1">{salon.categories?.[0] || 'Unisex Premium'}</p>
                             <h3 className="text-xl font-black text-gray-900 group-hover:text-pink-600 transition-colors uppercase tracking-tight truncate">{salon.name}</h3>
                             <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-2 font-medium">
                                <MapPin size={14} className="text-pink-400" />
                                <span>{salon.location}, {salon.city}</span>
                             </div>
                             <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">{salon.description || 'Experience luxurious grooming at its finest with our professional team.'}</p>
                          </div>

                          <div className="flex gap-2 mt-6 pt-4 border-t border-gray-50">
                             <button 
                               onClick={() => navigate(`/salon/${salon._id}`)}
                               className="flex-1 bg-gray-900 text-white font-black text-[10px] tracking-widest uppercase py-3 rounded-xl hover:bg-gray-800 transition"
                             >
                               BOOK SEAT
                             </button>
                             {salon.mapLink && (
                               <a 
                                 href={salon.mapLink}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-pink-50 text-pink-600 border border-pink-100 font-black text-[10px] tracking-widest uppercase hover:bg-pink-600 hover:text-white transition-all shadow-sm"
                               >
                                 PRECISE MAP <ExternalLink size={14} />
                               </a>
                             )}
                          </div>
                       </div>
                    </motion.div>
                  );
                 })}
                 {filteredSalons.length === 0 && (
                   <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><MapPin size={32} className="text-gray-300" /></div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No salons found in this area</p>
                   </div>
                 )}
              </div>
           </div>

           {/* Precision Visual Map (Embed) */}
           <div className="sticky top-32 bg-white rounded-[3rem] border border-gray-100 shadow-2xl p-6 min-h-[500px] overflow-hidden group">
              <div className="aspect-[4/5] sm:aspect-square w-full h-full rounded-[2rem] overflow-hidden bg-gray-50 relative border border-gray-100">
                 {/* This iframe embeds a general search or a static placeholder for the area discovery */}
                 <iframe 
                   title="Global Service Map"
                   width="100%" 
                   height="100%" 
                   style={{ border: 0, filter: 'grayscale(0.1) contrast(1.1)' }} 
                   loading="lazy" 
                   allowFullScreen 
                   src={userLocation 
                     ? `https://www.google.com/maps/embed/v1/search?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || ''}&q=Salons&center=${userLocation.lat},${userLocation.lng}&zoom=13`
                     : `https://www.google.com/maps/embed/v1/search?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY || ''}&q=Salons+in+${selectedCity === "All" ? "Rajasthan" : selectedCity}`
                   }
                 ></iframe>
                 
                 <div className="absolute top-6 left-6 right-6">
                    <div className="bg-white/90 backdrop-blur-xl border border-white/50 p-6 rounded-[2rem] shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                       <h4 className="font-black text-gray-900 tracking-tight flex items-center gap-2">
                          <Navigation size={18} className="text-pink-600" /> Precision Search Active
                       </h4>
                       <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                          We utilize <span className="text-pink-600 font-bold">Inbuilt High-Precision Geography</span> to link every professional seat to its exact street coordinates.
                       </p>
                       <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-50">
                          <div className="w-3 h-3 bg-pink-500 rounded-full animate-ping"></div>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Real-time sync enabled</p>
                       </div>
                    </div>
                 </div>

                 {/* Interactive Navigation Overlay */}
                 <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <div className="bg-black text-white px-5 py-3 rounded-2xl text-[10px] font-black tracking-widest uppercase shadow-2xl">
                       Global View Mode
                    </div>
                    <div className="bg-white text-gray-400 w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl border border-gray-100">
                       <Info size={18} />
                    </div>
                 </div>
              </div>
           </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default MapBooking;
