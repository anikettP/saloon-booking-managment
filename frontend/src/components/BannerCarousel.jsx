import React, { useEffect, useRef, useState, useContext } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";

export default function BannerCarousel({ className = "" }) {
  const { backendUrl } = useContext(ShopContext);
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const apiBase = `${backendUrl.replace(/\/$/, "")}/api`;


  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${apiBase}/banner/list`);
        if (res.data.success) {
          const active = (res.data.banners || []).filter((b) => b.active);
          setBanners(active);
        }
      } catch (err) { console.error(err); }
    };
    fetchBanners();
  }, [apiBase]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [banners]);

  const handleBannerClick = (link) => {
    if (!link) return;
    if (link.startsWith("http")) window.location.href = link;
    else navigate(link);
  };

  if (!banners || banners.length === 0) return null;

  return (
    // ✅ MARGINS REMOVED - Using strict height logic
    <div
      className={`w-full overflow-hidden relative rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] ${className}`}
      style={{
        height: isMobile ? "480px" : "600px",
        borderRadius: "20px",
      }}
    >
      <div className="relative w-full h-full">
        {banners.map((b, i) => {
          const src = isMobile
            ? b.image_mobile || b.image || b.image_desktop
            : b.image_desktop || b.image || b.image_mobile;

          return (
            <img
              key={b._id || i}
              src={src}
              alt={b.title || `banner-${i}`}
              onClick={() => handleBannerClick(b.link)}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out cursor-pointer ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}
              draggable={false}
              style={{ borderRadius: "20px" }}
            />
          );
        })}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {banners.map((_, i) => (
          <button
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${i === index ? "bg-white scale-110 shadow-md" : "bg-white/40 hover:bg-white/60"}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}