import React from 'react';

const PriceFilter = ({ maxPrice, setMaxPrice, min = 0, max = 5000 }) => {
  
  // Calculate percentage for the progressive fill effect
  const percentage = max > min ? ((maxPrice - min) / (max - min)) * 100 : 0;

  return (
    <div className="w-full bg-white p-5 rounded-xl border border-pink-100 shadow-sm mb-6">
      
      {/* Header with Pink Badge */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Price Range</p>
        
        {/* ✅ Reverted to the Pink Style you liked */}
        <p className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-md border border-pink-100 shadow-sm">
          Under ₹{maxPrice}
        </p>
      </div>
      
      {/* Progressive Slider Input */}
      <div className="relative w-full h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step="100"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="
            absolute w-full h-2 rounded-lg appearance-none cursor-pointer z-20
            focus:outline-none focus:ring-0
          "
          style={{
            // ✅ Progressive Gradient Logic
            background: `linear-gradient(to right, #ec4899 ${percentage}%, #e5e7eb ${percentage}%)`
          }}
        />
        
        {/* Custom Thumb Styles (managed via CSS classes usually, but works natively with the gradient above) */}
        <style>{`
          input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #ffffff;
            border: 4px solid #ec4899; /* Pink Border */
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            margin-top: -1px; /* Align center */
          }
          input[type=range]::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #ffffff;
            border: 4px solid #ec4899;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          }
        `}</style>
      </div>
      
      {/* Min/Max Labels */}
      <div className="flex justify-between text-[11px] font-bold text-gray-400 mt-2">
        <span>₹{min}</span>
        <span>₹{max}+</span>
      </div>
    </div>
  );
};

export default PriceFilter;