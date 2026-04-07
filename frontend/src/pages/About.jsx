import React from 'react';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import NewsletterBox from '../components/NewsletterBox';

const About = () => {
  return (
    <div className="pt-40 pb-24 bg-black text-white relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 blur-[150px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 blur-[150px] -ml-64 -mb-64" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* HERO SECTION (Premium) */}
        <div className="mb-24 flex flex-col lg:flex-row items-center gap-16">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />
            <img
              className="relative w-full lg:max-w-[500px] rounded-[3rem] border border-white/10 shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
              src={assets.about_img}
              alt="About"
            />
            <div className="absolute -bottom-8 -right-8 bg-[#111] p-6 rounded-2xl border border-gold/20 shadow-2xl">
               <p className="text-gold font-black text-2xl tracking-tighter">EST. 2024</p>
               <p className="text-[8px] text-white/40 font-black uppercase tracking-widest mt-1">Premium Engineering</p>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="inline-block px-5 py-2 bg-gold/10 rounded-full border border-gold/20 mb-4">
              <p className="text-gold font-black uppercase tracking-[0.3em] text-[10px]">Strategic Evolution</p>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white uppercase tracking-tight leading-none mb-6">
              Our <span className="text-gold italic">Purpose</span>
            </h1>
            <p className="text-white/60 text-lg leading-relaxed font-medium">
              Developed by a passionate team of final-year Computer Science specialists from{' '}
              <a
                href="https://www.ecajmer.ac.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold font-black hover:text-white transition-colors"
              >
                GECA, Ajmer
              </a>.
              Initially conceived as a tactical solution for real-world inefficienties, Book.My.Glow evolved into a high-fidelity Salon Management Ecosystem.
            </p>
            <p className="text-white/40 text-md leading-relaxed">
              We bridge the definitive gap between traditional studio craftsmanship and modern enterprise technology. Every line of code is architected to optimize operations, enhance elite client retention, and deliver a seamless digital-first experience.
            </p>
            <div className="pt-6 border-t border-white/5 italic text-gold/60 font-serif text-xl">
              &quot;Built with passion, powered by elite engineering, and designed for real-world dominance.&quot;
            </div>
          </div>
        </div>

        {/* VALUE PROPOSITION GRID */}
        <div className="mb-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "Smart Architecture", desc: "Built with a specialized MERN stack to ensure enterprise-level performance and lightning-fast booking synchronized across all hubs." },
            { title: "Scalable Operations", desc: "Designed for massive salon networks, supporting recursive artist assignments and multi-hub management effortlessly." },
            { title: "Elite Experience", desc: "An intuitive, high-fidelity UI that caters to both the high-end consumer and the discerning professional proprietor." }
          ].map((v, i) => (
            <div key={i} className="bg-[#111]/50 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-white/5 hover:border-gold/30 transition-all duration-500 group">
               <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-gold mb-6 group-hover:scale-110 transition duration-500">
                  <span className="font-black text-lg">0{i+1}</span>
               </div>
               <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4">{v.title}</h4>
               <p className="text-white/30 text-xs font-bold uppercase tracking-widest leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* TEAM LEADERSHIP SECTION */}
        <div className="bg-[#111] rounded-[4rem] border border-white/5 p-12 md:p-20 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
           <div className="relative z-10 flex flex-col lg:flex-row items-center gap-20">
              <div className="relative shrink-0 group">
                <div className="absolute -inset-4 bg-gold/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition duration-1000" />
                <img
                  src={assets.founder_img}
                  alt="Founder"
                  className="relative w-72 h-72 lg:w-96 lg:h-96 rounded-full object-cover border-4 border-gold/30 grayscale hover:grayscale-0 transition-all duration-1000 shadow-[0_0_80px_rgba(212,175,55,0.15)]"
                />
              </div>

              <div className="space-y-8 flex-1 text-center lg:text-left">
                <div>
                   <p className="text-gold font-black uppercase tracking-[0.4em] text-[10px] mb-4">Engineering Leadership</p>
                   <h2 className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none mb-3">
                      Asst. <span className="text-gold italic">Aniket Patel</span>
                   </h2>
                   <p className="text-white/40 font-black uppercase tracking-widest text-[10px]">Final Year CSE Scholar — GECA, Ajmer (Rajasthan)</p>
                </div>
                
                <p className="text-white/60 text-lg leading-relaxed font-medium">
                  A full-stack system architect focused on delivering high-impact, scalable web applications. This ecosystem reflects my definitive commitment to bridging MERN stack excellence with sophisticated system design.
                </p>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                   <a href="https://aniketportfoliov81.vercel.app/" target="_blank" rel="noreferrer" className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gold transition-all shadow-2xl">
                      View Portfolio Hub
                   </a>
                </div>
              </div>
           </div>
        </div>

        {/* NEWSLETTER INTEGRATION */}
        <div className="mt-40">
           <NewsletterBox />
        </div>

      </div>
    </div>
  );
};

export default About;