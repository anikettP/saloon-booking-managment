import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { assets } from "../assets/assets";

const Hero = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);

    // Keep AOS for rest of site (Hero text itself is static)
    AOS.init({
      duration: 900,
      easing: "ease-out-cubic",
      once: true,
      mirror: false,
    });
    AOS.refresh();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section
      className="
        relative w-full mx-0 my-0 
        overflow-visible
        pt-24
        mt-20 sm:mt-24 lg:mt-28
      "
    >
      <div className="mx-auto max-w-6xl px-4">
        <div
          className="
            hero-card rounded-2xl 
            shadow-lg relative
            /* no hover animations */
            overflow-hidden
          "
        >
          {/* Hero Image - Single Image for both Desktop & Mobile */}
          <img
            src={assets.hero_img_desktop}
            alt="Hero"
            className="
              w-full block
              h-auto              /* PHONE: natural height, no cropping */
              object-contain      /* PHONE: show full image */
              sm:object-cover     /* DESKTOP/TABLET: hero style */
              sm:h-[70vh]         /* DESKTOP/TABLET height */
              transition-none
            "
            loading="eager"
          />

          {/* Overlay Text – static, no hover, no animation */}
          <div
            className="
              absolute inset-0 z-10 
              flex flex-col items-center justify-start 
              text-white text-center px-4
              transition-none
            "
            style={{
              top: isMobile ? "84%" : "20%",
              transform: isMobile ? "translateY(-40%)" : "translateY(25%)",
            }}
          >
            <span className="font-medium text-xs sm:text-sm md:text-base uppercase tracking-widest mb-1 sm:mb-2 block text-white">
              Siddhartha Sharma
            </span>

            <h1 className="heading-font font-bold leading-tight mb-1 sm:mb-2 text-lg sm:text-2xl md:text-4xl lg:text-5xl">
              Turning Threads into Timeless Memories
            </h1>

            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <span className="font-semibold text-xs sm:text-sm md:text-base block text-white">
                2025
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;