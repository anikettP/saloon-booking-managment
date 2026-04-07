import React, { useState, useContext } from "react";
import { SalonContext } from "../context/SalonContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Building2, 
  MapPin, 
  Globe, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  CheckCircle2, 
  Wallet,
  ArrowLeft
} from "lucide-react";

const CATEGORIES = ["Hair", "Spa", "Nails", "Makeup", "Beard", "Skincare", "General"];
const REGISTRATION_FEE = 1;

const RegisterSalon = () => {
  const { token, backendUrl, user } = useContext(SalonContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState(""); // Area
  const [city, setCity] = useState("");
  const [mapLink, setMapLink] = useState(""); // Google/Apple Maps Link
  const [description, setDescription] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Toggle Category Selection
  const handleCategoryToggle = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Step 1 -> Step 2
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !city.trim() || !mapLink.trim()) {
      return toast.error("Salon name, Area, City, and Map Link are all required for precise location mapping.");
    }
    if (selectedCategories.length === 0) {
      return toast.error("Please select at least one primary category.");
    }
    setStep(2);
  };

  // Function to load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Init Registration and trigger Razorpay
  const handlePayment = async () => {
    try {
      setLoading(true);

      const res = await loadRazorpayScript();
      if (!res) {
        toast.error("Failed to load Razorpay SDK. Check your connection.");
        setLoading(false);
        return;
      }

      // 1. Create Order on Backend
      const { data } = await axios.post(
        `${backendUrl}/api/payment/salon-initiate`,
        { name, location, city, mapLink, description, categories: selectedCategories },
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (!data.success) {
        toast.error(data.message);
        setLoading(false);
        return;
      }

      // 2. Open Razorpay Checktout Popup
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_live_RiKKNElNUU5AeI",
        amount: data.amount,
        currency: data.currency,
        name: "Book.My.Glow Platform",
        description: `Registration Fee for ${name}`,
        image: "https://bookmyglow.com/logo.png",
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Signature
            const verifyRes = await axios.post(
              `${backendUrl}/api/payment/salon-verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                salonId: data.salonId,
              },
              { headers: { authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              setStep(3); // Show Success Screen
            } else {
              toast.error(verifyRes.data.message);
            }
          } catch (err) {
            toast.error("Payment verification failed.");
            console.error(err);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: "#E11D48", // Rose-600
        },
        modal: {
          ondismiss: function() {
            toast.info("Payment cancelled. You can try again.");
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-24 bg-[#FFFBFA] text-rose-950 relative overflow-hidden flex items-center justify-center selection:bg-rose-100">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 blur-[150px] -mr-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-rose-200/10 blur-[150px] -ml-64 -mb-64 pointer-events-none" />

      <div className="w-full max-w-4xl bg-white border border-rose-50 rounded-[4rem] shadow-2xl shadow-rose-500/5 overflow-hidden relative group font-outfit">
        
        {/* Cinematic Header */}
        <div className="bg-gradient-to-r from-rose-50 via-white to-rose-50 px-10 py-12 border-b border-rose-50 relative">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-rose-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Enterprise Induction Protocol</p>
              <h1 className="text-5xl font-black text-rose-950 uppercase tracking-tighter leading-none">
                Register Your <span className="text-rose-600 italic">Signature</span>
              </h1>
            </div>
            <div className="w-20 h-20 bg-rose-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-rose-500/20 transform -rotate-6">
               <Building2 size={32} />
            </div>
          </div>
        </div>

        {/* Cinematic Progress Protocol */}
        <div className="flex bg-rose-50/30 border-b border-rose-50">
          {[
            { s: 1, label: "Core Registry" },
            { s: 2, label: "Investment Protocol" },
            { s: 3, label: "Deployment Finalized" }
          ].map((item) => (
            <div 
              key={item.s}
              className={`flex-1 text-center py-6 text-[9px] font-black uppercase tracking-widest transition-all duration-1000 ${
                step >= item.s ? "text-rose-600 bg-white border-b-4 border-rose-600 shadow-inner" : "text-rose-950/20"
              }`}
            >
              {item.s}. {item.label}
            </div>
          ))}
        </div>

        <div className="p-10 md:p-14 relative z-10">
          {/* STEP 1: REGISTRY FORM */}
          {step === 1 && (
            <form onSubmit={handleNextStep} className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-rose-600/40 uppercase tracking-[0.4em] ml-1 leading-none">Official Identity Statement</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Official Studio Label"
                  required
                  className="w-full bg-[#FFFBFA] border border-rose-100 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all shadow-inner placeholder:text-rose-950/20"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-rose-600/40 uppercase tracking-[0.4em] ml-1 leading-none">Elite District</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. VICTORIA SECTOR"
                    required
                    className="w-full bg-[#FFFBFA] border border-rose-100 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all shadow-inner placeholder:text-rose-950/20"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-rose-600/40 uppercase tracking-[0.4em] ml-1 leading-none">Global City Hub</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="CITY NAME"
                    required
                    className="w-full bg-[#FFFBFA] border border-rose-100 rounded-2xl px-6 py-5 text-sm font-black uppercase tracking-widest text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all shadow-inner placeholder:text-rose-950/20"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-rose-600/40 uppercase tracking-[0.4em] ml-1 leading-none">Technological Mapping (Vrfied Google Link)</label>
                <div className="relative group">
                  <input
                    type="url"
                    value={mapLink}
                    onChange={(e) => setMapLink(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    required
                    className="w-full bg-[#FFFBFA] border border-rose-100 rounded-2xl px-14 py-5 text-sm font-black uppercase tracking-widest text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all shadow-inner placeholder:text-rose-950/20"
                  />
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-rose-300 group-focus-within:text-rose-600 transition-colors" size={20} />
                </div>
                <p className="text-[9px] text-rose-950/30 font-black uppercase tracking-[0.2em] mt-3 flex items-center gap-2 italic">
                   <span className="text-rose-600 animate-pulse">⚡</span> Mandatory protocol for global registry visualization
                </p>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-rose-600/40 uppercase tracking-[0.4em] ml-1 leading-none">Expertise Clusters</label>
                <div className="flex flex-wrap gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => handleCategoryToggle(cat)}
                      className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500 ${
                        selectedCategories.includes(cat) 
                        ? "bg-rose-600 text-white border-rose-600 shadow-2xl shadow-rose-500/20" 
                        : "bg-white text-rose-950/40 border-rose-100 hover:border-rose-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-rose-600/40 uppercase tracking-[0.4em] ml-1 leading-none">Corporate Narrative</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Establish your brand story and technical ambiance..."
                  rows={4}
                  className="w-full bg-[#FFFBFA] border border-rose-100 rounded-[2.5rem] p-8 text-[13px] font-medium leading-relaxed tracking-widest uppercase text-rose-950 focus:outline-none focus:ring-1 focus:ring-rose-600 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="pt-10 flex justify-end">
                <button type="submit" className="bg-rose-600 text-white px-14 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-500/20 flex items-center gap-3 active:scale-95">
                  Authorize Data <ChevronRight size={18} />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: SUMMARY & METRIC PAYMENT */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="bg-[#FFFBFA] rounded-[3.5rem] p-12 border border-rose-100 mb-12 relative overflow-hidden group/card shadow-inner">
                <div className="absolute top-0 right-0 w-80 h-80 bg-rose-200/20 blur-[100px] -mr-32 -mt-32" />
                <div className="flex items-center gap-3 text-rose-600 font-black uppercase tracking-[0.4em] text-[10px] mb-10 border-b border-rose-200/20 pb-6">
                  <ShieldCheck size={16} /> Registry Verification Summary
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-8">
                      <div>
                         <p className="text-[8px] font-black text-rose-950/20 uppercase tracking-widest mb-2">Corporate Label</p>
                         <p className="text-rose-950 font-black text-2xl uppercase tracking-tighter leading-none">{name}</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-rose-950/20 uppercase tracking-widest mb-2">Operation Base</p>
                         <p className="text-rose-950/60 font-black text-sm uppercase tracking-widest flex items-center gap-2"><MapPin size={14} className="text-rose-600" /> {location}, {city}</p>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div>
                         <p className="text-[8px] font-black text-rose-950/20 uppercase tracking-widest mb-2">Registry Reach</p>
                         <p className="text-rose-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-rose-100 self-start shadow-sm"><Globe size={14} /> Global Authorization Active</p>
                      </div>
                      <div>
                         <p className="text-[8px] font-black text-rose-950/20 uppercase tracking-widest mb-2">Expertise Hub</p>
                         <div className="flex flex-wrap gap-2">
                           {selectedCategories.map(c => <span key={c} className="text-[8px] font-black text-rose-950/40 uppercase tracking-widest border border-rose-100 px-3 py-1 rounded-full">{c}</span>)}
                         </div>
                      </div>
                   </div>
                </div>

                <div className="mt-12 pt-10 border-t border-rose-100 flex justify-between items-end relative z-10">
                  <div>
                    <p className="text-[9px] font-black text-rose-950/30 uppercase tracking-[0.4em] mb-2 leading-none">Induction Investment</p>
                    <p className="text-[8px] font-black text-rose-950/20 uppercase tracking-[0.2em]">PLATFORM VERIFICATION FEE</p>
                  </div>
                  <span className="text-5xl font-black text-rose-950 tracking-tighter leading-none">₹{REGISTRATION_FEE}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => setStep(1)} 
                  disabled={loading}
                  className="px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-rose-950/30 bg-white border border-rose-100 hover:text-rose-600 hover:border-rose-300 transition-all flex items-center gap-3 disabled:opacity-50"
                >
                  <ArrowLeft size={16} /> Modify Profile
                </button>
                <button 
                  onClick={handlePayment} 
                  disabled={loading}
                  className="flex-1 bg-rose-600 text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-500/20 flex justify-center items-center gap-4 disabled:opacity-70 active:scale-95"
                >
                  {loading ? (
                    "ESTABLISHING SECURE CONNECTION..."
                  ) : (
                    <>Establish Marketplace Presence <Wallet size={20} /></>
                  )}
                </button>
              </div>
              <div className="text-center mt-12 flex justify-center items-center gap-4 text-rose-950/20 font-black uppercase tracking-[0.4em] text-[9px]">
                <div className="w-1.5 h-1.5 bg-rose-200 rounded-full animate-pulse" /> Official Razorpay 256-bit Encryption Verified Hub
              </div>
            </div>
          )}

          {/* STEP 3: DEPLOYMENT SUCCESS */}
          {step === 3 && (
            <div className="text-center py-20 animate-in zoom-in-95 fade-in duration-1000">
              <div className="w-28 h-28 bg-rose-50 border border-rose-100 text-rose-600 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-10 shadow-2xl shadow-rose-500/5 rotate-12 transition-transform hover:rotate-0 duration-700">
                <CheckCircle2 size={56} />
              </div>
              <h2 className="text-5xl font-black text-rose-950 uppercase tracking-tighter mb-4">Registry <span className="text-rose-600 italic">Established</span></h2>
              <p className="text-rose-950/40 text-[10px] font-black uppercase tracking-[0.4em] max-w-sm mx-auto mb-14 leading-relaxed">
                Your boutique's digital twin has been successfully deployed to the Book.My.Glow global network. Your workstation hub is now authorized for immediate activity.
              </p>
              
              <button 
                onClick={() => navigate("/dashboard")}
                className="bg-rose-950 text-white px-14 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] hover:bg-rose-600 transition-all shadow-2xl shadow-rose-950/20 flex items-center gap-3 mx-auto"
              >
                Access Control Hub <ChevronRight size={18} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RegisterSalon;
