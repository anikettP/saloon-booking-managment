import React from 'react';
import { assets } from '../assets/assets';

const OurPolicy = () => {
  return (
    <section className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-8 text-center py-10 px-4 text-base sm:text-lg md:text-xl text-gray-700">
      <div>
        <img src={assets.quality_icon} className="w-[120px] m-auto mb-5" alt="Craftsmanship" />
        <p className="font-bold text-xl sm:text-2xl text-pink-900 mb-2">Handcrafted Perfection</p>
        <p className="text-gray-500 leading-relaxed">Made with care and finest materials.</p>
      </div>

      <div>
        <img src={assets.authentic_icon || assets.exchange_icon} className="w-[105px] m-auto mb-5" alt="Authentic" />
        <p className="font-bold text-xl sm:text-2xl text-pink-900 mb-2">Authentic Jaipur Art</p>
        <p className="text-gray-500 leading-relaxed">Timeless artistry from Rajasthan.</p>
      </div>

      <div>
        <img src={assets.support_img} className="w-[85px] m-auto mb-5" alt="Support" />
        <p className="font-bold text-xl sm:text-2xl text-pink-900 mb-2">Reliable Support</p>
        <p className="text-gray-500 leading-relaxed">Here to assist you every step.</p>
      </div>
    </section>
  );
};

export default OurPolicy;