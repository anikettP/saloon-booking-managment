import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';

const Banner2 = () => {
  const { backendUrl } = useContext(ShopContext);
  const [banner, setBanner] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // --- HELPER TO FIX URL ISSUES (Same as Admin) ---
  const getApiUrl = (endpoint) => {
    // Remove trailing slash from backendUrl if present
    const cleanBase = backendUrl.replace(/\/+$/, '');
    
    // Check if backendUrl already ends with /api
    if (cleanBase.endsWith('/api')) {
       // If endpoint also starts with api/, remove it to avoid duplication
       return `${cleanBase}/${endpoint.replace(/^api\//, '')}`;
    }
    // Otherwise, just join them normally
    return `${cleanBase}/${endpoint}`;
  }

  // Handle Resize for Responsive Dimensions
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Data
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await axios.get(getApiUrl('api/banner2/get'));
        if (response.data.success) {
          setBanner(response.data.banner);
        }
      } catch (error) {
        console.error("Error fetching banner2:", error);
      }
    };
    fetchBanner();
  }, [backendUrl]);

  if (!banner) return null;

  // Determine which image to show based on screen size
  const src = isMobile ? banner.imageMobile : banner.imageDesktop;

  return (
    <div
      className="w-full overflow-hidden relative rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] my-10"
      style={{
        height: isMobile ? "480px" : "600px",
        borderRadius: "20px",
      }}
    >
      <div className="relative w-full h-full">
        <img
          src={src}
          alt="Promo Banner"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ borderRadius: "20px" }}
        />
      </div>
    </div>
  );
};

export default Banner2;