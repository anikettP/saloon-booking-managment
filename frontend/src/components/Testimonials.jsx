import React, { useContext, useEffect, useState, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import Title from './Title';

const Testimonials = () => {
  const { backendUrl } = useContext(ShopContext);
  const [reviews, setReviews] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/testimonial/list`);
        if (res.data.success) {
          setReviews(res.data.reviews);
        }
      } catch (err) { console.error(err); }
    };
    fetchReviews();
  }, [backendUrl]);

  if (reviews.length === 0) return null;

  return (
    <div className="w-full px-4 sm:px-10">
      <div className="text-center py-4 text-3xl">
        <Title text1={'HAPPY'} text2={'CUSTOMERS'} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Real stories and photos from our lovely customers.
        </p>
      </div>

      {/* ✅ Added py-10 to prevent clipping */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto no-scrollbar py-10 px-4 snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {reviews.map((item, index) => (
          <div 
            key={index}
            className="
              min-w-[280px] sm:min-w-[320px] h-[500px] 
              bg-white/70 backdrop-blur-xl rounded-3xl p-5 
              shadow-md border border-white/60 snap-center 
              flex flex-col gap-4 relative overflow-hidden 
              group transition-all duration-500 hover:scale-[1.03] hover:shadow-lg
            "
            style={{ boxShadow: '0 10px 30px -8px rgba(236, 72, 153, 0.25)' }} 
          >
            <div className="flex items-center gap-3 z-10 shrink-0">
              <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-yellow-400 shrink-0">
                <img src={item.userImage} alt={item.userName} className="w-full h-full rounded-full object-cover border-2 border-white" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-gray-800 text-sm truncate">{item.userName}</p>
                <div className="flex text-yellow-400 text-xs">
                  {[...Array(item.rating)].map((_, i) => <span key={i}>★</span>)}
                </div>
              </div>
            </div>

            <div className="flex-grow max-h-32 overflow-y-auto bg-white p-3 z-10 relative rounded-xl">
              <p className="text-sm text-gray-700 leading-relaxed font-serif whitespace-normal">
                {item.comment}
              </p>
            </div>

            <div className="w-full h-48 rounded-xl overflow-hidden mt-auto border border-gray-100 shrink-0">
              <img src={item.productImage} alt="Delivered Item" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>
            
            <div className="absolute inset-0 bg-pink-50/20 -z-10 transition-opacity group-hover:opacity-40"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;