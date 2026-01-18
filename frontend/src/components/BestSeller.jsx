import React, { useContext, useEffect, useState, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const navigate = useNavigate();
  const [bestSeller, setBestSeller] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const bs = products.filter((item) => item.bestseller);
    if (isMobile) {
      setBestSeller(bs.slice(0, 5));
    } else {
      setBestSeller(bs.slice(0, 10));
    }
  }, [products]);

  useEffect(() => {
    if (bestSeller.length > 0 && scrollRef.current) {
      const middleIndex = Math.floor(bestSeller.length / 2);
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
  }, [bestSeller]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    requestAnimationFrame(() => {
      const container = scrollRef.current;
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
    if (container) container.addEventListener("scroll", handleScroll);
    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, [bestSeller]);

  return (
    <section className="relative w-full">
      <div className="text-center py-4">
        <Title text1={"BEST"} text2={"SELLERS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600 font-medium">
          Explore WowWoolies best sellers — where every thread weaves creativity into timeless art.
        </p>
      </div>

      {/* ✅ Increased Padding to py-20 */}
      <div
        ref={scrollRef}
        className="flex items-center gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory py-20 px-[50vw]"
        style={{ scrollBehavior: "smooth" }}
      >
        {bestSeller.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={item._id}
              className={`
                min-w-[260px] sm:min-w-[300px] md:min-w-[320px] 
                snap-center flex-shrink-0 
                transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]
                ${isActive 
                  ? "scale-110 -translate-y-2 z-20 opacity-100 blur-none" 
                  : "scale-90 translate-y-2 z-0 opacity-50 blur-[2px] grayscale-[20%]"
                }
              `}
            >
              <div
                className={`
                  transition-all duration-700 rounded-3xl
                  ${isActive 
                    ? "shadow-[0_20px_50px_-12px_rgba(236,72,153,0.5)]" 
                    : "shadow-none"
                  }
                `}
              >
                <ProductItem
                  id={item._id}
                  image={item.image}
                  name={item.name}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  rating={item.averageRating}
                  reviewCount={item.reviewCount}
                />
              </div>
            </div>
          );
        })}

        <div onClick={() => navigate("/collection/bestsellers")} className={`min-w-[160px] sm:min-w-[200px] snap-center flex-shrink-0 flex flex-col items-center justify-center group cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${activeIndex === bestSeller.length ? "scale-110 opacity-100" : "scale-90 opacity-50 blur-[1px]"}`}>
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/80 backdrop-blur-xl border-2 border-pink-200 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.9)] group-hover:scale-110 group-hover:border-pink-400 group-hover:shadow-[0_0_50px_rgba(236,72,153,0.6)] transition-all duration-500">
            <img src={assets.viewmore} alt="View More" className="w-10 h-10 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-500" />
          </div>
          <p className="mt-4 text-sm font-bold text-pink-900/70 uppercase tracking-widest group-hover:text-pink-600 transition-colors">
            View All
          </p>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;