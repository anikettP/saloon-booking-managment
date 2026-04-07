// frontend/src/pages/CustomerDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { SalonContext } from "../context/SalonContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  XSquare, 
  Scissors, 
  ChevronRight, 
  LayoutDashboard,
  User,
  Star
} from "lucide-react";

const CustomerDashboard = () => {
  const { apiBase, token, user } = useContext(SalonContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchBookings();
  }, [token]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`${apiBase}/bookings/my`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) setBookings(res.data.bookings);
    } catch {}
    finally { setLoading(false); }
  };

  const upcoming = bookings.filter(b => ["pending", "confirmed"].includes(b.status));
  const completedCount = bookings.filter(b => b.status === "completed").length;

  return (
    <div className="min-h-screen pt-40 pb-24 bg-[#FFFBFA] text-rose-950 font-outfit selection:bg-rose-100">
      <div className="max-w-6xl mx-auto px-6 sm:px-12">
        
        {/* Welcome Block */}
        <div className="mb-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 text-rose-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4">
              <Sparkles size={16} className="animate-pulse" /> Client Experience Hub
            </div>
            <h1 className="text-5xl font-black text-rose-950 uppercase tracking-tighter leading-none">
              Welcome Back, <span className="text-rose-600 italic underline decoration-rose-200 underline-offset-8">{user?.name || "Member"}</span>
            </h1>
            <p className="text-rose-950/40 mt-6 font-black uppercase tracking-[0.4em] text-[10px]">Your curated journey through the Book.My.Glow network</p>
          </div>
          <button
            onClick={() => navigate("/salons")}
            className="bg-rose-600 text-white px-10 py-5 rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-500/20 flex items-center gap-3 active:scale-95 group"
          >
            <Scissors size={18} className="group-hover:rotate-12 transition-transform" /> New Ritual
          </button>
        </div>

        {/* Analytic Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatCard label="Rituals Managed" value={bookings.length} icon={<LayoutDashboard size={20} />} />
          <StatCard label="Active Orders" value={upcoming.length} icon={<Calendar size={20} />} />
          <StatCard label="Finalized" value={completedCount} icon={<CheckCircle2 size={20} />} />
          <StatCard label="Nullified" value={bookings.filter(b => b.status === "cancelled").length} icon={<XSquare size={20} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Upcoming Section (Premium Card) */}
          <div className="lg:col-span-2 bg-white rounded-[3.5rem] border border-rose-50 shadow-2xl shadow-rose-500/5 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 blur-3xl -mr-32 -mt-32 opacity-50" />
            
            <div className="p-10 border-b border-rose-50 flex justify-between items-center relative z-10">
              <h2 className="text-xl font-black text-rose-950 uppercase tracking-tight">Active <span className="text-rose-600 italic">Protocols</span></h2>
              <Link to="/my-bookings" className="text-[10px] font-black text-rose-600 bg-rose-50 px-5 py-2 rounded-full border border-rose-100 hover:bg-rose-600 hover:text-white transition-all uppercase tracking-widest">Global Log →</Link>
            </div>

            <div className="flex-1 p-4 relative z-10">
              {loading ? (
                <div className="p-6 space-y-6">
                  {[1, 2].map(i => <div key={i} className="h-20 bg-rose-50/50 rounded-3xl animate-pulse" />)}
                </div>
              ) : upcoming.length === 0 ? (
                <div className="py-24 text-center">
                  <div className="text-6xl mb-6 opacity-10">📅</div>
                  <p className="text-rose-950/20 font-black uppercase tracking-[0.4em] text-[11px]">No Active Occupancy Found</p>
                  <Link to="/salons" className="text-rose-600 font-black uppercase tracking-widest text-[9px] mt-4 block underline decoration-rose-200 underline-offset-4">Browse Signature Collection</Link>
                </div>
              ) : (
                <div className="divide-y divide-rose-50">
                  {upcoming.slice(0, 4).map(b => (
                    <div key={b._id} className="p-6 flex items-center gap-6 hover:bg-rose-50/30 rounded-[2rem] transition-all group cursor-pointer" onClick={() => navigate('/my-bookings')}>
                      <div className="w-14 h-14 rounded-2xl bg-rose-50 flex flex-col items-center justify-center text-rose-600 border border-rose-100 shadow-xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-500">
                        <span className="text-xs font-black leading-none">{new Date(b.date).getDate()}</span>
                        <span className="text-[8px] font-black uppercase tracking-tighter mt-1">{new Date(b.date).toLocaleString('default', { month: 'short' })}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-rose-950 uppercase tracking-tight text-base group-hover:text-rose-600 transition-colors uppercase">{b.salon?.name}</p>
                        <p className="text-[10px] text-rose-950/40 font-black uppercase tracking-widest mt-1 uppercase leading-none">{b.service?.name || b.serviceName} · {b.timeSlot}</p>
                      </div>
                      <div className={`text-[9px] px-5 py-2 rounded-full font-black uppercase tracking-widest leading-none ${
                        b.status === "confirmed" ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20" : "bg-rose-50 text-rose-600 border border-rose-100"
                      }`}>
                        {b.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Quick Actions */}
          <div className="space-y-6">
             <QuickActionCard 
                title="Signature Styles" 
                desc="Browse the prestige network" 
                icon={<Star size={20} />} 
                path="/salons" 
                color="bg-rose-600" 
             />
             <QuickActionCard 
                title="Order Archive" 
                desc="Manage your registry history" 
                icon={<LayoutDashboard size={20} />} 
                path="/my-bookings" 
                color="bg-rose-950" 
             />
             <QuickActionCard 
                title="Legal Profile" 
                desc="Sync your personal credentials" 
                icon={<User size={20} />} 
                path="/profile" 
                color="bg-rose-100 text-rose-950" 
             />
             
             {/* Loyalty Indicator */}
             <div className="bg-rose-950 p-10 rounded-[3rem] text-white overflow-hidden relative group mt-10 shadow-2xl shadow-rose-950/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl" />
                <p className="text-[9px] font-black text-rose-100/30 uppercase tracking-[0.4em] mb-4">Elite Tier Status</p>
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-rose-400">
                      <Sparkles size={24} />
                   </div>
                   <h4 className="text-2xl font-black uppercase tracking-tighter">Gold <span className="text-rose-400 italic">Signature</span></h4>
                </div>
                <div className="space-y-3">
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-600 w-3/4 rounded-full shadow-[0_0_15px_rgba(225,29,72,0.5)]" />
                   </div>
                   <p className="text-[9px] font-black text-rose-100/20 uppercase tracking-widest text-right">240 Points to Elite Tier</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => (
  <div className="bg-white rounded-[2.5rem] p-8 border border-rose-50 shadow-2xl shadow-rose-500/5 hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:rotate-12 transition-transform duration-500">
      {icon}
    </div>
    <div className="text-3xl font-black text-rose-950 tracking-tighter mb-1 leading-none">{value}</div>
    <div className="text-[9px] text-rose-950/20 font-black uppercase tracking-widest uppercase">{label}</div>
  </div>
);

const QuickActionCard = ({ title, desc, icon, path, color }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="w-full bg-white rounded-[2.5rem] border border-rose-50 p-8 text-left hover:shadow-2xl hover:border-rose-300 transition-all group flex items-start gap-6 relative overflow-hidden"
    >
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-xl group-hover:rotate-12 transition-transform duration-500 shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-black text-rose-950 uppercase tracking-tight text-base group-hover:text-rose-600 transition-colors uppercase">{title}</p>
        <p className="text-[10px] text-rose-950/30 font-black uppercase tracking-widest mt-1 uppercase leading-none">{desc}</p>
      </div>
      <ChevronRight size={18} className="text-rose-100 group-hover:text-rose-600 transition-colors mt-1" />
    </button>
  );
};

export default CustomerDashboard;
