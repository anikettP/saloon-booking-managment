import React, { useContext, useEffect, useState } from 'react';
import { SalonContext } from '../context/SalonContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import NewsletterBox from '../components/NewsletterBox';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Scissors, Star, Clock, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import CampaignBanner from '../components/CampaignBanner';

const Home = () => {
  const { salons, backendUrl, currency } = useContext(SalonContext);
  const navigate = useNavigate();
  
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/banners/list`);
        if (res.data.success) {
          setBanners(res.data.banners.filter(b => b.isActive));
        }
      } catch (err) {
        console.error("Banner fetch error", err);
      }
    };
    fetchBanners();
  }, [backendUrl]);

  // Auto-slide banners
  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentBanner(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [banners]);

  const featuredSalons = salons.filter(s => s.approved).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FFFBFA] overflow-hidden text-rose-950">
      
      <CampaignBanner />

      {/* ─── DYNAMIC HERO BANNER (Light Premium) ─── */}
      <section className="relative h-[80vh] w-full overflow-hidden">
        {banners.length > 0 ? (
          <div className="relative w-full h-full">
            {banners.map((banner, index) => (
              <div
                key={banner._id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentBanner ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <div className="absolute inset-0 bg-white/20 z-10" />
                <picture>
                  <source srcSet={banner.imageMobile || banner.imageUrl} media="(max-width: 640px)" />
                  <img
                    src={banner.imageDesktop || banner.imageUrl}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </picture>
                
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="animate-fade-in-up">
                      <div className="flex flex-col sm:flex-row gap-6 mt-12">
                        <button 
                          onClick={() => navigate(banner.linkUrl || banner.link || '/salons')}
                          className="bg-rose-600 text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-700 hover:scale-105 transition-all shadow-2xl shadow-rose-500/20"
                        >
                          Book Your Glow
                        </button>
                        <button 
                          onClick={() => navigate('/map-booking')}
                          className="bg-white/40 backdrop-blur-3xl text-rose-950 border border-white/60 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/60 transition-all transform hover:scale-105 shadow-xl"
                        >
                          📍 Discovery Map
                        </button>
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback Static Hero (Rose) */
          <div className="flex flex-col gap-8 md:flex-row justify-center items-center h-full px-6">
            {/* WhatsApp Card (Premium Light) */}
            <div className="flex flex-col sm:flex-row max-w-4xl items-center gap-10 rounded-[3rem] bg-white border border-rose-100 p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="relative shrink-0">
                 <img src={assets.WA_QR} alt="WhatsApp QR" className="w-40 h-40 object-contain group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute -top-3 -right-3 bg-rose-600 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-2xl">SCAN ME</div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-rose-600 font-black uppercase tracking-[0.4em] text-[9px] mb-3">Instant Concierge</p>
                <h3 className="text-3xl font-black text-rose-950 mb-3 uppercase tracking-tight">Direct <span className="text-rose-600 italic">Assistance</span></h3>
                <p className="text-rose-900/40 mb-8 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-md">
                  Connect with our support ensemble via <span className="text-rose-600 font-black">WhatsApp</span> for immediate booking synchronization.
                </p>
                <a
                  href={`https://wa.me/919352424085`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-rose-600 text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-2xl shadow-rose-500/20"
                >
                  ESTABLISH CONTACT
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── FEATURED SALONS (Rose & Champagne) ─── */}
      <section className="py-32 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div>
             <div className="flex items-center gap-3 text-rose-600 font-black uppercase tracking-[0.3em] text-[10px] mb-4">
                <Sparkles size={16} /> Elite Collections
             </div>
             <h2 className="text-5xl font-black text-rose-950 uppercase tracking-tight">Signature <span className="text-rose-600 italic">Workspaces</span></h2>
          </div>
          <button onClick={() => navigate('/salons')} className="text-rose-950/40 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 hover:text-rose-600 transition-all hover:gap-4">
            Browse Entire Portfolio <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-12 no-scrollbar">
          {featuredSalons.map((salon) => (
            <div 
              key={salon._id} 
              onClick={() => navigate(`/salon/${salon._id}`)}
              className="flex-none w-[300px] sm:w-[380px] snap-start group cursor-pointer bg-white rounded-[3.5rem] overflow-hidden border border-rose-50 shadow-xl hover:shadow-2xl hover:border-rose-100 transition-all duration-700"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img 
                  src={salon.images?.[0] || assets.salon_placeholder} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  alt={salon.name} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-40" />
                <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-black text-rose-600 shadow-2xl border border-rose-50">
                  <Star size={12} className="fill-rose-600" />
                  <span>4.9</span>
                </div>
              </div>
              <div className="p-10">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em] mb-3">{salon.categories?.[0] || 'Premium Workspace'}</p>
                <h3 className="font-black text-rose-950 text-2xl mb-2 group-hover:text-rose-600 transition-colors uppercase tracking-tight leading-none">{salon.name}</h3>
                <p className="text-[10px] text-rose-950/40 font-bold uppercase tracking-widest">{salon.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS Section (Premium Light) ─── */}
      <section className="bg-white py-32 px-6 sm:px-12 border-y border-rose-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <p className="text-rose-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4">Operational Protocol</p>
            <h2 className="text-5xl font-black text-rose-950 mb-6 uppercase tracking-tight">The <span className="text-rose-600 italic">Procedures</span></h2>
            <div className="w-24 h-1 bg-rose-100 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { id: '01', title: 'Find Studio', text: 'Select your preferred professional workspace and service tier.', icon: <MapPin size={32} /> },
              { id: '02', title: 'Pick Timeline', text: 'Choose your elite artist and a synchronized time slot.', icon: <Clock size={32} /> },
              { id: '03', title: 'Confirm Status', text: 'Instant authentication. Secure checkout or on-site settlement.', icon: <Scissors size={32} /> },
            ].map((step) => (
              <div key={step.id} className="relative bg-[#FFFBFA] p-12 rounded-[3.5rem] border border-rose-50 shadow-xl hover:bg-white hover:border-rose-100 transition duration-700 group">
                <span className="absolute -top-8 left-12 text-7xl font-black text-rose-600/[0.03] group-hover:text-rose-600/5 transition duration-1000">{step.id}</span>
                <div className="bg-rose-50 text-rose-600 w-20 h-20 rounded-[2rem] border border-rose-100 flex items-center justify-center mb-10 group-hover:bg-rose-600 group-hover:text-white transition-all duration-700">
                  {step.icon}
                </div>
                <h4 className="text-xl font-black text-rose-950 mb-4 uppercase tracking-tight group-hover:text-rose-600 transition-colors">{step.title}</h4>
                <p className="text-rose-900/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER (Rose Frosted) ─── */}
      <section className="py-24 bg-[#FFFAF8]">
        <NewsletterBox />
      </section>

    </div>
  );
};

export default Home;