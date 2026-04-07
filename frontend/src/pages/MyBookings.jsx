import React, { useContext, useEffect, useState, useRef } from "react";
import { SalonContext } from "../context/SalonContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { 
  Sparkles, 
  Calendar, 
  Receipt, 
  User, 
  MessageCircle,
  ChevronRight,
  ArrowLeft,
  Wallet
} from "lucide-react";

const STATUS_SHIELDS = {
  pending: "bg-amber-50 text-amber-600 border-amber-100",
  confirmed: "bg-rose-600 text-white shadow-lg shadow-rose-500/20",
  completed: "bg-rose-50 text-rose-600 border-rose-100",
  cancelled: "bg-rose-950 text-white/40 border-rose-900",
};

const MyBookings = () => {
  const { apiBase, token, user, backendUrl } = useContext(SalonContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [cancelling, setCancelling] = useState(null);
  const [reviewModal, setReviewModal] = useState({ open: false, booking: null });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchBookings();

    if (user) {
      socketRef.current = io(backendUrl);
      const eventName = `user_${user._id}_booking_update`;
      
      socketRef.current.on(eventName, (updatedBooking) => {
        setBookings(prev => {
           const existing = prev.find(b => b._id === updatedBooking._id);
           if (existing && existing.status !== updatedBooking.status) {
             toast.info(`🔔 Protocol Update: Your appointment for ${updatedBooking.service?.name || 'a service'} was marked as ${updatedBooking.status}!`);
             if (updatedBooking.artistMessage) {
               toast.success(`Message from Master Artist: "${updatedBooking.artistMessage}"`, { autoClose: 6000 });
               try {
                  const audio = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3");
                  audio.play();
               } catch(e) {}
             }
           }
           return prev.map(b => b._id === updatedBooking._id ? updatedBooking : b);
        });
      });

      return () => {
        if (socketRef.current) socketRef.current.disconnect();
      };
    }
  }, [token, user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiBase}/bookings/my`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) setBookings(res.data.bookings);
    } catch {
      toast.error("Failed to load official registry");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Nullify this session protocol?")) return;
    try {
      setCancelling(id);
      const res = await axios.put(`${apiBase}/bookings/cancel/${id}`, {}, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Protocol nullified successfully");
        fetchBookings();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancellation protocol failed");
    } finally {
      setCancelling(null);
    }
  };

  const openReviewModal = (booking) => {
    setReviewModal({ open: true, booking });
    setReviewRating(0);
    setReviewComment("");
  };

  const closeReviewModal = () => {
    setReviewModal({ open: false, booking: null });
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewModal.booking) return;
    try {
      const payload = {
        bookingId: reviewModal.booking._id,
        rating: reviewRating,
        comment: reviewComment
      };
      const res = await axios.post(`${apiBase}/reviews`, payload, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Mastery Review Submitted!");
        setBookings(prev => prev.map(b => b._id === reviewModal.booking._id ? { ...b, isReviewed: true } : b));
        closeReviewModal();
      } else {
        toast.error(res.data.message || "Failed to submit evaluation");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Evaluation protocol failed");
    }
  };

  const filtered = activeFilter === "all"
    ? bookings
    : bookings.filter(b => b.status === activeFilter);

  const upcoming = bookings.filter(b => ["pending", "confirmed"].includes(b.status));

  return (
    <div className="min-h-screen pt-40 pb-24 bg-[#FFFBFA] text-rose-950 font-sans selection:bg-rose-100">
      <div className="max-w-5xl mx-auto px-6 sm:px-12">
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-8 animate-fade-in">
          <div>
            <div className="flex items-center gap-3 text-rose-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4">
              <Sparkles size={16} className="animate-pulse" /> Official Protocol Register
              <span className="w-2 h-2 bg-rose-600 rounded-full animate-ping ml-2" />
            </div>
            <h1 className="text-5xl font-black text-rose-950 uppercase tracking-tighter leading-none">
              Client <span className="text-rose-600 italic">Registry</span>
            </h1>
            <p className="text-rose-950/40 mt-6 font-black uppercase tracking-[0.4em] text-[10px]">Managing your upcoming and archived grooming rituals</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 text-rose-600 font-black uppercase tracking-widest text-[9px] bg-white px-6 py-3 rounded-full border border-rose-50 shadow-2xl shadow-rose-500/5 hover:bg-rose-50 transition-all">
            <ArrowLeft size={16} /> Return to Hub
          </button>
        </div>

        {/* Global Metrics Tab */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <StatMini label="Total Registry" count={bookings.length} />
          <StatMini label="Active Protocols" count={upcoming.length} />
          <StatMini label="Finalized Sessions" count={bookings.filter(b => b.status === "completed").length} />
          <StatMini label="Nullified Orders" count={bookings.filter(b => b.status === "cancelled").length} />
        </div>

        {/* Cinematic Filter Protocol */}
        <div className="flex flex-wrap gap-2 mb-12">
          {["all", "pending", "confirmed", "completed", "cancelled"].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${
                activeFilter === f 
                ? "bg-rose-600 text-white border-rose-600 shadow-2xl shadow-rose-500/20" 
                : "bg-white text-rose-950/40 border-rose-100 hover:border-rose-300 shadow-sm"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Content Flow */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-[3rem] border border-rose-50 p-10 animate-pulse h-48 shadow-2xl shadow-rose-500/5" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-rose-100 shadow-xl shadow-rose-500/5">
            <div className="text-7xl mb-8 opacity-10">🗓️</div>
            <h3 className="text-xl font-black text-rose-950/40 uppercase tracking-widest mb-4">No Registry Records Found</h3>
            <p className="text-rose-900/20 text-[10px] font-black uppercase tracking-[0.4em] mb-12">Authorize your first salon ritual now</p>
            <button
              onClick={() => navigate("/salons")}
              className="bg-rose-600 text-white px-12 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-2xl"
            >
              Explore Collection
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-rose-950/20 font-black uppercase tracking-[0.4em] text-[10px]">
             No Protocol Fragments Matching {activeFilter}
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in-up">
            {filtered.map(booking => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancel={() => cancelBooking(booking._id)}
                cancelling={cancelling === booking._id}
                onViewSalon={() => navigate(`/salon/${booking.salon?._id}`)}
                onLeaveReview={() => openReviewModal(booking)}
              />
            ))}
          </div>
        )}

        {/* Review Modal (Frosted Rose) */}
        {reviewModal.open && (
          <div className="fixed inset-0 bg-rose-950/40 backdrop-blur-3xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-700" onClick={closeReviewModal}>
            <div className="bg-white rounded-[4rem] p-12 w-full max-w-xl shadow-2xl border border-rose-100 relative overflow-hidden group/modal" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-80 h-80 bg-rose-50 blur-3xl rounded-full -mr-40 -mt-40 opacity-50" />
              
              <div className="relative z-10">
                 <p className="text-rose-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Artistic Evaluation</p>
                 <h3 className="text-4xl font-black text-rose-950 uppercase tracking-tighter mb-4 leading-none">The <span className="text-rose-600 italic">Signature</span> Review</h3>
                 <p className="text-rose-950/40 mb-10 text-[10px] font-black uppercase tracking-widest">Verify the mastery of {reviewModal.booking?.salon?.name}</p>

                 <form onSubmit={submitReview} className="space-y-10">
                   <div className="text-center">
                     <label className="block text-[9px] font-black text-rose-600 uppercase tracking-[0.4em] mb-6">Star Tier Certification</label>
                     <div className="flex justify-center gap-4">
                       {[1, 2, 3, 4, 5].map(star => (
                         <button
                           type="button"
                           key={star}
                           onClick={() => setReviewRating(star)}
                           className={`text-5xl transition-all duration-500 transform hover:scale-125 ${
                             reviewRating >= star ? "text-rose-600 drop-shadow-2xl" : "text-rose-100"
                           }`}
                         >
                           ★
                         </button>
                       ))}
                     </div>
                   </div>

                   <div>
                     <label className="block text-[9px] font-black text-rose-600 uppercase tracking-[0.4em] mb-4 ml-1">Expert Commentary</label>
                     <textarea
                       value={reviewComment}
                       onChange={e => setReviewComment(e.target.value)}
                       rows={4}
                       placeholder="Detail your technical and artistic experience..."
                       className="w-full bg-[#FFFBFA] border border-rose-100 rounded-[2.5rem] p-8 focus:ring-1 focus:ring-rose-600 transition-all outline-none text-rose-950 font-medium uppercase tracking-widest text-[12px] placeholder:text-rose-950/20 shadow-inner"
                       required
                     />
                   </div>

                   <div className="flex gap-4 pt-4">
                     <button
                       type="button"
                       onClick={closeReviewModal}
                       className="flex-1 py-5 bg-white text-rose-950/40 border border-rose-100 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all active:scale-[0.98]"
                     >
                       Skip Protocol
                     </button>
                     <button
                       type="submit"
                       disabled={reviewRating === 0}
                       className="flex-[2] py-5 bg-rose-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 shadow-2xl shadow-rose-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
                     >
                       Authorize Evaluation
                     </button>
                   </div>
                 </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatMini = ({ label, count }) => (
  <div className="bg-white rounded-3xl p-6 border border-rose-50 shadow-2xl shadow-rose-500/5 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-center text-center">
     <p className="text-3xl font-black text-rose-950 tracking-tighter leading-none mb-2">{count}</p>
     <p className="text-[9px] font-black text-rose-950/20 uppercase tracking-widest leading-none">{label}</p>
  </div>
);

const BookingCard = ({ booking, onCancel, cancelling, onViewSalon, onLeaveReview }) => {
  const salon = booking.salon;
  const service = booking.service;
  const date = new Date(booking.date);
  const isUpcoming = ["pending", "confirmed"].includes(booking.status);

  const canCancel = () => {
    if (!isUpcoming) return false;
    try {
      const apptDate = new Date(booking.date);
      const [startH, startM] = booking.timeSlot.split(" - ")[0].split(":").map(s => s.trim());
      let hour = parseInt(startH);
      if (booking.timeSlot.includes("PM") && hour !== 12) hour += 12;
      if (booking.timeSlot.includes("AM") && hour === 12) hour = 0;
      apptDate.setHours(hour, parseInt(startM), 0, 0);

      const windowHours = salon?.cancellationWindow || 2;
      const limit = new Date(apptDate.getTime() - windowHours * 60 * 60 * 1000);
      return Date.now() < limit.getTime();
    } catch {
      return false;
    }
  };

  const cancellable = canCancel();

  return (
    <div className={`bg-white rounded-[3.5rem] border shadow-2xl p-10 sm:p-12 transition-all hover:-translate-y-2 group relative overflow-hidden ${
      isUpcoming ? "border-rose-100 shadow-rose-500/5" : "border-rose-50 opacity-60"
    }`}>
      {isUpcoming && <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-600/10" />}
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Salon Artifact */}
        <div className="relative w-full lg:w-48 h-48 flex-shrink-0 group-hover:rotate-2 transition-transform duration-1000">
          <img
            src={salon?.bannerImage || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500&q=80"}
            alt={salon?.name}
            className="w-full h-full object-cover rounded-[2.5rem] shadow-xl border border-rose-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-rose-950/20 to-transparent rounded-[2.5rem]" />
        </div>

        {/* Registry Intel */}
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
            <div>
              <p className="text-rose-600 font-black uppercase tracking-[0.3em] text-[9px] mb-2">{salon?.location || 'Executive District'}</p>
              <h3 className="text-3xl font-black text-rose-950 uppercase tracking-tighter leading-none group-hover:text-rose-600 transition-colors duration-500">{salon?.name || "Verified Studio"}</h3>
            </div>
            <div className={`text-[10px] px-6 py-2 rounded-full font-black uppercase tracking-widest border ${STATUS_SHIELDS[booking.status] || "bg-rose-50 text-rose-950/40 border-rose-100"}`}>
              {booking.status}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 pt-8 border-t border-rose-50">
            <DataPoint label="Service Protocol" value={service?.name || booking.serviceName} icon={<Receipt size={14} />} />
            <DataPoint label="Session Date" value={date.toLocaleDateString("en-IN", { day: "2-digit", month: "long" })} icon={<Calendar size={14} />} />
            <DataPoint label="Time Sequence" value={booking.timeSlot} icon={<Calendar size={14} />} />
            <DataPoint label="Investment" value={`₹${booking.price}`} icon={<Wallet size={14} />} />
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <div className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl border ${
               booking.paymentStatus === "paid" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-[#FFFBFA] text-rose-950/20 border-rose-50"
             }`}>
               Protocol: {booking.paymentStatus || "Unpaid"}
             </div>
             {booking.artist && (
               <div className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-950/40 flex items-center gap-2">
                 <User size={12} className="text-rose-600" /> Specialist: {booking.artist.name}
               </div>
             )}
          </div>

          {booking.artistMessage && (
             <div className="mt-8 bg-rose-50/50 border border-rose-100 p-6 rounded-[2rem] flex items-start gap-4 animate-fade-in group/note">
                <MessageCircle size={18} className="text-rose-600 shrink-0 group-hover:rotate-12 transition-transform" />
                <div>
                   <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Master Artistic Assessment</p>
                   <p className="text-[12px] font-semibold text-rose-950/70 italic uppercase tracking-widest leading-relaxed">"{booking.artistMessage}"</p>
                </div>
             </div>
          )}
        </div>

        {/* Control Interface */}
        <div className="flex lg:flex-col gap-4 flex-wrap lg:justify-center">
          <button
            onClick={onViewSalon}
            className="px-10 py-4 bg-white border border-rose-100 text-rose-950 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-500/5 group flex items-center gap-2"
          >
            Studio Profile <ChevronRight size={14} />
          </button>
          
          {["pending", "confirmed"].includes(booking.status) && (
            <div className="flex flex-col gap-2 items-center">
              <button
                onClick={onCancel}
                disabled={cancelling || !cancellable}
                className={`w-full px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${
                  cancellable ? "bg-rose-50 text-rose-950 border border-rose-100 hover:bg-rose-950 hover:text-white" : "bg-[#FFFBFA] text-rose-950/10 border-rose-50 cursor-not-allowed"
                }`}
              >
                {cancelling ? "Processing..." : "Nullify"}
              </button>
              {!cancellable && booking.status !== "cancelled" && (
                <span className="text-[8px] font-black text-rose-950/20 uppercase tracking-[0.2em]">Non-cancellable Term</span>
              )}
            </div>
          )}
          
          {booking.status === "completed" && !booking.isReviewed && (
            <button
              onClick={onLeaveReview}
              className="px-10 py-4 bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-rose-700 transition-all shadow-2xl shadow-rose-500/20"
            >
              Verify Experience
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const DataPoint = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <div className="text-rose-600 mt-0.5">{icon}</div>
    <div>
      <p className="text-[8px] font-black text-rose-950/20 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-[11px] font-black text-rose-950 uppercase tracking-tight leading-tight">{value}</p>
    </div>
  </div>
);

export default MyBookings;
