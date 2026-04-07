import React, { useContext, useEffect, useState } from "react";
import { SalonContext } from "../context/SalonContext";
import axios from "axios";
import { toast } from "react-toastify";
import UserAvatar from "../components/UserAvatar";
import { Mail, Phone, MapPin, Calendar, Edit2, Save, X, User as UserIcon } from "lucide-react";

const Profile = () => {
    const { token, backendUrl, user, setUser, loadUser, navigate } = useContext(SalonContext);

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        location: ""
    });

    useEffect(() => {
        if (!token) {
            navigate("/login?redirect=/profile");
        }
        if (user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                location: user.location || ""
            });
        }
    }, [token, user, navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.put(`${backendUrl}/api/user/profile`, formData, {
                headers: { authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success("Profile updated! ✨");
                setUser(res.data.user);
                setIsEditing(false);
            }
        } catch (err) {
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="pt-40 text-center">Loading profile...</div>;

    const memberSince = new Date(user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    return (
        <section className="pt-32 pb-24 min-h-screen bg-black text-white relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 blur-[120px] -ml-64 -mb-64" />
            
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                
                {/* Profile Header (High Fidelity) */}
                <div className="bg-[#111] rounded-[3rem] border border-white/5 overflow-hidden mb-12 shadow-2xl relative group">
                    <div className="h-40 bg-gradient-to-r from-[#111] via-gold/10 to-[#111] relative">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    </div>
                    <div className="px-10 pb-12 -mt-20 relative">
                        <div className="flex flex-col md:flex-row items-end gap-8 mb-10">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-[2.5rem] bg-black border-4 border-[#111] shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-700">
                                    <UserAvatar 
                                        name={user.name} 
                                        id={user._id} 
                                        size="xxl" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <button className="absolute bottom-1 right-1 p-2.5 bg-gold text-black rounded-2xl shadow-2xl hover:bg-white transition-all scale-90">
                                    <Edit2 size={14} />
                                </button>
                            </div>
                            <div className="flex-1 pb-2">
                                <p className="text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-3">Enterprise Profile</p>
                                <h1 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none mb-4">{user.name}</h1>
                                <div className="flex gap-3 items-center">
                                    <span className="text-white/40 font-black uppercase tracking-widest text-[9px] px-5 py-2 bg-black/40 rounded-full border border-white/5">
                                        ID: {user._id?.slice(-8).toUpperCase()}
                                    </span>
                                    <span className="text-gold font-black uppercase tracking-widest text-[9px] px-5 py-2 bg-gold/10 rounded-full border border-gold/20 shadow-2xl">
                                        {user.role === "salonOwner" ? "Proprietor" : user.role === "artist" ? "Elite Specialist" : "Gold Member"}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                                    isEditing ? "bg-white/5 text-white/40 border border-white/10 hover:bg-white/10" : "bg-white text-black hover:bg-gold shadow-2xl shadow-white/5"
                                }`}
                            >
                                {isEditing ? <><X size={16} className="inline mr-2" /> Discard</> : <><Edit2 size={16} className="inline mr-2" /> Modify Profile</>}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                            
                            {/* Personal Details (Boutique Style) */}
                            <div className="space-y-8">
                                <h3 className="text-[10px] font-black text-gold/40 uppercase tracking-[0.4em]">Official Credentials</h3>
                                
                                <div className="flex items-center gap-6 group/item">
                                    <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center text-white/20 group-hover/item:text-gold group-hover/item:border-gold/30 transition-all duration-500">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Communication Email</p>
                                        <p className="text-white font-bold text-sm tracking-tight">{user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 group/item">
                                    <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center text-white/20 group-hover/item:text-gold group-hover/item:border-gold/30 transition-all duration-500">
                                        <Phone size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Contact Backbone</p>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={formData.phone} 
                                                onChange={e => setFormData({...formData, phone: e.target.value})}
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:ring-1 focus:ring-gold outline-none mt-1 uppercase"
                                                placeholder="Enter phone"
                                            />
                                        ) : (
                                            <p className="text-white font-bold text-sm tracking-tight">{user.phone || "Not configured"}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="space-y-8">
                                <h3 className="text-[10px] font-black text-gold/40 uppercase tracking-[0.4em]">Environmental Stats</h3>
                                
                                <div className="flex items-center gap-6 group/item">
                                    <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center text-white/20 group-hover/item:text-gold group-hover/item:border-gold/30 transition-all duration-500">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Elite Sector</p>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={formData.location} 
                                                onChange={e => setFormData({...formData, location: e.target.value})}
                                                className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-bold focus:ring-1 focus:ring-gold outline-none mt-1 uppercase"
                                                placeholder="Enter location"
                                            />
                                        ) : (
                                            <p className="text-white font-bold text-sm tracking-tight">{user.location || "Sector Not Set"}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center text-white/20">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Inducted Since</p>
                                        <p className="text-white font-bold text-sm tracking-tight uppercase">{memberSince}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-12 pt-10 border-t border-white/5 flex justify-end">
                                <button 
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className="bg-gold text-black px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-white transition-all shadow-2xl shadow-gold/10 disabled:opacity-50"
                                >
                                    {loading ? "Synchronizing..." : <><Save size={18} /> Push Updates</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dashboard Navigation Grid (Premium Layout) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div 
                        onClick={() => navigate("/my-bookings")}
                        className="bg-[#111] p-8 rounded-[3rem] border border-white/5 hover:border-gold/30 hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
                    >
                        <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-500 text-gold border border-gold/10">
                            <Calendar size={24} />
                        </div>
                        <h4 className="font-black text-white text-xl uppercase tracking-tight mb-2">My Sessions</h4>
                        <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest leading-relaxed">Manage your premium reservations and service history.</p>
                    </div>
                    
                    {user.role === "salonOwner" && (
                        <div 
                            onClick={() => navigate("/dashboard")}
                            className="bg-[#111] p-8 rounded-[3rem] border border-white/5 hover:border-gold/30 hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
                        >
                            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-500 text-gold border border-gold/10">
                                <Scissors size={24} />
                            </div>
                            <h4 className="font-black text-white text-xl uppercase tracking-tight mb-2">Owner Lounge</h4>
                            <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest leading-relaxed">Manage specialists, services, and live traffic analytics.</p>
                        </div>
                    )}

                    {(user.role === "artist" || user.role === "salonOwner") && (
                        <div 
                            onClick={() => navigate("/artist-dashboard")}
                            className="bg-[#111] p-8 rounded-[3rem] border border-white/5 hover:border-gold/30 hover:-translate-y-2 transition-all duration-500 cursor-pointer group"
                        >
                            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition duration-500 text-gold border border-gold/10">
                                <Sparkles size={24} />
                            </div>
                            <h4 className="font-black text-white text-xl uppercase tracking-tight mb-2">Workspace</h4>
                            <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest leading-relaxed">Update professional availability and live workstation statuses.</p>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
};

export default Profile;