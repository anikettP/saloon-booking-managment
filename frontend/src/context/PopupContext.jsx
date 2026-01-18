import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const PopupContext = createContext();

export const usePopup = () => useContext(PopupContext);

export const PopupProvider = ({ children }) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('cart'); // 'cart' or 'profile'
  const navigate = useNavigate();

  // 1. ADD TO CART Trigger (Green -> Cart)
  const triggerAddToCartPopup = () => {
    setPopupType('cart');
    setIsPopupVisible(true);
    setTimeout(() => {
      setIsPopupVisible(false);
      setTimeout(() => {
         navigate('/cart');
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }, 3000);
  };

  // 2. NEW: PROFILE Trigger (Pink -> Profile)
  const triggerProfilePopup = () => {
    setPopupType('profile');
    setIsPopupVisible(true);
    setTimeout(() => {
      setIsPopupVisible(false);
      setTimeout(() => {
         navigate('/profile'); // Redirect to Profile page
         window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    }, 3000);
  };

  return (
    <PopupContext.Provider value={{ isPopupVisible, popupType, triggerAddToCartPopup, triggerProfilePopup }}>
      {children}
    </PopupContext.Provider>
  );
};