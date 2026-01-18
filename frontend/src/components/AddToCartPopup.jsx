import React from 'react';
import { usePopup } from '../context/PopupContext';

const AddToCartPopup = () => {
  const { isPopupVisible, popupType } = usePopup();

  if (!isPopupVisible) return null;

  // Check if we are in "Profile" mode or "Cart" mode
  const isProfile = popupType === 'profile';

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl animate-scale-up relative overflow-hidden w-72 sm:w-80">
        
        {/* Dynamic Background Gradient (Pink for Profile, Green for Cart) */}
        <div className={`absolute inset-0 bg-gradient-to-tr ${isProfile ? 'from-pink-50' : 'from-green-50'} to-transparent opacity-50 -z-10`}></div>

        {/* Animated Icon */}
        <div className="w-24 h-24 mb-4 relative">
          {/* Ring Animation */}
          <div className={`absolute inset-0 border-4 ${isProfile ? 'border-pink-100' : 'border-green-100'} rounded-full animate-ping-slow opacity-75`}></div>
           
           {/* Main Circle Color */}
          <div className={`w-full h-full ${isProfile ? 'bg-pink-500 shadow-pink-200' : 'bg-green-500 shadow-green-200'} rounded-full flex items-center justify-center shadow-lg animate-pop-in`}>
            <svg
              className="w-14 h-14 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                className="checkmark-path"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Dynamic Text */}
        <h2 className="text-xl font-bold text-gray-800 mb-1 animate-slide-up-fade delay-300">
            {isProfile ? 'Welcome!' : 'Success!'}
        </h2>
        <p className="text-gray-600 font-medium animate-slide-up-fade delay-500 text-center">
            {isProfile ? 'Your profile is created.' : 'Product is added.'}
        </p>
        <p className="text-gray-400 text-sm mt-4 animate-pulse">
            {isProfile ? 'Taking you to profile...' : 'Redirecting to cart...'}
        </p>
      </div>
    </div>
  );
};

export default AddToCartPopup;