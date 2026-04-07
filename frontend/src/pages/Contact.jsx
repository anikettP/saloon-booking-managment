import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const Contact = () => {
  return (
    <div className="min-h-screen pt-48 pb-32 bg-black text-white selection:bg-gold/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Superior Header */}
        <div className="text-center mb-24 animate-fade-in relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-gold/5 blur-[120px] -mt-32 pointer-events-none" />
           <p className="text-gold font-black uppercase tracking-[0.5em] text-[10px] mb-6">Concierge Relations</p>
           <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter mb-8 leading-[0.9]">
             Connect With <br />
             <span className="italic text-transparent bg-clip-text bg-gradient-to-b from-gold via-gold/80 to-gold/40 underline decoration-gold/20 underline-offset-8">The Studio</span>
           </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-20 mb-32 items-center">
          <div className="lg:w-1/2 relative group">
             <div className="absolute inset-0 bg-gold/20 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-1000 -z-10" />
             <img 
               className="w-full aspect-[4/5] object-cover rounded-[4rem] shadow-2xl border border-white/10 group-hover:border-gold/30 transition-all duration-1000 grayscale group-hover:grayscale-0 scale-95 group-hover:scale-100" 
               src={assets.contact_img} 
               alt="Boutique Studio" 
             />
             <div className="absolute bottom-10 right-10 bg-black/60 backdrop-blur-2xl px-8 py-5 rounded-[2rem] border border-white/10 shadow-2xl">
                <p className="text-gold font-black uppercase tracking-widest text-[8px] mb-1">HQ Location</p>
                <p className="text-white font-black text-xs uppercase">Ajmer, Rajasthan</p>
             </div>
          </div>

          <div className="lg:w-1/2 space-y-12">
            <div className="space-y-4">
              <p className="text-gold font-black uppercase tracking-[0.4em] text-[10px]">Headquarters</p>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Bharat's <span className="text-gold italic">Elite Registry</span></h2>
              <p className="text-white/40 font-medium leading-relaxed max-w-md">Our specialized support team is available for enterprise inquiries, salon onboarding, and premium clientele assistance.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
               <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 hover:border-gold/30 transition-all group shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-2xl -mr-8 -mt-8" />
                  <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-6 group-hover:bg-gold group-hover:text-black transition-all">📞</div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Speak With us</p>
                  <p className="text-white font-black text-lg tracking-tight">+91-9759883087</p>
               </div>

               <div className="bg-[#111] p-10 rounded-[3rem] border border-white/5 hover:border-gold/30 transition-all group shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-2xl -mr-8 -mt-8" />
                  <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-6 group-hover:bg-gold group-hover:text-black transition-all">📧</div>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Electronic Mail</p>
                  <a href="mailto:support@bookmyglow.com" className="text-white font-black text-lg tracking-tight hover:text-gold transition-colors block truncate">support@bookmyglow.com</a>
               </div>
            </div>
          </div>
        </div>

        <NewsletterBox />
      </div>
    </div>
  );
};

export default Contact;