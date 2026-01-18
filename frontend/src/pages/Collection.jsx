import React, { useContext, useEffect, useState, useMemo } from 'react'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import Title from '../components/Title'
import ProductItem from '../components/ProductItem'
import PriceFilter from '../components/PriceFilter'
import { useSearchParams } from 'react-router-dom'

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext)
  const [searchParams, setSearchParams] = useSearchParams(); 

  const [showFilter, setShowFilter] = useState(false)
  const [filterProducts, setFilterProducts] = useState([])
  
  // Filters
  const [category, setCategory] = useState([])
  const [giftFor, setGiftFor] = useState([]) 
  const [festive, setFestive] = useState([]) 
  const [availability, setAvailability] = useState(false) 
  const [sortType, setSortType] = useState('relavent')

  // ✅ DYNAMIC MAX PRICE LOGIC
  // Calculate the highest price from all products dynamically
  const highestPrice = useMemo(() => {
    return products.length > 0 
      ? Math.max(...products.map(p => Number(p.price))) 
      : 5000;
  }, [products]);

  // State tracks the user's selected max price
  const [maxPrice, setMaxPrice] = useState(highestPrice);

  // Sync state with highest price once products load (if user hasn't touched it)
  useEffect(() => {
    if (products.length > 0 && maxPrice === 5000) {
        setMaxPrice(highestPrice);
    }
  }, [highestPrice, products]);

  // Read URL Params
  useEffect(() => {
    const giftParam = searchParams.get('gift');
    const catParam = searchParams.get('category');
    const festiveParam = searchParams.get('festive');
    const priceParam = searchParams.get('maxPrice');

    if (giftParam) setGiftFor([giftParam]);
    if (catParam) setCategory([catParam]);
    if (festiveParam) setFestive([festiveParam]);
    if (priceParam) setMaxPrice(Number(priceParam));
  }, [searchParams]); 

  const clearPriceFilter = () => {
    setMaxPrice(highestPrice); // Reset to full range
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('maxPrice');
    setSearchParams(newParams);
  };

  const applyFilter = () => {
    let productsCopy = products.slice()

    if (showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    // Filter by Price
    productsCopy = productsCopy.filter(item => item.price <= maxPrice);

    if (category.length > 0) productsCopy = productsCopy.filter(item => category.includes(item.category))
    if (giftFor.length > 0) productsCopy = productsCopy.filter(item => item.giftFor && item.giftFor.some(g => giftFor.includes(g)))
    if (festive.length > 0) productsCopy = productsCopy.filter(item => item.festive && item.festive.some(f => festive.includes(f)))
    if (availability) productsCopy = productsCopy.filter(item => item.inStock === true)

    switch (sortType) {
      case 'low-high': productsCopy.sort((a, b) => a.price - b.price); break;
      case 'high-low': productsCopy.sort((a, b) => b.price - a.price); break;
      case 'a-z': productsCopy.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    setFilterProducts(productsCopy)
  }

  useEffect(() => {
    applyFilter()
  }, [category, giftFor, festive, availability, search, showSearch, products, sortType, maxPrice])

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-[170px] pb-14 border-t px-4 sm:px-10">
      
      {/* Sidebar */}
      <div className="min-w-60">
         <p onClick={() => setShowFilter(!showFilter)} className="my-2 text-xl flex items-center cursor-pointer gap-2 font-medium">FILTERS <img className={`h-3 sm:hidden ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" /></p>
         
         <div className={`flex flex-col gap-4 transition-all duration-300 ${showFilter ? '' : 'hidden'} sm:flex`}>
            
            {/* ✅ DYNAMIC PRICE FILTER */}
            {/* We pass the calculated 'highestPrice' as the max limit for the slider */}
            <PriceFilter maxPrice={maxPrice} setMaxPrice={setMaxPrice} max={highestPrice} />

            {/* (Your other filters like Categories/GiftFor go here) */}
         </div>
      </div>

      {/* Right Side */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-6 items-center flex-wrap gap-4">
          
          <div className="flex items-end gap-4">
             <Title text1={'ALL'} text2={'COLLECTIONS'} />
             
             {/* ✅ PURE BLACK TEXT for Count */}
             <span className="text-sm text-black font-bold mb-5 ml-2 border-l-2 border-black pl-4">
               Showing {filterProducts.length} Products
             </span>

             {/* Show active filter badge if price is lowered */}
             {maxPrice < highestPrice && (
               <div className="hidden sm:flex items-center gap-2 bg-pink-100 border border-pink-300 text-pink-900 px-3 py-1 rounded-full text-xs font-bold mb-4 shadow-sm">
                 <span>&lt; ₹{maxPrice}</span>
                 <button onClick={clearPriceFilter} className="text-red-600 hover:scale-110 ml-1">✕</button>
               </div>
             )}
          </div>

          {/* ✅ UPDATED SORT DROPDOWN UI */}
          <div className="relative">
            <select 
                onChange={(e) => setSortType(e.target.value)} 
                className='border-2 border-black text-sm text-black font-semibold px-4 py-2 rounded-lg bg-white outline-none cursor-pointer hover:bg-gray-50 focus:ring-2 focus:ring-pink-200 transition-all'
            >
                <option value="relavent">Sort by: Relevant</option>
                <option value="low-high">Sort by: Price (Low to High)</option>
                <option value="high-low">Sort by: Price (High to Low)</option>
                <option value="a-z">Sort by: Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-8">
          {filterProducts.map((item, index) => (
            <ProductItem key={index} id={item._id} name={item.name} price={item.price} originalPrice={item.originalPrice} image={item.image} rating={item.averageRating} reviewCount={item.reviewCount} />
          ))}
          {filterProducts.length === 0 && (
             <div className="col-span-full py-20 text-center">
                <p className="text-xl font-bold text-gray-400">No products found in this range.</p>
                <button onClick={clearPriceFilter} className="mt-4 text-pink-600 font-semibold hover:underline">Reset Price Filter</button>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Collection