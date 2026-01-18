import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0 && cartItems && Object.keys(cartItems).length > 0) {
      const tempData = [];
      for (const itemId in cartItems) {
        const sizesObj = cartItems[itemId] || {};
        
        for (const sizeKey in sizesObj) {
          const quantity = Number(sizesObj[sizeKey]) || 0;
          if (quantity > 0) {
            tempData.push({ _id: itemId, size: sizeKey, quantity });
          }
        }
      }
      setCartData(tempData);
    } else {
      setCartData([]);
    }
  }, [cartItems, products]);

  const increase = (id, sizeKey, current) => {
    updateQuantity(id, sizeKey, Number(current) + 1);
  };

  const decrease = (id, sizeKey, current) => {
    const next = Number(current) - 1;
    if (next <= 0) updateQuantity(id, sizeKey, 0); 
    else updateQuantity(id, sizeKey, next);
  };

  return (
    // ✅ FIXED SPACING: Standardized top padding, removed extra margins
    <div className='pt-[170px] pb-20 border-t min-h-[60vh]'>

      <div className='text-2xl mb-10 text-center'>
        <Title text1={'YOUR'} text2={'CART'} />
      </div>

      {cartData.length === 0 ? (
        <div className='text-center py-20 text-gray-600'>
          <img
            src={assets.empty_cart_icon}
            alt="Empty cart"
            className='mx-auto w-28 opacity-70 mb-5'
          />
          <p className='text-lg font-medium mb-4'>Your cart is empty.</p>
          <button
            onClick={() => navigate('/collection')}
            className='bg-black text-white px-6 py-2 rounded-md text-sm hover:bg-gray-800 transition'
          >
            Shop Now
          </button>
        </div>
      ) : (
        <div className='max-w-6xl mx-auto px-4'>
          <div className='flex flex-col gap-4'>
            {cartData.map((item, index) => {
              const productData = products.find((product) => product._id === item._id || product.id === item._id);
              
              if (!productData) return null;

              const rawSize = item.size;
              let displaySize = rawSize;
              let customDetails = null;

              if (rawSize.includes('__custom__')) {
                const parts = rawSize.split('__custom__');
                displaySize = parts[0]; 
                try {
                  customDetails = JSON.parse(parts[1]); 
                } catch (e) {
                  console.error("Error parsing custom details", e);
                }
              }
              
              let priceToUse = productData.price; 
              if (productData.sizes && Array.isArray(productData.sizes)) {
                 const sizeObj = productData.sizes.find(s => s.name === displaySize);
                 if (sizeObj) priceToUse = Number(sizeObj.price);
              }
              
              if (customDetails && customDetails.__extra) {
                 priceToUse += Number(customDetails.__extra);
              }

              const itemSubtotal = priceToUse * Number(item.quantity);

              return (
                <div 
                  key={index} 
                  className='bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-4 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] gap-4 items-center'
                >
                  {/* Image */}
                  <div className='flex items-center gap-4'>
                    {productData?.image?.[0] ? (
                      <img
                        className='w-24 h-24 object-cover rounded-md border border-gray-200'
                        src={productData.image[0]}
                        alt={productData.name}
                      />
                    ) : (
                      <div className='w-24 h-24 bg-gray-100 flex items-center justify-center text-xs rounded-md'>
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className='flex flex-col justify-between py-1'>
                    <div>
                      <p className='text-sm sm:text-lg font-semibold text-gray-800'>{productData?.name ?? 'Unknown Product'}</p>

                      <div className='text-xs text-gray-500 mt-1 flex flex-wrap gap-2 items-center'>
                        {productData?.category && <span className='px-2 py-0.5 bg-gray-100 rounded text-xs border'>{productData.category}</span>}
                        <span className='px-2 py-0.5 bg-pink-50 text-pink-700 border border-pink-100 rounded text-xs font-medium'>
                          Size: {displaySize}
                        </span>
                      </div>

                      {customDetails && (
                        <div className="mt-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                          {Object.entries(customDetails).map(([key, val]) => {
                            if (key === '__extra') return null; 
                            return (
                                <div key={key} className="text-[11px] text-gray-700 flex gap-1">
                                <span className="font-semibold text-gray-900">{key}:</span>
                                <span className="truncate">{val}</span>
                                </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div className='mt-3 flex items-center gap-4'>
                      <p className='text-lg font-semibold text-rose-700'>{currency}{priceToUse}</p>

                      <div className='flex items-center border rounded-md overflow-hidden bg-white'>
                        <button
                          onClick={() => decrease(item._id, item.size, item.quantity)}
                          className='px-3 py-1 text-lg font-medium text-gray-600 hover:bg-gray-50 transition'
                        >
                          −
                        </button>
                        <span className="px-3 text-sm font-medium text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => increase(item._id, item.size, item.quantity)}
                          className='px-3 py-1 text-lg font-medium text-gray-600 hover:bg-gray-50 transition'
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subtotal & Delete */}
                  <div className='flex flex-col items-end gap-3'>
                    <div className='text-right'>
                      <p className='text-xs text-gray-500 mb-0.5'>Subtotal</p>
                      <p className='text-lg font-bold text-gray-900'>{currency}{itemSubtotal}</p>
                    </div>

                    <button
                      onClick={() => updateQuantity(item._id, item.size, 0)}
                      className='p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition'
                      title='Remove from cart'
                    >
                      <img src={assets.bin_icon} className='w-4 h-4' alt='Remove' />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className='flex justify-end mt-10'>
            <div className='w-full sm:w-[450px] bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
              <CartTotal />
              <div className='w-full text-end'>
                <button
                  onClick={() => navigate('/place-order')}
                  className='w-full bg-black text-white text-sm mt-6 px-8 py-4 rounded-lg font-semibold tracking-wide hover:bg-gray-800 transition active:scale-[0.99] shadow-md'
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;