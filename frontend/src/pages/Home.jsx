import React from "react";
import Hero from "../components/Hero";
import LatestCollection from "../components/LatestCollection";
import BestSeller from "../components/BestSeller";
import OurPolicy from "../components/OurPolicy";
import NewsletterBox from "../components/NewsletterBox";
import BannerCarousel from "../components/BannerCarousel";
import CategoryBar from "../components/CategoryBar";
import Testimonials from "../components/Testimonials";
import Banner2 from '../components/Banner2' // 1. Import Banner2

const Home = () => {
  return (
    <div className="w-full">
      {/* Hero Section (No margin needed, it's at the top) */}
      <Hero />

      {/* ✅ MASTER LAYOUT: Consistent Gap Control */}
      {/* gap-12 = 48px. You can change this to gap-8 (32px) or gap-16 (64px) easily here. */}
      <div className="flex flex-col gap-12 sm:gap-16 md:gap-20 mt-10">
        
        {/* 1. Categories */}
        <CategoryBar />

        {/* 2. Latest Products */}
        <LatestCollection />

        {/* 3. Banner */}
        <BannerCarousel />

        {/* 4. Best Sellers */}
        <BestSeller />

         
      {/* 2. Add Banner2 Component Here */}
      <Banner2 />

        {/* 5. Testimonials */}
        <Testimonials />

        {/* 6. Policy */}
        <OurPolicy />

        {/* 7. Newsletter */}
        <div className="mb-10">
          <NewsletterBox />
        </div>
      </div>
    </div>
  );
};

export default Home;