import React, { useContext, useEffect, useState, useRef } from "react";
import { SalonContext } from "../context/SalonContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const PAYMENT_STATUS_COLORS = {
  payment_pending: "bg-gray-100 text-gray-500",
  pending: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

const ArtistDashboard = () => {
  const { apiBase, token, user, backendUrl } = useContext(SalonContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [salonName, setSalonName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState(new Date().toISOString().split("T")[0]);
  
  // Modal State
  const [actionModal, setActionModal] = useState(null); // { bookingId, action: 'confirmed' | 'cancelled' }
  const [artistMessage, setArtistMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (user && !["artist", "salonOwner", "admin"].includes(user.role)) {
      navigate("/dashboard");
      return;
    }
    
    fetchDashboardData();

    // Setup Socket.io for Real-time alerts
    if (user) {
      socketRef.current = io(backendUrl);
      const eventName = `artist_${user._id}_new_booking`;
      
      socketRef.current.on(eventName, (newBooking) => {
        toast.info(`🔔 New Booking! ${newBooking.customerName || 'A customer'} just booked a slot.`);
        // Play notification sound
        try {
          const audio = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3");
          audio.play();
        } catch(e) {}
        
        setBookings(prev => [newBooking, ...prev]);
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [token, user]);

  const [tempProfile, setTempProfile] = useState({ name: "", phone: "", specialization: "", portfolio: "" });
  const [profileOpen, setProfileOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch Bookings
      const bookRes = await axios.get(`${apiBase}/bookings/artist`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (bookRes.data.success) setBookings(bookRes.data.bookings);

      // Fetch Me for additional artist fields
      const meRes = await axios.get(`${apiBase}/users/me`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (meRes.data.success) {
        setTempProfile({
          name: meRes.data.user.name || "",
          phone: meRes.data.user.phone || "",
          specialization: meRes.data.user.specialization || "Beauty Expert",
          portfolio: meRes.data.user.portfolio?.join(", ") || ""
        });
      }

      // Fetch the Artist's or Owner's active services to edit wait-times
      let svcRes;
      if (user?.role === "salonOwner") {
        svcRes = await axios.get(`${apiBase}/services/my`, { headers: { authorization: `Bearer ${token}` }});
      } else {
        const uSalonsRes = await axios.get(`${apiBase}/salons`);
        if (uSalonsRes.data.success) {
           const mySalons = uSalonsRes.data.salons.filter(s => s.artists?.includes(user._id));
           if (mySalons.length > 0) {
             setSalonName(mySalons[0].name);
           }
           let allSvc = [];
           for (const salon of mySalons) {
              const sr = await axios.get(`${apiBase}/services/salon/${salon._id}`);
              if (sr.data.success) allSvc = [...allSvc, ...sr.data.services];
           }
           svcRes = { data: { success: true, services: allSvc } };
        }
      }

      if (svcRes?.data?.success) {
        setServices(svcRes.data.services);
      }

    } catch (err) {
      console.error(err);
    } finally { 
      setLoading(false); 
    }
  };

  const handleProfileUpdate = async (e) => {
     e.preventDefault();
     try {
       setSubmitting(true);
       const res = await axios.put(`${apiBase}/users/artist/profile`, {
         ...tempProfile,
         portfolio: tempProfile.portfolio.split(",").map(p => p.trim()).filter(p => p !== "")
       }, { headers: { authorization: `Bearer ${token}` }});
       if (res.data.success) {
         toast.success("Professional profile updated!");
         setProfileOpen(false);
         fetchDashboardData();
       }
     } catch {
        toast.error("Failed to update profile");
     } finally {
        setSubmitting(false);
     }
  };

  // Update Wait Time Live
  const handleWaitTimeUpdate = async (serviceId, newTime) => {
    try {
      const res = await axios.put(`${apiBase}/services/${serviceId}/wait-time`, 
        { currentWaitTime: newTime },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setServices(services.map(s => s._id === serviceId ? { ...s, currentWaitTime: newTime } : s));
      }
    } catch {
      toast.error("Failed to update wait time. Make sure you have permission.");
    }
  };

  // Process Accept/Deny
  const handleBookingAction = async (e) => {
    e.preventDefault();
    if (!actionModal) return;

    try {
      setSubmitting(true);
      const res = await axios.put(
        `${apiBase}/bookings/${actionModal.bookingId}/status`,
        { status: actionModal.action, artistMessage },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(`Booking ${actionModal.action}. Customer notified!`);
        setBookings(bookings.map(b => b._id === actionModal.bookingId ? res.data.booking : b));
        closeModal();
      }
    } catch {
      toast.error("Failed to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (id, action) => {
    setActionModal({ bookingId: id, action });
    setArtistMessage("");
  };

  const closeModal = () => {
    setActionModal(null);
    setArtistMessage("");
  };

  const todayBookings = bookings.filter(b => {
    const d = new Date(b.date).toISOString().split("T")[0];
    return d === activeDate;
  });

  const completedCount = bookings.filter(b => b.status === "completed").length;
  const queueLength = bookings.filter(b => ["pending", "confirmed"].includes(b.status)).length;
  const earnings = bookings
    .filter(b => b.status === "completed")
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  const handlePrint = (booking) => {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date(booking.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' });
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill - ${booking.customerName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .bill-card { max-width: 400px; margin: 0 auto; border: 1px solid #eee; padding: 30px; border-radius: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #fecdd3; padding-bottom: 20px; margin-bottom: 25px; }
            .brand { color: #db2777; font-weight: 900; font-size: 24px; margin-bottom: 5px; }
            .salon-name { font-size: 18px; font-weight: 700; color: #111; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px; }
            .label { color: #666; font-weight: 500; }
            .value { color: #000; font-weight: 700; text-align: right; }
            .total-row { border-top: 1px dashed #ddd; padding-top: 15px; margin-top: 15px; }
            .total-label { font-size: 18px; font-weight: 800; }
            .total-value { font-size: 22px; font-weight: 900; color: #db2777; }
            .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px; }
            .badge { padding: 4px 10px; borderRadius: 20px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
            .paid { background: #dcfce7; color: #15803d; }
            .unpaid { background: #fef3c7; color: #b45309; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="bill-card">
            <div class="header">
              <div class="brand">Book.My.Glow</div>
              <div class="salon-name">${booking.salon?.name || 'Authorized Salon'}</div>
              <div style="font-size: 10px; color: #999; margin-top: 5px;">INVOICE ID: ${booking._id.toString().toUpperCase()}</div>
            </div>
            
            <div class="row"><span class="label">Date</span><span class="value">${dateStr}</span></div>
            <div class="row"><span class="label">Customer</span><span class="value">${booking.customerName}</span></div>
            <div class="row"><span class="label">Artist</span><span class="value">${booking.artist?.name || 'Expert'}</span></div>
            
            <div style="margin: 20px 0; background: #f9fafb; padding: 15px; border-radius: 12px;">
              <div class="row" style="margin-bottom: 5px;"><span class="label">Service</span><span class="value">${booking.serviceName}</span></div>
              <div class="row" style="margin-bottom: 0;"><span class="label">Time Slot</span><span class="value">${booking.timeSlot}</span></div>
            </div>

            <div class="row"><span class="label">Payment Status</span><span class="value status-badge ${booking.paymentStatus === 'paid' ? 'paid' : 'unpaid'}">${booking.paymentStatus.toUpperCase()}</span></div>
            <div class="row"><span class="label">Method</span><span class="value">${booking.paymentMethod}</span></div>
            
            <div class="row total-row">
              <span class="label total-label">Amount Paid</span>
              <span class="value total-value">₹${booking.price}</span>
            </div>
            
            <div class="footer">
              Thank you for glowing with us!<br>
              www.bookmyglow.com
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-8 max-w-5xl mx-auto relative">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-pink-100">
             {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none uppercase">
                {user?.name}
              </h1>
              <button 
                onClick={() => setProfileOpen(true)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full font-bold transition flex items-center gap-1 uppercase"
              >
                 Edit Profile ⚙️
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-[10px] font-black text-white bg-pink-600 px-2 py-0.5 rounded-md uppercase tracking-widest shadow-sm">Artist</span>
               <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100 uppercase tracking-widest">{tempProfile.specialization}</span>
               <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 uppercase tracking-widest leading-none">
                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                 Connected
               </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex gap-4 overflow-x-auto pb-2 shrink-0 max-w-full">
           <div className="bg-white min-w-[120px] px-6 py-4 rounded-3xl border border-gray-100 shadow-sm transition hover:shadow-md">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Queue Depth</p>
              <p className="text-2xl font-black text-gray-900">{queueLength}</p>
           </div>
           <div className="bg-white min-w-[120px] px-6 py-4 rounded-3xl border border-gray-100 shadow-sm transition hover:shadow-md">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Work</p>
              <p className="text-2xl font-black text-pink-600">{completedCount}</p>
           </div>
           <div className="bg-gray-900 min-w-[140px] px-6 py-4 rounded-3xl shadow-xl shadow-gray-200 transition hover:scale-105">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Est. Earnings</p>
              <p className="text-2xl font-black text-white">₹{earnings}</p>
           </div>
        </div>
      </div>

      {/* Profile Modal */}
      {profileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3rem] p-8 w-full max-w-lg shadow-2xl animate-fade-in-up">
              <div className="mb-6">
                <h3 className="text-2xl font-black text-gray-900 uppercase">Expert Profile</h3>
                <p className="text-gray-500 text-sm italic">Manage your professional credentials and portfolio</p>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 ml-1">Professional Focus</label>
                    <input 
                      type="text" 
                      value={tempProfile.specialization} 
                      onChange={e => setTempProfile({...tempProfile, specialization: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-pink-500 outline-none text-sm font-bold"
                      placeholder="e.g. Master Stylist, Makeup Expert"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1 ml-1">Portfolio (Comma-separated URLs)</label>
                    <textarea 
                      type="text" 
                      value={tempProfile.portfolio} 
                      onChange={e => setTempProfile({...tempProfile, portfolio: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-pink-500 outline-none text-sm font-bold resize-none h-24"
                      placeholder="Add image URLs of your best work..."
                    />
                 </div>
                 
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setProfileOpen(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500 text-xs uppercase transition hover:bg-gray-200">Close</button>
                    <button type="submit" disabled={submitting} className="flex-2 py-4 bg-pink-600 rounded-2xl font-black text-white text-sm uppercase transition hover:bg-pink-700 shadow-xl shadow-pink-100">
                      {submitting ? "Updating..." : "Save Professional Bio"}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Wait Time Quick Editor */}
      {services.length > 0 && (
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">⏱️ Live Wait Times</h2>
            <div className="h-[1px] flex-1 bg-gray-100"></div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {services.map(svc => (
              <div key={svc._id} className="min-w-[260px] bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col justify-between group hover:border-pink-200 transition-all duration-300">
                <div>
                  <p className="font-extrabold text-gray-900 text-lg mb-1 truncate group-hover:text-pink-600 transition-colors uppercase">{svc.name}</p>
                  <p className="text-xs text-gray-400 font-medium tracking-wide">Adjust walk-in expectancy</p>
                </div>
                <div className="mt-6 flex items-center justify-between bg-gray-50 p-2 rounded-2xl">
                  <button onClick={() => handleWaitTimeUpdate(svc._id, Math.max(0, svc.currentWaitTime - 5))} className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-pink-50 hover:text-pink-600 font-black transition">-</button>
                  <div className="text-center">
                    <span className="block font-black text-2xl text-gray-900 leading-none">{svc.currentWaitTime}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Mins</span>
                  </div>
                  <button onClick={() => handleWaitTimeUpdate(svc._id, svc.currentWaitTime + 5)} className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 hover:bg-pink-50 hover:text-pink-600 font-black transition">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date Picker + Day Schedule */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden mb-12">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-white">
           <div>
              <h2 className="font-black text-gray-900 uppercase tracking-tight text-xl">Daily Schedule</h2>
              <p className="text-xs text-gray-400 font-medium">Review and manage your incoming appointments</p>
           </div>
           <div className="relative">
              <input
                type="date"
                value={activeDate}
                onChange={e => setActiveDate(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-2xl px-5 py-3 text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-sm"
              />
           </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 rounded-3xl animate-pulse" />)}
          </div>
        ) : todayBookings.length === 0 ? (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border border-dashed border-gray-200">🗓️</div>
            <p className="text-gray-400 font-medium">Your schedule is clear for today.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayBookings.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)).map(b => (
              <div key={b._id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 transition hover:bg-pink-50/30">
                <div className="w-24 flex-shrink-0">
                  <div className="bg-white border border-gray-100 rounded-2xl py-3 px-2 text-center shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Time</p>
                    <p className="text-sm font-black text-pink-600 leading-none">{b.timeSlot?.split(" - ")[0]}</p>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-black text-gray-900 text-lg truncate uppercase">{b.customerName || b.user?.name}</p>
                    <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${STATUS_COLORS[b.status]}`}>
                      {b.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-bold mb-2">
                    {b.service?.name || b.serviceName} 
                    <span className="mx-2 text-gray-200">|</span> 
                    <span className="text-pink-500">{currency || '₹'}{b.price}</span>
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest border ${PAYMENT_STATUS_COLORS[b.paymentStatus || 'pending']}`}>
                      💳 {b.paymentStatus === "paid" ? "Paid" : "Unpaid"} ({b.paymentMethod})
                    </span>
                    {b.customerPhone && (
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 flex items-center gap-1">📞 {b.customerPhone}</span>
                    )}
                    {b.notes && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 flex items-center gap-1">📝 {b.notes}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end gap-3 shrink-0">
                   {b.status === "pending" && (
                    <div className="flex gap-2">
                       <button onClick={() => openModal(b._id, "confirmed")} className="px-5 py-2.5 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-600 shadow-lg shadow-green-100 transition active:scale-95">
                         ✓ Confirm
                       </button>
                       <button onClick={() => openModal(b._id, "cancelled")} className="px-5 py-2.5 bg-white text-red-600 border border-red-100 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 transition active:scale-95">
                         Deny
                       </button>
                    </div>
                  )}
                   {b.status === "confirmed" && (
                     <div className="flex gap-2">
                       <button onClick={() => handlePrint(b)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition">
                         Print Bill
                       </button>
                       <button onClick={() => openModal(b._id, "completed")} className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black shadow-xl transition active:scale-95">
                          Mark Done
                       </button>
                     </div>
                  )}
                  {b.status === "completed" && (
                    <button onClick={() => handlePrint(b)} className="px-4 py-2 bg-pink-50 text-pink-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-100 transition">
                      Bill Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal (Accept/Deny with Message) */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="mb-4">
               <h3 className="text-xl font-bold text-gray-900">
                  {actionModal.action === "confirmed" ? "Accept Booking" : "Deny Booking"}
               </h3>
               <p className="text-sm text-gray-500 mt-1">
                 You are about to {actionModal.action === "confirmed" ? "confirm" : "cancel"} this appointment.
               </p>
            </div>

            <form onSubmit={handleBookingAction}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message to Customer (Optional)</label>
                <textarea 
                  value={artistMessage}
                  onChange={e => setArtistMessage(e.target.value)}
                  placeholder={actionModal.action === "confirmed" ? "E.g. I am running 10 mins late, please wait in the lounge!" : "E.g. Sorry, I have an absolute emergency."}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none bg-gray-50"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className={`flex-1 py-3 rounded-xl font-bold text-white transition ${actionModal.action === "confirmed" ? "bg-green-500 hover:bg-green-600 shadow-md shadow-green-200" : "bg-red-500 hover:bg-red-600 shadow-md shadow-red-200"}`}>
                  {submitting ? "Processing..." : actionModal.action === "confirmed" ? "Accept Now" : "Confirm Deny"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ArtistDashboard;
