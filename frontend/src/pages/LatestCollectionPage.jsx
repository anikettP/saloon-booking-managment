// src/pages/LatestCollectionPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";
import Title from "../components/Title";
import PriceFilter from "../components/PriceFilter"; // ✅ Import
import AOS from "aos";

const LatestCollectionPage = () => {
  const { products } = useContext(ShopContext);
  const [latest, setLatest] = useState([]);
  const [filteredLatest, setFilteredLatest] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000); // Default Max

  // 1. Load initial Top 20
  useEffect(() => {
    setLatest(products.slice(0, 20));
  }, [products]);

  // 2. Filter by Price when slider moves
  useEffect(() => {
    const filtered = latest.filter(item => item.price <= maxPrice);
    setFilteredLatest(filtered);
    AOS.refresh();
  }, [latest, maxPrice]);

  return (
    <div className="px-4 sm:px-8 md:px-20 pt-[170px] pb-20">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-[34px] sm:text-[44px] md:text-[54px] font-bold leading-tight">
          <Title text1="LATEST" text2="COLLECTIONS" />
        </div>
        <p className="w-4/5 sm:w-3/5 mx-auto text-sm md:text-base text-gray-600 mt-4">
          Explore the most recent handcrafted string-art and décor pieces.
        </p>
      </div>

      {/* ✅ Controls Area: Slider + Count */}
      <div className="max-w-4xl mx-auto mb-10">
        <PriceFilter maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
        
        <p className="text-center text-sm text-gray-500 font-medium">
          Showing <span className="text-pink-600 font-bold text-base">{filteredLatest.length}</span> products
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredLatest.length > 0 ? (
          filteredLatest.map((item, index) => (
            <div key={item._id} data-aos="fade-up" data-aos-delay={index * 50}>
              <ProductItem
                id={item._id}
                image={item.image}
                name={item.name}
                price={item.price}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-400">
            No latest items found under ₹{maxPrice}.
          </div>
        )}
      </div>

      <div className="h-20" />
    </div>
  );
};

export default LatestCollectionPage;