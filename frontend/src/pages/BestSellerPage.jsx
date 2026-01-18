// src/pages/BestSellerPage.jsx
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductItem from "../components/ProductItem";
import Title from "../components/Title";
import PriceFilter from "../components/PriceFilter"; // ✅ Import
import AOS from "aos";

const BestSellerPage = () => {
  const { products } = useContext(ShopContext);
  const [bestProducts, setBestProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [maxPrice, setMaxPrice] = useState(5000);

  // 1. Filter Bestsellers
  useEffect(() => {
    const bs = products.filter((item) => item.bestseller);
    setBestProducts(bs);
  }, [products]);

  // 2. Filter by Price
  useEffect(() => {
    const filtered = bestProducts.filter(item => item.price <= maxPrice);
    setFilteredProducts(filtered);
    AOS.refresh();
  }, [bestProducts, maxPrice]);

  return (
    <div className="px-4 sm:px-8 md:px-20 pt-[170px] pb-20">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-[34px] sm:text-[44px] md:text-[54px] font-bold leading-tight">
          <Title text1="BEST" text2="SELLERS" />
        </div>
        <p className="w-4/5 sm:w-3/5 mx-auto text-sm md:text-base text-gray-600 mt-4">
          Most loved WowWoolies creations.
        </p>
      </div>

      {/* ✅ Controls Area */}
      <div className="max-w-4xl mx-auto mb-10">
        <PriceFilter maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
        
        <p className="text-center text-sm text-gray-500 font-medium">
          Showing <span className="text-pink-600 font-bold text-base">{filteredProducts.length}</span> bestsellers
        </p>
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item, index) => (
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
            No bestsellers found under ₹{maxPrice}.
          </div>
        )}
      </div>

      <div className="h-20" />
    </div>
  );
};

export default BestSellerPage;