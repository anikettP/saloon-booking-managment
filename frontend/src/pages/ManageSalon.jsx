import React, { useContext, useEffect, useState } from "react";
import { SalonContext } from "../context/SalonContext";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Camera, MapPin, Users, Scissors, Save, Plus, Trash2, ArrowLeft, BarChart3, TrendingUp, Wallet, Star, Clock, Sparkles, Calendar } from "lucide-react";

const ManageSalon = () => {
  const { salonId } = useParams();
  const { token, backendUrl } = useContext(SalonContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("basics");
  const [loading, setLoading] = useState(true);
  const [salon, setSalon] = useState(null);

  // Forms State
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    phone: "",
    location: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    description: ""
  });
  
  const [services, setServices] = useState([]);
  const [artists, setArtists] = useState([]);
  
  // New Item Inputs
  const [newArtistEmail, setNewArtistEmail] = useState("");
  const [newSvc, setNewSvc] = useState({ name: "", price: "", duration: "", category: "Hair" });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [ownerReply, setOwnerReply] = useState("");
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [updatingBooking, setUpdatingBooking] = useState(null);

  useEffect(() => {
    if (!token) navigate("/login");
    fetchSalonData();
  }, [salonId, token]);

  const fetchSalonData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/salons/owner/my-salon`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const s = res.data.salon;
        setSalon(s);
        setBasicInfo({
          name: s.name || "",
          phone: s.phone || "",
          location: s.location || "",
          address: s.address || "",
          city: s.city || "",
          state: s.state || "",
          pincode: s.pincode || "",
          description: s.description || ""
        });
        setServices(res.data.services || []);
        setArtists(s.artists || []);
      }
    } catch (err) {
      toast.error("Cloud not load salon data");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBasics = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${backendUrl}/api/salons/${salon._id}`, basicInfo, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Details updated! 🎉");
      }
    } catch {
      toast.error("Failed to update details");
    }
  };

  const handleAddArtist = async () => {
    if (!newArtistEmail) return;
    try {
      const res = await axios.post(`${backendUrl}/api/salons/artist/add`, 
        { salonId: salon._id, artistEmail: newArtistEmail },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Artist added!");
        setArtists([...artists, res.data.artist]);
        setNewArtistEmail("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "User not found or error adding artist");
    }
  };

  const handleAddService = async () => {
    if (!newSvc.name || !newSvc.price) return;
    try {
      const res = await axios.post(`${backendUrl}/api/services`, 
        { ...newSvc, salonId: salon._id },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Service added!");
        setServices([...services, res.data.service]);
        setNewSvc({ name: "", price: "", duration: "60", category: "Hair" });
      }
    } catch {
      toast.error("Error adding service");
    }
  };

  const handleDeleteService = async (id) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/services/${id}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setServices(services.filter(s => s._id !== id));
        toast.success("Deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/reviews/dashboard`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) setReviews(res.data.reviews);
    } catch {
      console.error("Failed to fetch reviews");
    }
  }, [backendUrl, token]);

  const handleReply = async (reviewId) => {
    if (!ownerReply.trim()) return;
    try {
      const res = await axios.post(`${backendUrl}/api/reviews/reply/${reviewId}`, { ownerReply }, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Reply posted!");
        setOwnerReply("");
        setReplyingTo(null);
        fetchReviews();
      }
    } catch {
      toast.error("Failed to post reply");
    }
  };

  const fetchBookings = useCallback(async () => {
    try {
      setBookingLoading(true);
      const res = await axios.get(`${backendUrl}/api/bookings/salon/${salonId}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) setBookings(res.data.bookings);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setBookingLoading(false);
    }
  }, [backendUrl, salonId, token]);

  const updateBookingStatus = async (id, status) => {
    try {
      setUpdatingBooking(id);
      const res = await axios.put(`${backendUrl}/api/bookings/${id}/status`, { status }, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Status updated");
        fetchBookings();
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingBooking(null);
    }
  };

  const confirmPayment = async (bookingId, method = "Online") => {
    try {
      const res = await axios.put(`${backendUrl}/api/payments/booking/status/${bookingId}`, { 
        paymentStatus: "paid",
        paymentMethod: method 
      }, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(`Payment confirmed via ${method}`);
        setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, paymentStatus: 'paid', paymentMethod: method } : b));
      }
    } catch {
      toast.error("Failed to update payment");
    }
  };

  const fetchInsights = useCallback(async () => {
    try {
      setInsightsLoading(true);
      const res = await axios.get(`${backendUrl}/api/analytics/salon/${salonId}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) setInsights(res.data.stats);
    } catch {
      toast.error("Failed to load business insights");
    } finally {
      setInsightsLoading(false);
    }
  }, [backendUrl, salonId, token]);

  const handlePrint = (booking) => {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date(booking.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' });
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill - \${booking.customerName}</title>
          <style>
             body { font-family: 'Inter', sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; }
             .card { max-width: 400px; margin: 0 auto; border: 1px solid #f3f4f6; padding: 32px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
             .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #fdf2f8; padding-bottom: 20px; }
             .brand { color: #db2777; font-weight: 800; font-size: 24px; letter-spacing: -0.025em; }
             .salon { font-size: 14px; font-weight: 600; color: #4b5563; }
             .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; }
             .l { color: #6b7280; }
             .v { font-weight: 700; text-align: right; }
             .box { background: #f9fafb; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #f3f4f6; }
             .total { border-top: 1px dashed #e5e7eb; padding-top: 16px; margin-top: 16px; }
             .amount { font-size: 24px; font-weight: 800; color: #db2777; }
             .badge { padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: 700; }
             .paid { background: #dcfce7; color: #166534; }
             .unpaid { background: #fee2e2; color: #991b1b; }
             .footer { text-align: center; margin-top: 32px; font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <div class="brand">Book.My.Glow</div>
              <div class="salon">\${booking.salon?.name || 'Your Salon'}</div>
              <div style="font-size: 9px; color: #9ca3af; margin-top: 4px;">#\${booking._id.toString().slice(-8).toUpperCase()}</div>
            </div>
            <div class="row"><span class="l">Date</span><span class="v">\${dateStr}</span></div>
            <div class="row"><span class="l">Customer</span><span class="v">\${booking.customerName}</span></div>
            <div class="row"><span class="l">Artist</span><span class="v">\${booking.artist?.name || 'Assigned Professional'}</span></div>
            <div class="box">
              <div class="row" style="margin:0"><span class="l">Service</span><span class="v">\${booking.serviceName}</span></div>
              <div class="row" style="margin:4px 0 0 0"><span class="l">Time Slot</span><span class="v">\${booking.timeSlot}</span></div>
            </div>
            <div class="row"><span class="l">Payment Status</span><span class="badge \${booking.paymentStatus === 'paid' ? 'paid' : 'unpaid'}">\${booking.paymentStatus.toUpperCase()}</span></div>
            <div class="row"><span class="l">Payment Method</span><span class="v">\${booking.paymentMethod}</span></div>
            <div class="row total">
              <span class="l" style="font-size: 16px; font-weight: 700; color: #111;">Total Amount</span>
              <span class="v amount">₹\${booking.price}</span>
            </div>
            <div class="footer">Thank you for your visit!<br>Generated via Book.My.Glow</div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    if (activeTab === "reviews") fetchReviews();
    if (activeTab === "insights") fetchInsights();
    if (activeTab === "bookings") fetchBookings();
  }, [activeTab, fetchReviews, fetchInsights, fetchBookings]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach(file => formData.append("images", file));

    try {
      toast.info("Uploading images...");
      const res = await axios.put(`${backendUrl}/api/salons/${salon._id}`, formData, {
        headers: { 
          authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      if (res.data.success) {
        setSalons(res.data.salons || (res.data.salon ? [res.data.salon] : []));
        toast.success("Photos updated!");
      }
    } catch {
      toast.error("Upload failed");
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-40 bg-[#FFFBFA] flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin shadow-2xl shadow-rose-500/10" />
      <p className="text-rose-600 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Syncing Management Hub...</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-[#FFFBFA] text-rose-950">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate("/dashboard")} 
          className="flex items-center gap-3 text-rose-950/40 hover:text-rose-600 font-black text-[10px] uppercase tracking-[0.3em] mb-12 transition group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Return to Dashboard
        </button>

        <div className="bg-white rounded-[4rem] shadow-2xl shadow-rose-500/5 overflow-hidden border border-rose-50 flex flex-col lg:flex-row min-h-[800px] relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/5 blur-[120px] -mr-40 -mt-20 pointer-events-none" />
          
          {/* Sidebar Tabs (Premium Light) */}
          <div className="w-full lg:w-80 bg-rose-50/30 backdrop-blur-xl border-r border-rose-50 p-10 flex lg:flex-col gap-3 overflow-x-auto whitespace-nowrap lg:whitespace-normal relative z-10">
            <div className="mb-10 px-4 hidden lg:block">
               <p className="text-rose-600 font-black uppercase tracking-[0.4em] text-[8px] mb-2 text-center lg:text-left">Salon Portfolio</p>
               <h2 className="text-2xl font-black text-rose-950 uppercase tracking-tight text-center lg:text-left line-clamp-2">{salon?.name || 'Workspace'}</h2>
            </div>
            
            {[
              { id: "basics", icon: MapPin, label: "Core Profile" },
              { id: "bookings", icon: Calendar, label: "Live Bookings" },
              { id: "services", icon: Scissors, label: "Service Menu" },
              { id: "artists", icon: Users, label: "Elite Team" },
              { id: "photos", icon: Camera, label: "Gallery" },
              { id: "time", icon: Clock, label: "Schedule" },
              { id: "reviews", icon: Star, label: "Feedback" },
              { id: "insights", icon: BarChart3, label: "Intelligence" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 border ${
                  activeTab === tab.id 
                  ? "bg-rose-600 text-white border-rose-600 shadow-[0_0_40px_rgba(225,29,72,0.15)] scale-[1.02]" 
                  : "text-rose-950/30 border-transparent hover:border-rose-100 hover:text-rose-600"
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area (Premium Light) */}
          <div className="flex-1 p-10 lg:p-16 relative z-10 overflow-y-auto max-h-[800px] no-scrollbar bg-white">
            
            {/* BASICS TAB */}
            {activeTab === "basics" && (
              <form onSubmit={handleUpdateBasics} className="space-y-10 animate-fade-in">
                <div className="border-b border-rose-50 pb-8">
                   <h3 className="text-4xl font-black text-rose-950 uppercase tracking-tight">Salon <span className="text-rose-600 italic">Identity</span></h3>
                   <p className="text-rose-950/40 text-[10px] font-black uppercase tracking-widest mt-2">Manage your public facing professional brand</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-full group">
                    <label className="block text-[10px] font-black text-rose-950/30 uppercase tracking-[0.3em] mb-4 group-focus-within:text-rose-600 transition">Display Name</label>
                    <input 
                      type="text" value={basicInfo.name} onChange={e => setBasicInfo({...basicInfo, name: e.target.value})}
                      className="w-full bg-[#FFFBFA] border border-rose-100 rounded-3xl px-8 py-5 text-rose-950 font-black text-xs uppercase tracking-widest focus:ring-1 focus:ring-rose-600 outline-none transition-all group-hover:border-rose-300" required 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-rose-950/30 uppercase tracking-[0.3em] mb-4">District / Area</label>
                    <input 
                      type="text" value={basicInfo.location} onChange={e => setBasicInfo({...basicInfo, location: e.target.value})}
                      className="w-full bg-[#FFFBFA] border border-rose-100 rounded-3xl px-8 py-5 text-rose-950 font-black text-xs uppercase tracking-widest focus:ring-1 focus:ring-rose-600 outline-none transition-all" placeholder="e.g. Malviya Nagar" required 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-rose-950/30 uppercase tracking-[0.3em] mb-4">City Hub</label>
                    <input type="text" value={basicInfo.city} onChange={e => setBasicInfo({...basicInfo, city: e.target.value})} className="w-full bg-[#FFFBFA] border border-rose-100 rounded-3xl px-8 py-5 text-rose-950 font-black text-xs uppercase tracking-widest focus:ring-1 focus:ring-rose-600 outline-none transition-all" />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-[10px] font-black text-rose-600/60 uppercase tracking-[0.3em] mb-4">Geospatial Link (Maps)</label>
                    <input 
                      type="url" value={basicInfo.mapLink} onChange={e => setBasicInfo({...basicInfo, mapLink: e.target.value})}
                      className="w-full bg-rose-50/30 border border-rose-200 rounded-3xl px-8 py-5 text-rose-600 font-black text-xs uppercase tracking-widest focus:ring-1 focus:ring-rose-600 outline-none transition-all" 
                      placeholder="https://maps.app.goo.gl/..."
                    />
                    <p className="text-[9px] text-rose-950/20 mt-3 font-black uppercase tracking-widest">Connect to global navigation for the "Find Nearby" experience.</p>
                  </div>
                <div>
                  <label className="block text-[10px] font-black text-rose-950/30 uppercase tracking-[0.3em] mb-4">Support Contact</label>
                  <input 
                    type="text" value={basicInfo.phone} onChange={e => setBasicInfo({...basicInfo, phone: e.target.value})}
                    className="w-full bg-[#FFFBFA] border border-rose-100 rounded-3xl px-8 py-5 text-rose-950 font-black text-xs uppercase tracking-widest focus:ring-1 focus:ring-rose-600 outline-none transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-rose-950/30 uppercase tracking-[0.3em] mb-4">Postal Code</label>
                  <input type="text" value={basicInfo.pincode} onChange={e => setBasicInfo({...basicInfo, pincode: e.target.value})} className="w-full bg-[#FFFBFA] border border-rose-100 rounded-3xl px-8 py-5 text-rose-950 font-black text-xs uppercase tracking-widest focus:ring-1 focus:ring-rose-600 outline-none transition-all" />
                </div>
                <div className="col-span-full">
                  <label className="block text-[10px] font-black text-rose-950/30 uppercase tracking-[0.3em] mb-4 group-focus-within:text-rose-600 transition">Studio Physical Address</label>
                  <textarea 
                    value={basicInfo.address} onChange={e => setBasicInfo({...basicInfo, address: e.target.value})}
                    className="w-full bg-[#FFFBFA] border border-rose-100 rounded-3xl px-8 py-5 text-rose-950 font-medium text-xs focus:ring-1 focus:ring-rose-600 outline-none transition-all resize-none shadow-inner" rows={2}
                  />
                </div>
              </div>
              <button type="submit" className="bg-rose-600 text-white px-12 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-2xl shadow-rose-500/10 flex items-center gap-3">
                <Save size={18} /> Update Workspace Registry
              </button>
            </form>
          )}

            {/* BUSINESS HOURS TAB (Premium Light) */}
            {activeTab === "time" && (
              <div className="space-y-12 animate-fade-in">
                <div className="border-b border-rose-50 pb-8">
                   <h3 className="text-4xl font-black text-rose-950 uppercase tracking-tight">Timeline <span className="text-rose-600 italic">Control</span></h3>
                   <p className="text-rose-950/40 text-[10px] font-black uppercase tracking-widest mt-2">Manage your operating schedule and slot intervals</p>
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-[3rem] p-10 flex gap-6 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-rose-200/20 blur-3xl -mr-10 -mt-10 group-hover:bg-rose-200/40 transition-all duration-1000" />
                   <div className="text-rose-600 mt-1"><Clock size={24} /></div>
                   <div className="relative z-10">
                     <p className="text-[10px] text-rose-600 font-black uppercase tracking-[0.3em] mb-2 font-black">Capacity Advisory</p>
                     <p className="text-sm text-rose-950/60 font-medium leading-relaxed uppercase tracking-[0.1em] text-[11px]">Adjust your studio availability below. Changes here synchronize instantly with customer booking timelines.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="bg-white p-10 rounded-[3.5rem] border border-rose-50 shadow-xl shadow-rose-500/5 space-y-8">
                      <p className="text-[10px] font-black text-rose-950/20 uppercase tracking-[0.4em] border-b border-rose-50 pb-4">Standard Shift</p>
                      <div className="grid grid-cols-2 gap-6">
                         <div>
                            <label className="block text-[8px] font-black text-rose-600 uppercase tracking-widest mb-3">Facility Opens</label>
                            <input 
                              type="time" value={basicInfo.workingHours?.start || "09:00"} 
                              onChange={e => setBasicInfo({...basicInfo, workingHours: {...basicInfo.workingHours, start: e.target.value}})}
                              className="w-full bg-[#FFFBFA] border border-rose-100 rounded-2xl px-6 py-4 font-black text-rose-950 text-xs tracking-widest focus:ring-1 focus:ring-rose-600 outline-none"
                            />
                         </div>
                         <div>
                            <label className="block text-[8px] font-black text-rose-600 uppercase tracking-widest mb-3">Facility Closes</label>
                            <input 
                              type="time" value={basicInfo.workingHours?.end || "20:00"} 
                              onChange={e => setBasicInfo({...basicInfo, workingHours: {...basicInfo.workingHours, end: e.target.value}})}
                              className="w-full bg-[#FFFBFA] border border-rose-100 rounded-2xl px-6 py-4 font-black text-rose-950 text-xs tracking-widest focus:ring-1 focus:ring-rose-600 outline-none"
                            />
                         </div>
                      </div>
                      <div className="pt-4 flex items-center justify-between">
                         <span className="text-[9px] text-rose-950/20 font-black uppercase tracking-widest">Protocol</span>
                         <span className="text-rose-950 text-[10px] font-black uppercase tracking-widest">Fixed 60M Intervals</span>
                      </div>
                   </div>

                   <div className="bg-white p-10 rounded-[3.5rem] border border-rose-50 shadow-xl shadow-rose-500/5 space-y-8">
                      <p className="text-[10px] font-black text-rose-950/20 uppercase tracking-[0.4em] border-b border-rose-50 pb-4">Operating Days</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-3 gap-3">
                         {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                            <label key={day} className="cursor-pointer group flex flex-col">
                               <input 
                                 type="checkbox" className="hidden" checked={basicInfo.workingDays?.includes(day)}
                                 onChange={() => {
                                    const current = basicInfo.workingDays || [];
                                    const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
                                    setBasicInfo({...basicInfo, workingDays: updated});
                                 }}
                               />
                               <div className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 border ${
                                 basicInfo.workingDays?.includes(day) 
                                 ? "bg-rose-600 text-white border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.1)]" 
                                 : "bg-white text-rose-950/20 border-rose-100 hover:border-rose-300"
                               }`}>
                                 <span className="text-[10px] font-black uppercase tracking-widest mb-1">{day.substring(0,3)}</span>
                                 <div className={`w-1 h-1 rounded-full ${basicInfo.workingDays?.includes(day) ? "bg-white" : "bg-rose-100"}`} />
                               </div>
                            </label>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="pt-10">
                   <button onClick={handleUpdateBasics} className="bg-white text-rose-600 border border-rose-200 px-12 py-5 rounded-[2rem] font-black text-[11px] tracking-[0.2em] uppercase hover:bg-rose-600 hover:text-white transition-all shadow-2xl">
                      Synchronize Temporal Data
                   </button>
                </div>
              </div>
            )}

            {/* PHOTOS TAB (Premium Light) */}
            {activeTab === "photos" && (
              <div className="animate-fade-in space-y-12">
                <div className="border-b border-rose-50 pb-8">
                   <h3 className="text-4xl font-black text-rose-950 uppercase tracking-tight">Gallery <span className="text-rose-600 italic">Curator</span></h3>
                   <p className="text-rose-950/40 text-[10px] font-black uppercase tracking-widest mt-2">Manage your visual portfolio and showcase your work</p>
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-[3rem] p-10 flex items-start gap-6 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-rose-200/20 blur-3xl -mr-10 -mt-10 group-hover:bg-rose-200/40 transition-all duration-1000" />
                   <div className="bg-rose-100 p-3 rounded-2xl text-rose-600"><Sparkles size={24} /></div>
                   <div className="relative z-10">
                     <p className="text-[10px] text-rose-600 font-black uppercase tracking-[0.3em] mb-2">Global Showcase Activation</p>
                     <p className="text-sm text-rose-950/60 font-medium leading-relaxed uppercase tracking-[0.1em] text-[11px]">Images uploaded here are automatically featured in the <span className="text-rose-600 font-bold">Community Transformation Gallery</span>, increasing your brand's reach.</p>
                   </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-rose-950/20 uppercase tracking-[0.4em]">Portfolio Assets</p>
                  <label className="bg-rose-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-rose-700 transition shadow-2xl shadow-rose-500/10">
                    <input type="file" multiple onChange={handleImageUpload} className="hidden" />
                    + Upload Assets
                  </label>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {salon.images?.map((img, i) => (
                    <div key={i} className="aspect-square rounded-[2rem] overflow-hidden border border-rose-50 shadow-2xl relative group hover:border-rose-300 transition-all duration-700">
                      <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Salon" />
                      <div className="absolute inset-0 bg-gradient-to-t from-rose-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                  {(!salon.images || salon.images.length === 0) && (
                    <div className="col-span-full py-24 text-center bg-[#FFFBFA] rounded-[4rem] border border-dashed border-rose-100">
                      <Camera size={40} className="mx-auto text-rose-950/10 mb-6" />
                      <p className="text-rose-950/20 font-black uppercase tracking-[0.4em] text-[10px]">No visual assets captured</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SERVICES TAB (Premium) */}
            {activeTab === "services" && (
              <div className="animate-fade-in space-y-12">
                <div className="border-b border-white/5 pb-8">
                   <h3 className="text-4xl font-black text-white uppercase tracking-tight">Service <span className="text-gold italic">Architecture</span></h3>
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">Design your elite treatment menu and investment options</p>
                </div>

                <div className="bg-[#0A0A0A] p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                  <p className="text-[10px] font-black text-gold/60 uppercase tracking-[0.3em] mb-8">Deploy New Treatment</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <input 
                      type="text" placeholder="Treatment Name" value={newSvc.name} onChange={e => setNewSvc({...newSvc, name: e.target.value})}
                      className="bg-black border border-white/5 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white focus:ring-1 focus:ring-gold outline-none"
                    />
                    <input 
                      type="number" placeholder="Investment (₹)" value={newSvc.price} onChange={e => setNewSvc({...newSvc, price: e.target.value})}
                      className="bg-black border border-white/5 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white focus:ring-1 focus:ring-gold outline-none"
                    />
                    <input 
                      type="number" placeholder="Duration (min)" value={newSvc.duration} onChange={e => setNewSvc({...newSvc, duration: e.target.value})}
                      className="bg-black border border-white/5 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-white focus:ring-1 focus:ring-gold outline-none"
                    />
                    <button onClick={handleAddService} className="bg-gold text-black rounded-2xl font-black py-4 text-[10px] uppercase tracking-widest hover:bg-white transition shadow-2xl shadow-gold/10">
                      Add to Menu
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6">Active Treatment Registry</p>
                   {services.map(svc => (
                    <div key={svc._id} className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between hover:border-gold/30 hover:bg-black/60 transition-all duration-500 group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-gold/5 rounded-2xl flex items-center justify-center text-gold border border-gold/10 font-black text-sm">
                           {svc.name?.[0]}
                        </div>
                        <div>
                          <p className="font-black text-lg text-white uppercase tracking-tight group-hover:text-gold transition-colors">{svc.name}</p>
                          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">₹{svc.price} · {svc.duration} Minutes</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteService(svc._id)} className="p-4 text-white/20 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {services.length === 0 && (
                    <div className="text-center py-24 bg-black/40 rounded-[4rem] border border-dashed border-white/5">
                      <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[10px]">Registry is currently offline</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ARTISTS TAB (Premium Light) */}
            {activeTab === "artists" && (
              <div className="animate-fade-in space-y-12">
                <div className="border-b border-rose-50 pb-8">
                   <h3 className="text-4xl font-black text-rose-950 uppercase tracking-tight">Elite <span className="text-rose-600 italic">Specialists</span></h3>
                   <p className="text-rose-950/40 text-[10px] font-black uppercase tracking-widest mt-2">Manage your professional force and assign artistic talent</p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-rose-50 shadow-2xl shadow-rose-500/5 relative overflow-hidden group">
                  <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-[0.3em] mb-8">Deploy Professional Talent</p>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <input 
                      type="email" placeholder="Professional Email Address" value={newArtistEmail} onChange={e => setNewArtistEmail(e.target.value)}
                      className="flex-1 bg-[#FFFBFA] border border-rose-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-rose-950 focus:ring-1 focus:ring-rose-600 outline-none"
                    />
                    <button 
                      onClick={handleAddArtist} 
                      className="bg-rose-600 text-white px-12 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition shadow-2xl shadow-rose-500/10"
                    >
                      + Assign Artist
                    </button>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                     <span className="text-rose-600 animate-pulse">⚡</span>
                     <p className="text-[9px] text-rose-950/30 font-black uppercase tracking-widest italic leading-none">Note: Talent must have a verified Book.My.Glow account registered prior to assignment.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {artists.map(artist => (
                    <div key={artist._id} className="bg-white border border-rose-50 rounded-[2.5rem] p-8 flex items-center gap-6 hover:border-rose-200 transition-all duration-500 group shadow-sm">
                      <div className="w-16 h-16 bg-rose-50 text-rose-600 border border-rose-100 rounded-[1.5rem] flex items-center justify-center font-black text-xl group-hover:bg-rose-600 group-hover:text-white transition-all duration-700">
                        {artist.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-lg text-rose-950 uppercase tracking-tight group-hover:text-rose-600 transition-colors leading-none">{artist.name}</p>
                        <p className="text-[9px] text-rose-950/30 font-black uppercase tracking-widest mt-2 truncate">{artist.email}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <span className="text-[8px] px-3 py-1 bg-rose-50 text-rose-600 font-black uppercase tracking-widest rounded-full border border-rose-100 shadow-xl">Verified</span>
                         <span className="text-[7px] text-rose-950/20 font-black uppercase tracking-[0.2em]">Active Duty</span>
                      </div>
                    </div>
                  ))}
                  {artists.length === 0 && (
                    <div className="col-span-full py-24 text-center bg-[#FFFBFA] rounded-[4rem] border border-dashed border-rose-100 shadow-inner">
                      <p className="text-rose-950/20 font-black uppercase tracking-[0.4em] text-[10px]">No artists currently on force</p>
                    </div>
                  )}
                </div>
              </div>
            )}
                {/* BOOKINGS TAB (Premium Light) */}
            {activeTab === "bookings" && (
              <div className="space-y-12 animate-fade-in">
                <div className="border-b border-rose-50 pb-8 flex justify-between items-end">
                   <div>
                     <h3 className="text-4xl font-black text-rose-950 uppercase tracking-tight">Live <span className="text-rose-600 italic">Traffic</span></h3>
                     <p className="text-rose-950/40 text-[10px] font-black uppercase tracking-widest mt-2">Monitor active workstation activity</p>
                   </div>
                   <div className="bg-rose-50 px-5 py-2.5 rounded-2xl border border-rose-100 flex items-center gap-3">
                      <div className="w-2 h-2 bg-rose-600 rounded-full animate-ping" />
                      <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">{bookings.length} Verified Bookings</span>
                   </div>
                </div>

                <div className="space-y-6">
                  {bookings.map(b => (
                    <div key={b._id} className="bg-[#FFFBFA]/50 border border-rose-50 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-rose-200 hover:bg-white transition-all duration-500 group relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 left-0 w-1 h-full bg-rose-600/20" />
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                           <p className="font-black text-2xl text-rose-950 uppercase tracking-tight group-hover:text-rose-600 transition-colors leading-none">{b.serviceName}</p>
                           <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full tracking-widest ${b.paymentStatus === 'paid' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-rose-50 text-rose-950/30 border border-rose-100'}`}>
                             {b.paymentStatus === 'paid' ? 'Paid' : 'Unpaid Settlement'}
                           </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                           <div>
                            <div className="flex items-center gap-3">
                               <p className="text-[8px] font-black text-rose-950/20 uppercase tracking-widest mb-1">Clientele Status</p>
                               {b.user?.loyaltyTier && b.user.loyaltyTier !== "Bronze" && (
                                 <span className={`text-[7px] px-2 py-0.5 rounded-md font-black uppercase tracking-tighter ${b.user.loyaltyTier === 'Gold' ? 'bg-rose-600 text-white' : 'bg-rose-100 text-rose-950'}`}>
                                   {b.user.loyaltyTier} VIP
                                 </span>
                               )}
                            </div>
                            <p className="text-xs font-black text-rose-950 uppercase">{b.user?.name || b.customerName} <span className="text-rose-950/20 font-medium ml-1 text-[9px]">Verified</span></p>
                           </div>
                           <div>
                               <p className="text-[8px] font-black text-rose-950/20 uppercase tracking-widest mb-1">Time Slot</p>
                               <p className="text-xs font-black text-rose-600 uppercase tracking-widest">{b.timeSlot}</p>
                           </div>
                           <div>
                               <p className="text-[8px] font-black text-rose-950/20 uppercase tracking-widest mb-1">Investment</p>
                               <p className="text-xs font-black text-rose-950 uppercase tracking-widest">₹{b.price}</p>
                           </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap md:flex-nowrap gap-3 shrink-0">
                         <div className="relative group/sel min-w-[140px]">
                            <select 
                              value={b.status} 
                              onChange={(e) => updateBookingStatus(b._id, e.target.value)}
                              disabled={updatingBooking === b._id}
                              className="w-full bg-white border border-rose-100 rounded-2xl px-6 py-4 text-[9px] font-black text-rose-950 uppercase tracking-widest outline-none focus:ring-1 focus:ring-rose-600 cursor-pointer appearance-none group-hover/sel:border-rose-300 transition-all shadow-sm"
                            >
                              <option value="payment_pending">Pending Pmt</option>
                              <option value="pending">Requested</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Executed</option>
                              <option value="cancelled">Voided</option>
                            </select>
                         </div>
                         
                         {b.paymentStatus !== 'paid' && (
                           <div className="flex gap-2">
                             <button 
                               onClick={() => confirmPayment(b._id, "Cash")} 
                               className="bg-rose-600 text-white px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-500/20 flex items-center gap-2"
                             >
                               <Wallet size={14} /> Pay by Cash
                             </button>
                             <button 
                               onClick={() => confirmPayment(b._id, "Online")} 
                               className="bg-white text-rose-950/40 border border-rose-100 px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-rose-300 hover:text-rose-600 transition-all"
                             >
                               Confirm Pmt
                             </button>
                           </div>
                         )}
                         
                         <button 
                           onClick={() => handlePrint(b)} 
                           className="bg-white text-rose-950/40 border border-rose-100 px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-rose-300 hover:text-rose-600 transition-all"
                         >
                           Print Bill
                         </button>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="text-center py-32 bg-[#FFFBFA] rounded-[4rem] border border-dashed border-rose-100 shadow-inner">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 text-rose-200">📅</div>
                       <p className="text-rose-950/20 font-black uppercase tracking-[0.4em] text-[10px]">No active occupancy</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* REVIEWS TAB (Premium Light) */}
            {activeTab === "reviews" && (
              <div className="animate-fade-in space-y-12">
                <div className="border-b border-rose-50 pb-8 flex justify-between items-end">
                   <div>
                     <h3 className="text-4xl font-black text-rose-950 uppercase tracking-tight">Customer <span className="text-rose-600 italic">Voice</span></h3>
                     <p className="text-rose-950/40 text-[10px] font-black uppercase tracking-widest mt-2">Verified feedback from elite clientele</p>
                   </div>
                   <div className="bg-rose-600 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl shadow-rose-500/20">
                     <Star size={18} className="fill-white" />
                     <span className="font-black text-lg">{salon.averageRating || "0.0"}</span>
                   </div>
                </div>

                <div className="space-y-8">
                  {reviews.map(review => (
                    <div key={review._id} className="bg-white border border-rose-50 rounded-[3rem] p-10 hover:border-rose-200 transition-all duration-700 relative overflow-hidden group shadow-sm">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100/50 blur-3xl -mr-10 -mt-10" />
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center font-black text-xl text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all">
                            {review.user?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-lg text-rose-950 uppercase tracking-tight leading-none">{review.user?.name}</p>
                            <div className="flex gap-1 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className={i < review.rating ? "text-rose-500 fill-rose-500" : "text-rose-100"} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-[9px] text-rose-950/20 font-black uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>

                      <p className="text-md text-rose-950/60 bg-rose-50/30 p-8 rounded-[2rem] border border-rose-50 italic leading-relaxed mb-8 relative font-medium">
                        <span className="absolute top-4 left-4 text-rose-200 text-6xl font-serif">“</span>
                        {review.comment}
                      </p>

                      <div className="flex items-center justify-between mt-8 pt-8 border-t border-rose-50">
                         <div className="flex items-center gap-3 text-[9px] font-black text-rose-950/20 uppercase tracking-[0.2em]">
                            <Scissors size={14} className="text-rose-600" /> {review.booking?.serviceName} 
                         </div>
                         
                         {!review.ownerReply && replyingTo !== review._id && (
                           <button 
                             onClick={() => setReplyingTo(review._id)}
                             className="bg-white text-rose-600 border border-rose-200 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                           >
                             Post Executive Reply
                           </button>
                         )}
                      </div>

                      {replyingTo === review._id && (
                        <div className="mt-8 animate-in slide-in-from-top-4 duration-500">
                           <textarea 
                            value={ownerReply}
                            onChange={e => setOwnerReply(e.target.value)}
                            placeholder="Type your professional response..."
                            className="w-full bg-[#FFFBFA] border border-rose-100 rounded-[2rem] p-8 text-sm text-rose-950 font-medium focus:ring-1 focus:ring-rose-600 outline-none min-h-[150px] resize-none shadow-inner"
                          />
                          <div className="flex justify-end gap-4 mt-6">
                            <button onClick={() => setReplyingTo(null)} className="px-8 font-black text-[9px] text-rose-950/20 uppercase tracking-widest">Discard</button>
                            <button onClick={() => handleReply(review._id)} className="bg-rose-600 text-white px-10 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition shadow-xl shadow-rose-500/20">Publish Reply</button>
                          </div>
                        </div>
                      )}

                      {review.ownerReply && (
                        <div className="mt-8 bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] relative group/reply shadow-sm">
                          <div className="absolute top-4 right-8 text-[7px] font-black text-rose-600 uppercase tracking-[0.4em]">Corporate Response</div>
                          <p className="text-[10px] font-black text-rose-600 uppercase mb-3 tracking-widest">Management Statement:</p>
                          <p className="text-sm text-rose-950/70 italic leading-relaxed font-medium">&quot;{review.ownerReply}&quot;</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {reviews.length === 0 && (
                    <div className="py-32 text-center bg-[#FFFBFA] rounded-[4rem] border border-dashed border-rose-100 shadow-inner">
                       <p className="text-rose-950/20 font-black uppercase tracking-[0.4em] text-[10px]">No verified feedback available</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BUSINESS INSIGHTS TAB (Premium Light) */}
            {activeTab === "insights" && (
              <div className="animate-fade-in space-y-12">
                <div className="border-b border-rose-50 pb-8">
                   <h3 className="text-4xl font-black text-rose-950 uppercase tracking-tight">Business <span className="text-rose-600 italic">Intelligence</span></h3>
                   <p className="text-rose-950/40 text-[10px] font-black uppercase tracking-widest mt-2">Real-time revenue architecture & elite booking analytics</p>
                </div>

                {insightsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-[3rem] border border-rose-100 animate-pulse shadow-sm" />)}
                  </div>
                ) : insights ? (
                  <div className="space-y-12">
                    {/* Top Stats - High Fidelity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="bg-gradient-to-br from-rose-100/50 via-white to-transparent rounded-[3rem] p-10 border border-rose-100 relative overflow-hidden group/chart shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/20 blur-3xl -mr-10 -mt-10" />
                        <div className="flex justify-between items-start mb-8">
                          <div className="bg-rose-600 text-white p-3.5 rounded-2xl shadow-2xl shadow-rose-500/20"><Wallet size={24} /></div>
                          <div className="text-[8px] font-black text-rose-600 uppercase tracking-[0.4em]">Verified Yield</div>
                        </div>
                        <p className="text-[10px] font-black text-rose-600/60 uppercase tracking-[0.3em] mb-2">Net Corporate Revenue</p>
                        <h4 className="text-4xl font-black text-rose-950 tracking-tighter group-hover/chart:translate-x-2 transition-transform duration-700">₹{insights.netRevenue?.toLocaleString()}</h4>
                      </div>

                      <div className="bg-white rounded-[3rem] p-10 border border-rose-100 shadow-2xl group/chart">
                        <div className="bg-rose-50 text-rose-600 w-14 h-14 border border-rose-100 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform group-hover/chart:scale-110 duration-500"><TrendingUp size={24} /></div>
                        <p className="text-[10px] font-black text-rose-950/30 uppercase tracking-[0.3em] mb-2">Operational Success Rate</p>
                        <h4 className="text-4xl font-black text-rose-950 tracking-tighter">{insights.successRate}%</h4>
                        <div className="w-full bg-rose-50 h-2 rounded-full mt-6 overflow-hidden border border-rose-100">
                           <div className="bg-rose-600 h-full rounded-full shadow-[0_0_15px_rgba(225,29,72,0.3)]" style={{ width: `${insights.successRate}%` }} />
                        </div>
                      </div>

                      <div className="bg-white rounded-[3rem] p-10 border border-rose-100 shadow-2xl group/chart">
                        <div className="bg-rose-50 text-rose-600 w-14 h-14 border border-rose-100 rounded-2xl flex items-center justify-center mb-8 shadow-sm transition-transform group-hover/chart:scale-110 duration-500"><Users size={24} /></div>
                        <p className="text-[10px] font-black text-rose-950/30 uppercase tracking-[0.3em] mb-2">Elite Clientele Count</p>
                        <h4 className="text-4xl font-black text-rose-950 tracking-tighter">{insights.totalBookings}</h4>
                        <p className="text-[9px] text-rose-600 font-black uppercase tracking-widest mt-3 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-pulse" /> +{insights.completedCount} Successfully Executed
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                      {/* Top Services - Elite Registry */}
                      <div className="bg-white rounded-[3.5rem] p-10 border border-rose-100 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-rose-600/20" />
                        <h4 className="font-black text-rose-950 text-lg uppercase tracking-tight mb-10 border-b border-rose-50 pb-6">High-Yield Treatment Registry</h4>
                        <div className="space-y-6">
                          {insights.topServices?.map((svc, i) => (
                            <div key={i} className="flex items-center justify-between group/svc">
                               <div className="flex items-center gap-5">
                                 <span className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-[10px] font-black text-rose-600 border border-rose-100 group-hover/svc:bg-rose-600 group-hover/svc:text-white transition-all duration-500">0{i+1}</span>
                                 <span className="font-black text-rose-950 uppercase tracking-tight text-sm group-hover/svc:text-rose-600 transition-colors">{svc.name}</span>
                               </div>
                               <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-5 py-2.5 rounded-full uppercase tracking-widest shadow-sm">{svc.count} Reservations</span>
                            </div>
                          ))}
                          {(!insights.topServices || insights.topServices.length === 0) && <p className="text-rose-950/20 font-black uppercase tracking-widest text-[9px] text-center py-10">Historical Data Pending Synchronization...</p>}
                        </div>
                      </div>

                      {/* Growth Protocol - Elite Advisory */}
                      <div className="bg-white rounded-[3.5rem] p-12 text-rose-950 border border-rose-100 relative overflow-hidden group/protocol shadow-2xl">
                        <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-100/30 blur-[100px] group-hover:bg-rose-100/50 transition-all duration-1000" />
                        <Sparkles className="absolute -top-10 -right-10 text-rose-200/10 w-48 h-48 group-hover:rotate-12 transition-transform duration-1000" />
                        <h4 className="text-2xl font-black mb-8 flex items-center gap-4 uppercase tracking-tighter"><TrendingUp size={24} className="text-rose-600" /> Strategic protocol</h4>
                        <p className="text-rose-950/50 text-sm leading-relaxed mb-10 font-medium uppercase tracking-widest text-[11px]">
                           Based on your premium performance metrics and <span className="text-rose-600 font-black">{insights.successRate}% completion throughput</span>, we authorize a <span className="text-rose-950 font-black">2-hour executive cancellation window</span> to optimize technical staff distribution.
                        </p>
                        <button 
                          onClick={() => setActiveTab("time")}
                          className="w-full bg-rose-600 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-500/20 active:scale-[0.98]"
                        >
                          Execute Optimization Hub
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-40 bg-[#FFFBFA] rounded-[4rem] border border-dashed border-rose-100 shadow-inner">
                     <p className="text-rose-950/20 font-black uppercase tracking-[0.4em] text-[10px]">Registry Analytics Offline</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSalon;
