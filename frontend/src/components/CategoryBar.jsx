import React, { useRef, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const CategoryBar = () => {
  const { backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
       const apiBase = `${backendUrl.replace(/\/$/, "")}/api`;
        const res = await axios.get(`${apiBase}/category/list`);
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, [backendUrl]);

  // Center Start
  useEffect(() => {
    if (categories.length > 0 && scrollRef.current) {
      const middleIndex = Math.floor(categories.length / 2);
      setTimeout(() => {
        const container = scrollRef.current;
        const children = container.children;
        if (children[middleIndex]) {
          const child = children[middleIndex];
          const scrollPos = child.offsetLeft - (container.clientWidth / 2) + (child.clientWidth / 2);
          container.scrollTo({ left: scrollPos, behavior: "instant" });
          setActiveIndex(middleIndex);
        }
      }, 100);
    }
  }, [categories]);

  // Scroll Listener
  const handleScroll = () => {
    if (!scrollRef.current) return;
    requestAnimationFrame(() => {
        const container = scrollRef.current;
        if(!container) return;
        const containerCenter = container.getBoundingClientRect().left + container.offsetWidth / 2;
        let closestIndex = -1;
        let minDistance = Number.MAX_VALUE;
        Array.from(container.children).forEach((child, index) => {
            const rect = child.getBoundingClientRect();
            const childCenter = rect.left + rect.width / 2;
            const distance = Math.abs(containerCenter - childCenter);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        });
        setActiveIndex(closestIndex);
    });
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll(); 
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
    };
  }, [categories]);

  const handleNavigate = (item) => {
    navigate(`/collection?${item.type}=${encodeURIComponent(item.name)}`);
  };

  if (categories.length === 0) return null;

  return (
    <div className="w-full relative z-20">
      <div className="text-center mb-4">
         <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight drop-shadow-sm">
           <span className="text-pink-600">SHOP BY </span>
           <span className="text-white text-shadow-sm">CATEGORY</span>
         </h2>
      </div>
      
      <div className="relative w-full">
        {/* ✅ NO SIDE GRADIENTS HERE */}

        <div 
          ref={scrollRef}
          className="
            flex items-center gap-8 sm:gap-12 
            overflow-x-auto no-scrollbar snap-x snap-mandatory
            /* ✅ INCREASED PADDING: py-20 to prevent ANY clipping */
            py-20 px-[50vw] 
            w-full
          "
          style={{ scrollBehavior: 'smooth' }}
        >
          {categories.map((cat, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div 
                key={idx} 
                onClick={() => handleNavigate(cat)}
                className={`
                  group relative flex flex-col items-center justify-center cursor-pointer 
                  snap-center flex-shrink-0
                  transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${isActive 
                    ? 'scale-110 -translate-y-4 z-10 opacity-100' 
                    : 'scale-90 opacity-70 hover:opacity-100 hover:scale-95'
                  }
                `}
                style={{ minWidth: '140px' }} 
              >
                <div className={`
                  relative w-32 h-32 sm:w-44 sm:h-44 
                  rounded-full overflow-hidden
                  transition-all duration-500
                  ${isActive 
                    ? 'shadow-[0_20px_40px_-10px_rgba(236,72,153,0.5)] ring-4 ring-white ring-offset-4 ring-offset-pink-300' 
                    : 'shadow-md border-4 border-white/60 grayscale-[20%]'
                  }
                  bg-white
                `}>
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                  )}
                </div>
                
                <div className={`
                  mt-5 px-5 py-2 rounded-full transition-all duration-300 transform flex items-center justify-center
                  ${isActive 
                    ? 'bg-white text-pink-600 shadow-xl translate-y-0 opacity-100 scale-100' 
                    : 'bg-transparent text-pink-900/80 translate-y-2 opacity-90 scale-90'
                  }
                `}>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-widest whitespace-nowrap">
                    {cat.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;