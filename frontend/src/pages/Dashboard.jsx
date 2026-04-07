// frontend/src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState, useCallback } from "react";
import { SalonContext } from "../context/SalonContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const { user, token, backendUrl } = useContext(SalonContext);
  const navigate = useNavigate();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchOwnerData = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/salons/owner/my-salon`, {
          headers: { authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setSalons(res.data.salons || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "salonOwner") {
      fetchOwnerData();
    } else {
      setLoading(false);
    }
    
  }, [token, user]);

  if (loading) return <div className="min-h-screen pt-32 pb-16 px-4 text-center">Loading dashboard...</div>;

  // -- CUSTOMER VIEW (Premium Obsidian & Gold) --
  if (user?.role === "customer") {
    const points = user.loyaltyPoints || 0;
    const tier = user.loyaltyTier || "Bronze";
    const nextTierGoal = tier === "Bronze" ? 2000 : tier === "Silver" ? 5000 : 5000;
    const progress = Math.min((user.totalPointsEarned || 0) / nextTierGoal * 100, 100);

    return (
      <div className="min-h-screen pt-32 pb-24 px-6 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          
          {/* Welcome & Loyalty Section */}
          <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#111] p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] -mr-20 -mt-20 transition-all duration-1000 group-hover:bg-gold/10" />
              <div className="relative z-10">
                <p className="text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-4">Customer Experience</p>
                <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-none mb-4">
                  Welcome, <span className="text-gold italic">{user.name.split(' ')[0]}</span>
                </h1>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-lg mb-8">
                  Your elite grooming journey continues here. Access your past transformations and plan your next glow.
                </p>
                <button 
                  onClick={() => navigate("/salons")} 
                  className="bg-white text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold transition-all shadow-2xl shadow-gold/10"
                >
                  Explore New Salons
                </button>
              </div>
            </div>

            {/* Loyalty Card */}
            <div className="bg-[#111] p-8 rounded-[3rem] border border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.05)] relative overflow-hidden group">
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-[10px] font-black text-gold uppercase tracking-widest mb-1">Loyalty Tier</p>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{tier} MEMBER</h3>
                  </div>
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-gold border border-gold/20 shadow-2xl group-hover:rotate-12 transition-transform">
                    {tier === "Gold" ? "👑" : tier === "Silver" ? "💎" : "✨"}
                  </div>
               </div>

               <div className="mb-6">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                    <span>Point Balance</span>
                    <span className="text-gold">{points} / {nextTierGoal}</span>
                  </div>
                  <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/5 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-gold/50 to-gold rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
               </div>

               <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                 {tier === "Gold" 
                   ? "Elite Gold Status Achieved. Priority bookings active." 
                   : `Earn ${nextTierGoal - (user.totalPointsEarned || 0)} more points for ${tier === "Bronze" ? "Silver" : "Gold"} upgrade.`}
               </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[
               { id: 'bookings', icon: "📅", label: "My Sessions", sub: "Manage appointments", path: "/my-bookings" },
               { id: 'settings', icon: "⚙️", label: "Studio Settings", sub: "Profile & Prefs", path: "/profile" },
               { id: 'favorites', icon: "💎", label: "Elite Salons", sub: "Your frequent spots", path: "/salons" },
               { id: 'support', icon: "🤝", label: "Concierge", sub: "Instant Assistance", path: "/contact" }
             ].map(item => (
               <div 
                 key={item.id} 
                 onClick={() => navigate(item.path)}
                 className="bg-[#111]/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/5 hover:border-gold/30 hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
               >
                 <div className="text-3xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                 <h4 className="font-black text-white uppercase tracking-tight mb-1">{item.label}</h4>
                 <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{item.sub}</p>
               </div>
             ))}
          </div>

        </div>
      </div>
    );
  }

  // -- SALON OWNER VIEW (Premium) --
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-black text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 bg-[#111] p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] -mr-20 -mt-20 group-hover:bg-gold/10 transition-all duration-1000" />
          <div className="relative z-10">
            <p className="text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-4">Enterprise Control</p>
            <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-none mb-3">
              Owner <span className="text-gold italic">Lounge</span>
            </h1>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-lg">
              Manage your high-fidelity salon network. Monitor performance, staff, and elite client relations.
            </p>
          </div>
          <button 
            onClick={() => navigate("/salon/register")} 
            className="relative z-10 bg-gold text-black px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-gold/20 hover:bg-white hover:scale-105 transition-all"
          >
            + Register Workspace
          </button>
        </div>

        {salons.length === 0 ? (
          <div className="bg-[#111] rounded-[4rem] border border-dashed border-white/10 p-24 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-pulse">🏪</div>
            <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">No Active Workspaces</h2>
            <p className="text-white/30 mb-10 max-w-xs mx-auto font-medium text-sm leading-relaxed">Your professional portfolio is currently empty. Register your first studio to begin your journey.</p>
            <button 
              onClick={() => navigate("/salon/register")} 
              className="bg-white/5 text-gold border border-gold/30 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-all"
            >
              Start Registration
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* If backend returns only one salon, we show it here. If multiple, map them. */}
            {(Array.isArray(salons) ? salons : [salons]).map(salon => (
              <div key={salon._id} className="group bg-[#111] rounded-[3.5rem] border border-white/5 overflow-hidden hover:border-gold/30 hover:shadow-[0_0_50px_rgba(212,175,55,0.05)] transition-all duration-700">
                <div className="relative h-48 overflow-hidden">
                  <img src={salon.bannerImage || salon.images?.[0] || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Salon" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                  <div className="absolute top-6 right-6">
                    <span className={`text-[9px] px-5 py-2 font-black uppercase tracking-widest rounded-full border ${
                      salon.approved 
                      ? "bg-black/80 text-gold border-gold/50 shadow-2xl" 
                      : "bg-black/60 text-white/40 border-white/10"
                    }`}>
                      {salon.approved ? "Status: Active" : "Pending Approval"}
                    </span>
                  </div>
                </div>
                
                <div className="p-10">
                  <div className="mb-8">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">{salon.name}</h2>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                       <MapPin size={12} className="text-gold" /> {salon.location || 'Ajmer Elite Sector'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-black/40 p-6 rounded-3xl border border-white/5 group-hover:border-white/10 transition-all">
                      <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-2">Service Menu</p>
                      <p className="text-2xl font-black text-white">{salon.services?.length || 0} <span className="text-gold">Items</span></p>
                    </div>
                    <div className="bg-black/40 p-6 rounded-3xl border border-white/5 group-hover:border-white/10 transition-all">
                      <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mb-2">Staff Force</p>
                      <p className="text-2xl font-black text-white">{salon.artists?.length || 0} <span className="text-gold">Pros</span></p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => navigate(`/salon/manage/${salon._id}`)} 
                      className="bg-white text-black font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gold transition-all shadow-xl"
                    >
                      Management Hub
                    </button>
                    <button 
                      onClick={() => navigate(`/salon/bookings/${salon._id}`)} 
                      className="bg-white/5 text-white/60 font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
                    >
                      Live Bookings
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
