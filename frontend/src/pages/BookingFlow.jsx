// frontend/src/pages/BookingFlow.jsx
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { SalonContext } from "../context/SalonContext";
import { toast } from "react-toastify";

const STEPS = ["Select Service", "Pick Date & Time", "Confirm Booking"];

const BookingFlow = () => {
  const { salonId } = useParams();
  const navigate = useNavigate();
  const {
    apiBase, token, user,
    selectedSalon, setSelectedSalon,
    selectedService, setSelectedService,
    selectedDate, setSelectedDate,
    selectedSlot, setSelectedSlot,
    selectedArtist, setSelectedArtist,
  } = useContext(SalonContext);

  const [step, setStep] = useState(selectedService ? 1 : 0);
  const [salon, setSalon] = useState(selectedSalon);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [booked, setBooked] = useState(null);

  // --- Phase 8: Loyalty States ---
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [isRedeeming, setIsRedeeming] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }

    if (salonId) {
      loadSalonData(salonId);
    }
  }, [salonId, token]);

  const loadSalonData = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiBase}/salons/${id}`);
      if (res.data.success) {
        setSalon(res.data.salon);
        setSelectedSalon(res.data.salon);
        setServices(res.data.services || []);
        setArtists(res.data.salon.artists || []);
      }
    } catch {
      toast.error("Failed to load salon");
    } finally {
      setLoading(false);
    }
  };

  const loadSlots = async (date) => {
    if (!salon || !date) return;
    try {
      setLoading(true);
      const params = new URLSearchParams({ salonId: salon._id, date });
      if (selectedArtist) params.append("artistId", selectedArtist._id);
      const res = await axios.get(`${apiBase}/bookings/slots?${params}`);
      if (res.data.success) setSlots(res.data.slots);
    } catch {
      toast.error("Failed to load slots");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedSlot("");
    loadSlots(date);
  };

  const [paymentMethod, setPaymentMethod] = useState("At Salon");

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedSlot) {
      toast.error("Please select a service, date and time slot");
      return;
    }

    try {
      setSubmitting(true);
      
      const payload = {
        salonId: salon._id,
        serviceId: selectedService._id,
        artistId: selectedArtist?._id || null,
        date: selectedDate,
        timeSlot: selectedSlot,
        notes,
        customerPhone: phone,
        paymentMethod,
        pointsToRedeem: isRedeeming ? redeemPoints : 0
      };

      const { data } = await axios.post(`${apiBase}/bookings`, payload, {
        headers: { authorization: `Bearer ${token}` }
      });

      if (!data.success) {
        toast.error(data.message || "Booking creation failed");
        setSubmitting(false);
        return;
      }

      // -- CASE 1: ONLINE PAYMENT --
      if (paymentMethod === "Online" && data.razorpayOrder) {
        const loaded = await loadRazorpay();
        if (!loaded) {
          toast.error("Razorpay SDK failed to load. Check your internet.");
          setSubmitting(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Ensure this is in .env
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: "Book.My.Glow",
          description: `Booking for ${selectedService.name}`,
          order_id: data.razorpayOrder.id,
          handler: async (response) => {
            try {
              const verifyRes = await axios.post(`${apiBase}/payments/booking-verify`, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: data.booking._id
              }, { headers: { authorization: `Bearer ${token}` } });

              if (verifyRes.data.success) {
                setBooked(verifyRes.data.booking);
                toast.success("💳 Payment Successful & Booking Confirmed!");
              }
            } catch (err) {
              toast.error("Payment verification failed. Contact support.");
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: phone
          },
          theme: { color: "#D4AF37" }, // Premium Gold
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } 
      // -- CASE 2: PAY AT SALON --
      else {
        setBooked(data.booking);
        toast.success("🎉 Booking confirmed!");
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Success screen (Premium)
  if (booked) {
    return (
      <div className="min-h-screen pt-40 px-4 bg-black flex items-center justify-center">
        <div className="max-w-md w-full bg-[#111] rounded-[4rem] border border-white/5 p-12 text-center relative overflow-hidden">
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 blur-3xl rounded-full" />
           <div className="w-24 h-24 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
             <svg className="w-12 h-12 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
             </svg>
           </div>
           
           <p className="text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-4">Official Confirmation</p>
           <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">Reserved <span className="italic">Successfully</span></h2>
           <p className="text-white/40 text-sm font-medium uppercase tracking-widest mb-10 leading-relaxed">Your professional appointment at <span className="text-white">{booked.salon?.name}</span> is secured.</p>
 
           <div className="bg-black/40 rounded-[2.5rem] p-8 text-left space-y-4 mb-10 border border-white/5">
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
               <span className="text-white/20">Service</span>
               <span className="text-white">{booked.service?.name || booked.serviceName}</span>
             </div>
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
               <span className="text-white/20">Date</span>
               <span className="text-white">{new Date(booked.date).toLocaleDateString("en-IN", { day: "2-digit", month: "long" })}</span>
             </div>
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
               <span className="text-white/20">Arrival</span>
               <span className="text-gold">{booked.timeSlot}</span>
             </div>
             <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Investment</span>
                <span className="text-gold text-2xl font-black">₹{booked.price}</span>
             </div>
           </div>
 
           <div className="flex flex-col gap-3">
             <button onClick={() => navigate("/my-bookings")} className="w-full bg-gold text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-xl shadow-gold/10">
               Access My Bookings
             </button>
             <button onClick={() => navigate("/salons")} className="w-full bg-white/5 text-white/40 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
               Explore Collection
             </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 bg-black text-white">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps (Premium) */}
        <div className="flex items-center mb-16 px-4">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-3 relative">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black transition-all duration-700 border ${
                  i < step ? "bg-gold text-black border-gold shadow-[0_0_20px_rgba(212,175,55,0.3)]" :
                  i === step ? "bg-white/10 text-gold border-gold/50" :
                  "bg-white/5 text-white/20 border-white/5"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest absolute -bottom-8 whitespace-nowrap transition-colors duration-500 ${i === step ? "text-gold" : "text-white/20"}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-[2px] mx-6 rounded-full transition-all duration-1000 ${i < step ? "bg-gold" : "bg-white/5"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Salon Branding Info */}
        {salon && (
          <div className="flex items-center gap-6 bg-[#111] rounded-[2.5rem] p-6 mb-12 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl -mr-10 -mt-10" />
            {salon.images?.[0] && (
              <img src={salon.images[0]} alt={salon.name} className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 group-hover:scale-110 transition-transform duration-500" />
            )}
            <div>
              <p className="text-gold font-black uppercase tracking-[0.3em] text-[8px] mb-1">Authenticated Partner</p>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{salon.name}</h2>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">📍 {salon.location}</p>
            </div>
          </div>
        )}

        {/* Step Rendering */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Step 0: Select Service */}
          {step === 0 && (
            <div className="space-y-6">
               <div className="mb-8">
                 <h3 className="text-3xl font-black text-white uppercase tracking-tight">Select <span className="text-gold italic">Procedure</span></h3>
                 <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">Browse the elite service menu</p>
               </div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {[1,2,3,4].map(i => <div key={i} className="h-24 bg-[#111] rounded-2xl animate-pulse" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map(svc => (
                    <div
                      key={svc._id}
                      onClick={() => { setSelectedService(svc); setStep(1); }}
                      className={`p-6 rounded-[2.5rem] border transition-all duration-500 cursor-pointer group ${
                        selectedService?._id === svc._id
                          ? "border-gold bg-[#111] shadow-[0_0_30px_rgba(212,175,55,0.05)]"
                          : "border-white/5 bg-[#0A0A0A] hover:border-gold/30"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className={`font-black text-lg transition-colors uppercase tracking-tight ${selectedService?._id === svc._id ? "text-gold" : "text-white group-hover:text-gold"}`}>{svc.name}</p>
                          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mt-1">{svc.duration} min · {svc.category}</p>
                        </div>
                        <p className="text-gold font-black text-2xl tracking-tighter">₹{svc.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Date & Time */}
          {step === 1 && (
            <div className="space-y-8">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">Select <span className="text-gold italic">Schedule</span></h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">{selectedService?.name} · {selectedService?.duration} min</p>
                </div>
                <button onClick={() => { setSelectedService(null); setStep(0); }} className="text-[10px] font-black text-gold uppercase tracking-[0.2em] border-b border-gold/30 hover:border-gold transition">
                  Change Service
                </button>
              </div>

              {/* Wait Time Alert (Premium) */}
              {selectedService?.currentWaitTime > 0 && (
                <div className="bg-red-950/30 border border-red-500/20 text-red-200 p-6 rounded-[2.5rem] relative overflow-hidden group animate-in fade-in slide-in-from-top-4 duration-700">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-3xl -mr-10 -mt-10" />
                  <div className="flex items-start gap-4">
                    <span className="text-2xl animate-pulse">⚡</span>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-red-400">Live Workspace Advisory</h4>
                      <p className="text-xs mt-2 leading-relaxed font-medium">This professional is currently managing a live queue of <strong>{selectedService.currentWaitTime} minutes</strong>. Your arrival time is noted, but please expect a boutique delay.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Artist Selection */}
              {artists.length > 0 && (
                <div>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Executive Professional</p>
                   <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => { setSelectedArtist(null); if (selectedDate) loadSlots(selectedDate); }}
                      className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!selectedArtist ? "bg-gold text-black border-gold shadow-lg" : "bg-white/5 text-white/40 border-white/5 hover:border-gold/30"}`}
                    >
                      First Available Specialist
                    </button>
                    {artists.map(a => (
                      <button
                        key={a._id}
                        onClick={() => { setSelectedArtist(a); if (selectedDate) loadSlots(selectedDate); }}
                        className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${selectedArtist?._id === a._id ? "bg-gold text-black border-gold shadow-lg" : "bg-white/5 text-white/40 border-white/5 hover:border-gold/30"}`}
                      >
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center font-black text-[8px] ${selectedArtist?._id === a._id ? "bg-black text-white" : "bg-gold text-black"}`}>
                          {a.name?.[0]}
                        </div>
                        {a.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Date & Time Picker Container */}
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Reservation Date</p>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => handleDateChange(e.target.value)}
                    className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-4 text-white font-black text-xs uppercase tracking-widest focus:ring-1 focus:ring-gold outline-none transition"
                  />
                </div>

                {selectedDate && (
                  <div className="animate-in fade-in duration-700">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Availability Timeline</p>
                    {loading ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                         {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />)}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                        {slots.map(({ slot, available }) => (
                          <button
                            key={slot}
                            disabled={!available}
                            onClick={() => available && setSelectedSlot(slot)}
                            className={`py-3 px-2 rounded-xl text-[10px] font-black tracking-tighter transition-all uppercase ${
                              !available
                                ? "bg-white/[0.02] text-white/10 border border-transparent cursor-not-allowed line-through"
                                : selectedSlot === slot
                                  ? "bg-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.2)] scale-105"
                                  : "bg-white/5 text-white/60 border border-white/5 hover:border-gold/30 hover:text-gold"
                            }`}
                          >
                            {slot.split(" - ")[0]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-8">
                <button onClick={() => setStep(0)} className="flex-1 py-4 rounded-2xl border border-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition px-4">
                  Return
                </button>
                <button
                  onClick={() => { if (!selectedDate || !selectedSlot) { toast.error("Select a date and slot"); return; } setStep(2); }}
                  disabled={!selectedDate || !selectedSlot}
                  className="flex-1 py-4 rounded-2xl bg-gold text-black font-black text-[10px] uppercase tracking-widest disabled:opacity-20 transition shadow-xl shadow-gold/10 px-4"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Finalize */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
               <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tight">Final <span className="text-gold italic">Confirmation</span></h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">Personalize your high-fidelity booking</p>
               </div>

              <div className="bg-[#111] rounded-[3rem] p-8 space-y-6 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                {[
                  ["Professional Salon", salon?.name],
                  ["Procedure Selected", `${selectedService?.name} (${selectedService?.duration} min)`],
                  ["Appointment Date", new Date(selectedDate).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" })],
                  ["Arrival Window", selectedSlot],
                  ["Stylist Assigned", selectedArtist?.name || "Premium Specialist"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/20 whitespace-nowrap mr-4">{label}</span>
                    <span className="text-white text-right">{value}</span>
                  </div>
                ))}
                <div className="pt-6 border-t border-white/5 flex justify-between items-center">
                   <span className="text-gold font-black uppercase tracking-[0.3em] text-[10px]">Total Investment</span>
                   <span className="text-gold text-3xl font-black tracking-tighter">₹{selectedService?.price - (isRedeeming ? Math.floor(redeemPoints / 10) : 0)}</span>
                </div>
              </div>

              {/* Phase 8: Loyalty Redemption Engine */}
              {user?.loyaltyPoints > 0 && (
                <div className="bg-[#111] rounded-[3rem] p-8 border border-gold/20 relative overflow-hidden group">
                   <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-black/80 rounded-xl flex items-center justify-center text-gold border border-gold/30">✨</div>
                         <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-tight">Loyalty Rewards</h4>
                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{user.loyaltyPoints} Points Available</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-black text-gold uppercase tracking-widest">{isRedeeming ? 'Redemption Active' : 'Use Points?'}</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={isRedeeming} onChange={() => {
                              setIsRedeeming(!isRedeeming);
                              if (!isRedeeming) {
                                // Default redeem: all points or 50% of price
                                const maxPoints = Math.min(user.loyaltyPoints, (selectedService.price * 0.5) * 10);
                                setRedeemPoints(Math.floor(maxPoints));
                              }
                            }} className="sr-only peer" />
                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                         </label>
                      </div>
                   </div>
                   
                   {isRedeeming && (
                     <div className="animate-in fade-in slide-in-from-top-2 duration-500 pt-4 border-t border-white/5">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                           <span className="text-white/40">Points to Redeem</span>
                           <span className="text-gold">-{Math.floor(redeemPoints / 10)} Credits (₹{Math.floor(redeemPoints / 10)} Off)</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max={Math.min(user.loyaltyPoints, (selectedService.price * 0.5) * 10)} 
                          value={redeemPoints} 
                          onChange={(e) => setRedeemPoints(parseInt(e.target.value))}
                          className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer mt-4 accent-gold"
                        />
                     </div>
                   )}
                </div>
              )}

              {/* Points Preview (Phase 8) */}
              <div className="bg-gold/5 rounded-2xl p-4 border border-gold/10 flex items-center justify-between">
                 <p className="text-[9px] font-black text-gold uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} /> Elite Points Earned from this session
                 </p>
                 <span className="text-gold font-black">+{Math.floor((selectedService?.price - (isRedeeming ? Math.floor(redeemPoints / 10) : 0)) * 0.1)}</span>
              </div>

              {/* Personalization Inputs */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">Communication Channel (Mobile)</p>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91"
                    className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-4 text-white font-black text-xs uppercase tracking-widest focus:ring-1 focus:ring-gold outline-none"
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">Special Requests (Boutique Notes)</p>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="E.g. Preferences, special instructions..."
                    rows={2}
                    className="w-full bg-[#111] border border-white/5 rounded-2xl px-6 py-4 text-white font-medium text-xs focus:ring-1 focus:ring-gold outline-none resize-none"
                  />
                </div>
              </div>

              {/* Payment Architecture */}
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-5">Select Settlement Method</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setPaymentMethod("At Salon")}
                    className={`p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center gap-4 ${paymentMethod === "At Salon" ? "border-gold bg-[#111] shadow-[0_0_30px_rgba(212,175,55,0.05)]" : "border-white/5 bg-transparent hover:border-gold/30"}`}
                  >
                    <span className={`text-4xl transition-transform duration-500 ${paymentMethod === "At Salon" ? "scale-110" : "grayscale"}`}>🥂</span>
                    <div className="text-center">
                      <p className={`font-black text-[10px] uppercase tracking-widest ${paymentMethod === "At Salon" ? "text-gold" : "text-white/40"}`}>In-Studio Settlement</p>
                      <p className="text-[8px] text-white/20 font-bold uppercase mt-1">Cash / UPI at venue</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("Online")}
                    className={`p-8 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center gap-4 ${paymentMethod === "Online" ? "border-gold bg-[#111] shadow-[0_0_30px_rgba(212,175,55,0.05)]" : "border-white/5 bg-transparent hover:border-gold/30"}`}
                  >
                    <span className={`text-4xl transition-transform duration-500 ${paymentMethod === "Online" ? "scale-110" : "grayscale"}`}>💎</span>
                    <div className="text-center">
                      <p className={`font-black text-[10px] uppercase tracking-widest ${paymentMethod === "Online" ? "text-gold" : "text-white/40"}`}>Prestige Checkout</p>
                      <p className="text-[8px] text-white/20 font-bold uppercase mt-1">Instant Online Confirmation</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-[#111] rounded-3xl p-6 border border-white/5 flex items-start gap-4">
                 <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold shadow-2xl flex-shrink-0">⚠️</div>
                 <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                    <span className="text-gold">Policy Advisory:</span> {paymentMethod === "At Salon" ? "A valid reservation. No pre-payment required. Professional courtesy is expected for timely arrival." : "Priority reservation secured. Razorpay secure gateway will initialize upon confirmation."}
                    <span className="block mt-2">📜 <span className="text-white">Cancellation:</span> Boutique courtesy required 2 hours prior for full reimbursement or slot reallocation.</span>
                 </div>
              </div>

              <div className="flex gap-4 pt-8">
                <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl border border-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition">
                  Return
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-4 rounded-2xl bg-gold text-black font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-gold/10 hover:bg-white transition-all flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <><div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" /> Finalizing...</>
                  ) : (
                    "Secure Booking Now"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
