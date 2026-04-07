// frontend/src/pages/SalonDetail.jsx
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { SalonContext } from "../context/SalonContext";
import { toast } from "react-toastify";
import { Share2, MessageCircle, Copy, Check, Sparkles, TrendingUp, Star } from "lucide-react";

const CATEGORY_ICONS = {
  Hair: "💇", Spa: "🧖", Nails: "💅", Makeup: "💄", Beard: "🧔", Skincare: "✨", General: "✂️"
};

const SalonDetail = () => {
  const { salonId } = useParams();
  const navigate = useNavigate();
  const { apiBase, setSelectedSalon, setSelectedService, token } = useContext(SalonContext);

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePortfolioCategory, setActivePortfolioCategory] = useState("All");
  const [activeServiceCategory, setActiveServiceCategory] = useState("All");
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${apiBase}/salons/${salonId}`);
        if (res.data.success) {
          setSalon(res.data.salon);
          setServices(res.data.services || []);
        }
      } catch (err) {
        toast.error("Failed to load salon");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [salonId, apiBase]);

  useEffect(() => {
    fetchReviews();
  }, [salonId]);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await axios.get(`${apiBase}/reviews/salon/${salonId}`);
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleBookService = (service) => {
    if (!token) {
      navigate("/login");
      return;
    }
    setSelectedSalon(salon);
    setSelectedService(service);
    navigate(`/book/${salonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 bg-[#FFFBFA] flex items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-600 rounded-[2rem] animate-spin mx-auto shadow-2xl shadow-rose-500/10 transition-all duration-1000" />
            <Sparkles className="absolute -top-4 -right-4 text-rose-400 animate-pulse" size={24} />
          </div>
          <p className="text-rose-600 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Establishing Connection...</p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen pt-28 bg-[#FFFBFA] flex items-center justify-center">
        <div className="text-center p-12 max-w-lg">
          <div className="text-8xl mb-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">💎</div>
          <p className="text-rose-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Registry Error</p>
          <h2 className="text-4xl font-black text-rose-950 uppercase tracking-tighter mb-10 leading-none">Studio Not <span className="italic">Authorized</span></h2>
          <button onClick={() => navigate("/salons")} className="bg-white text-rose-950 border border-rose-100 px-12 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-2xl">
            ← Return to Collection
          </button>
        </div>
      </div>
    );
  }

  const fallback = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80";
  const bannerImg = salon.bannerImage || salon.images?.[0] || fallback;

  const categories = ["All", ...new Set(services.map(s => s.category))];
  const displayedServices = activeServiceCategory === "All"
    ? services
    : services.filter(s => s.category === activeServiceCategory);

  return (
    <div className="min-h-screen pb-24 bg-[#FFFBFA] text-rose-950">
      {/* Hero Banner (Premium Overlay) */}
      <div className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
        <img src={bannerImg} alt={salon.name} className="w-full h-full object-cover" onError={e => { e.target.src = fallback; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FFFBFA] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-16">
          <button onClick={() => navigate("/salons")} className="text-rose-950/60 hover:text-rose-600 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2 transition-all hover:gap-4">
            ← Return to Collection
          </button>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
            <div className="max-w-2xl">
               <p className="text-rose-600 font-black uppercase tracking-[0.4em] text-[10px] mb-3">Premium Workspace</p>
               <h1 className="text-5xl sm:text-7xl font-black text-rose-950 mb-6 uppercase tracking-tight leading-none truncate">{salon.name}</h1>
               <div className="flex flex-wrap items-center gap-6 text-rose-950/40 text-[10px] font-black uppercase tracking-widest">
                 <span className="flex items-center gap-2 underline decoration-rose-200 underline-offset-4 decoration-2">📍 {salon.location}</span>
                 {salon.phone && <span className="flex items-center gap-2">📞 {salon.phone}</span>}
                 <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2 text-rose-600 border border-rose-100 shadow-xl">
                   ⭐ {salon.averageRating?.toFixed(1) || "New"}
                 </span>
               </div>
            </div>

            <div className="flex gap-3">
               <button 
                onClick={() => {
                  const url = window.location.href;
                  const text = `Experience the elite services of ${salon.name} in ${salon.location}. Book via Book.My.Glow! 💇✨`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank');
                }}
                className="bg-[#25D366] text-white p-4 rounded-2xl hover:scale-110 transition-all shadow-2xl shadow-green-500/10"
               >
                 <MessageCircle size={24} />
               </button>
               <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Professional Link Copied! 🔗");
                }}
                className="bg-white text-rose-950 border border-rose-100 p-4 rounded-2xl hover:bg-rose-600 hover:text-white transition-all group shadow-xl shadow-rose-500/5"
               >
                 <Copy size={24} className="group-hover:rotate-12 transition-transform" />
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 -mt-10 relative z-20 mb-24">
          {[
            { icon: "⏰", label: "Operations", value: `${salon.workingHours?.start || "09:00"} - ${salon.workingHours?.end || "20:00"}` },
            { icon: "⚡", label: "Status", value: "Verified Active" },
            { icon: "💎", label: "Experience", value: "Premium Grade" },
            { icon: "👨‍🎨", label: "Master Stylists", value: `${salon.artists?.length || 0} Experts` },
          ].map(item => (
            <div key={item.label} className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] p-6 border border-rose-50 shadow-2xl text-center group hover:border-rose-300 transition-all">
              <p className="text-3xl mb-3 group-hover:scale-110 transition-transform">{item.icon}</p>
              <p className="text-[9px] text-rose-950/20 font-black uppercase tracking-widest">{item.label}</p>
              <p className="text-xs font-black text-rose-950 mt-1 group-hover:text-rose-600 transition-colors">{item.value}</p>
            </div>
          ))}
        </div>

        {/* SECTION: THE MASTER SERVICES */}
        <section className="mb-32">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <p className="text-rose-600 font-black uppercase tracking-[0.3em] text-[10px] mb-3">Service Menu</p>
              <h2 className="text-5xl font-black uppercase tracking-tighter">Elite <span className="text-rose-600 italic">Procedures</span></h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveServiceCategory(cat)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                    activeServiceCategory === cat
                      ? "bg-rose-600 text-white border-rose-600 shadow-[0_0_20px_rgba(225,29,72,0.2)]"
                      : "bg-white text-rose-950/40 border-rose-100 hover:border-rose-300 shadow-sm"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedServices.length > 0 ? (
              displayedServices.map((service, idx) => (
                <ServiceCard 
                  key={service._id} 
                  service={service} 
                  onBook={() => handleBookService(service)} 
                  isBestseller={idx < 2}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center opacity-40 uppercase font-black text-[10px] tracking-widest">No services found for this category.</div>
            )}
          </div>
        </section>

        {/* SECTION: INTERACTIVE LOCATION & MAP */}
        <section className="mb-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
              <p className="text-rose-600 font-black uppercase tracking-[0.3em] text-[10px] mb-3">Find Us</p>
              <h2 className="text-5xl font-black uppercase tracking-tighter">Studio <span className="text-rose-600 italic">Location</span></h2>
              <p className="text-rose-900/40 mt-6 leading-relaxed max-w-md font-medium text-sm">{salon.address || `${salon.location}, City Central. Accessible for all premium visitors.`}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-600 border border-rose-100 shadow-xl">📍</div>
                <div>
                   <p className="text-[9px] font-black text-rose-950/20 uppercase tracking-widest">Main Studio Address</p>
                   <p className="font-black text-rose-950 text-base">{salon.address || salon.location}</p>
                </div>
              </div>
              <button 
                onClick={() => window.open(salon.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.name + " " + salon.location)}`, '_blank')}
                className="w-fit bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-3 shadow-2xl shadow-rose-500/20"
              >
                 Open Navigation 🛰️
              </button>
            </div>
          </div>
          
          <div className="h-[400px] bg-white rounded-[3rem] overflow-hidden border border-rose-100 relative group shadow-2xl shadow-rose-500/5">
            <iframe
              title="Salon Map"
              width="100%"
              height="100%"
              className="opacity-80 group-hover:opacity-100 transition-all duration-700"
              frameBorder="0"
              scrolling="no"
              marginHeight="0"
              marginWidth="0"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(salon.name + " " + salon.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
            ></iframe>
            <div className="absolute inset-0 pointer-events-none border-[12px] border-white rounded-[3rem]" />
          </div>
        </section>

        {/* SECTION: BOUTIQUE PORTFOLIO */}
        <section className="mb-32">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div>
              <p className="text-rose-600 font-black uppercase tracking-[0.3em] text-[10px] mb-3">Portfolio</p>
              <h2 className="text-5xl font-black uppercase tracking-tighter">Boutique <span className="text-rose-600 italic">Showcase</span></h2>
            </div>
          </div>

          <div className="columns-2 md:columns-4 gap-6 space-y-6">
            {(salon.images || []).map((img, idx) => (
              <div key={idx} className="break-inside-avoid rounded-[2.5rem] overflow-hidden group relative border border-rose-50 shadow-lg cursor-zoom-in">
                <img src={img} alt="Work" className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                   <p className="text-rose-600 font-black text-[9px] uppercase tracking-[0.2em] mb-1">Visual Signature</p>
                   <p className="text-rose-950 font-black text-xs uppercase tracking-widest">Mastery {idx + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: VOICE OF CLIENTS */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <p className="text-rose-600 font-black uppercase tracking-[0.3em] text-[10px] mb-3">Customer Voice</p>
            <h2 className="text-5xl font-black uppercase tracking-tighter">Verified <span className="text-rose-600 italic">Appreciation</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.slice(0, 4).map(review => (
              <div key={review._id} className="bg-white p-10 rounded-[3rem] border border-rose-50 hover:border-rose-200 transition-all group shadow-xl shadow-rose-500/5">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-rose-500/5">
                      {review.user?.name?.[0].toUpperCase() || "U"}
                    </div>
                    <div>
                      <h4 className="font-black text-rose-950 uppercase tracking-tight text-sm">{review.user?.name || "Client"}</h4>
                      <p className="text-[9px] text-rose-950/20 font-black uppercase tracking-widest leading-none mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} className={`text-sm ${review.rating >= star ? "text-rose-600" : "text-rose-100"}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-base text-rose-950/60 leading-relaxed italic font-medium">&quot;{review.comment}&quot;</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: BIOGRAPHY */}
        <section className="bg-white p-12 sm:p-20 rounded-[4rem] border border-rose-50 relative overflow-hidden shadow-2xl shadow-rose-500/5">
           <Sparkles className="absolute -top-10 -right-10 text-rose-500/5 w-64 h-64" />
           <div className="max-w-3xl relative z-10">
              <p className="text-rose-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Official Bio</p>
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-8 italic text-rose-950">Cultivating <span className="text-rose-600 not-italic underline decoration-rose-200 underline-offset-8">Excellence</span></h2>
              <p className="text-lg text-rose-950/60 leading-relaxed font-medium uppercase tracking-[0.1em] text-[12px]">
                {salon.description || `Specializing in high-end transformations, ${salon.name} is a sanctuary for those who value craftsmanship and professional integrity. Our artists are selectively chosen to maintain the highest standards of the Book.My.Glow network.`}
              </p>
           </div>
        </section>
      </div>
    </div>
  );
};

const ServiceCard = ({ service, onBook, isBestseller }) => (
  <div className="group bg-white rounded-[3rem] p-8 border border-rose-50 shadow-xl hover:shadow-2xl hover:border-rose-100 hover:-translate-y-2 transition-all duration-500 flex flex-col relative overflow-hidden">
    {isBestseller && (
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-2 shadow-2xl">
           <TrendingUp size={10} /> Signature Service
        </div>
      </div>
    )}
    {service.image && (
      <div className="overflow-hidden rounded-[2rem] mb-6 aspect-video shadow-lg">
        <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      </div>
    )}
    <div className="flex items-start justify-between mb-4">
      <h3 className="font-black text-rose-950 text-xl leading-tight uppercase tracking-tight">{service.name}</h3>
      <span className="text-[9px] bg-rose-50 text-rose-600 px-3 py-1 rounded-full ml-3 flex-shrink-0 font-black uppercase tracking-widest border border-rose-100">
        {service.category}
      </span>
    </div>
    {service.description && (
      <p className="text-rose-950/40 text-[10px] mb-6 line-clamp-2 flex-1 font-black uppercase tracking-widest leading-relaxed">{service.description}</p>
    )}
    <div className="flex items-center justify-between mt-auto pt-6 border-t border-rose-50">
      <div>
        <p className="text-rose-600 text-2xl font-black tracking-tight">₹{service.price}</p>
        <p className="text-[10px] text-rose-950/20 font-black uppercase tracking-widest">{service.duration} MIN SESSION</p>
      </div>
      <button
        onClick={onBook}
        className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-8 py-3.5 rounded-2xl hover:bg-rose-700 transition-all transform active:scale-95 shadow-xl shadow-rose-500/10"
      >
        Select
      </button>
    </div>
  </div>
);

export default SalonDetail;
