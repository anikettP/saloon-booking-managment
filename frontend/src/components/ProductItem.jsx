import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
// 1. Import the Popup Hook
import { usePopup } from "../context/PopupContext";

const Star = ({ filled }) => (
  <svg 
    className={`w-3.5 h-3.5 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-white stroke-2'}`} 
    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" 
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.545.044.77.77.326 1.163l-4.304 3.86a.562.562 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.304-3.86a.562.562 0 01.326-1.163l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);

const ProductItem = ({ id, image = [], name, price, originalPrice, rating = 0, reviewCount = 0 }) => {
  const { currency, addToCart } = useContext(ShopContext);
  
  // 2. Get the trigger function from the hook
  const { triggerAddToCartPopup } = usePopup();

  const imgSrc = image && image.length ? image[0] : "/images/placeholder.jpg";
  const discount = originalPrice && price && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    // A. Add to global cart state
    addToCart(id, "default");
    
    // B. Trigger the animation popup
    triggerAddToCartPopup();
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<Star key={i} filled={i <= Math.round(Number(rating))} />);
    }
    return stars;
  };

  return (
    <Link
      onClick={() => window.scrollTo(0, 0)}
      to={`/product/${id}`}
      className="group relative flex flex-col w-full h-full"
    >
      <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl border-2 border-white rounded-3xl shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-500 ease-out group-hover:shadow-[0_0_40px_rgba(255,255,255,0.9)] group-hover:bg-white/80 group-hover:-translate-y-2 group-hover:scale-[1.01]"></div>

      <div className="relative z-10 p-3 sm:p-4 flex flex-col h-full transition-transform duration-500 ease-out group-hover:-translate-y-2">
        {/* FIX: Added 'aspect-[4/5]' + 'max-h-64'.
           - On iPhone SE (grid): The aspect ratio kicks in, making the height smaller/proportional so it's not "squeezed".
           - On Larger Phones (list): 'max-h-64' kicks in, keeping it rectangular (the original look) so it doesn't get huge.
           - Desktop: 'sm:h-80' overrides everything, keeping your original desktop design.
        */}
        <div className="relative w-full aspect-[4/5] h-auto max-h-64 sm:max-h-none sm:h-80 sm:aspect-auto rounded-2xl bg-white shadow-sm shrink-0 border border-white overflow-hidden">
          <img src={imgSrc} alt={name} loading="lazy" className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-110" />
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md border border-pink-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm tracking-wide z-10">
              {discount}% OFF
            </div>
          )}
        </div>

        <div className="pt-4 flex flex-col flex-grow">
          <h3 className="h-10 text-pink-950 font-bold text-sm sm:text-base leading-tight line-clamp-2 mb-1 tracking-tight group-hover:text-pink-600 transition-colors overflow-hidden">
            {name}
          </h3>

          <div className="flex items-center gap-1 mb-3">
            <div className="flex gap-0.5">{renderStars()}</div>
            <span className="text-[10px] text-pink-800/60 font-medium ml-1">({reviewCount})</span>
          </div>

          <div className="mt-auto">
            <div className="mb-3 flex items-baseline gap-2">
              <span className="text-lg sm:text-xl font-extrabold text-pink-900">{currency}{price}</span>
              {originalPrice > price && (
                <span className="text-xs sm:text-sm text-gray-400 line-through decoration-pink-300/50">{currency}{originalPrice}</span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-widest shadow-[0_4px_15px_rgba(255,255,255,0.6)] transition-all duration-300 active:scale-[0.98] border-2 bg-pink-600 text-white border-pink-600 sm:bg-white/50 sm:text-pink-600 sm:border-pink-100 sm:backdrop-blur-md sm:hover:bg-pink-500 sm:hover:text-white sm:hover:border-pink-500 sm:hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;