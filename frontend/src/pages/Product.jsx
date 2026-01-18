import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext'
import { assets } from '../assets/assets'
import RelatedProducts from '../components/RelatedProducts'
import ReviewSection from '../components/ReviewSection'
import { toast } from 'react-toastify'
import axios from 'axios'

const Product = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { products, currency, addToCart, backendUrl } = useContext(ShopContext)
  
  const [productData, setProductData] = useState(null)
  const [image, setImage] = useState('')
  
  // Selection States
  const [selectedSizeObj, setSelectedSizeObj] = useState(null) 
  const [customValues, setCustomValues] = useState({}) 
  const [modifiers, setModifiers] = useState({}) // Track extra prices

  // Photo Upload State
  const [userPhoto, setUserPhoto] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const apiBase = `${backendUrl.replace(/\/$/, "")}/api`;

  // Fetch Product
  useEffect(() => {
    if (!Array.isArray(products)) return
    const found = products.find((item) => item._id === productId || item.id === productId)
    if (found) {
      setProductData(found)
      setImage(found?.image?.[0] || '')
      
      // Safe check for sizes
      if(Array.isArray(found.sizes) && found.sizes.length > 0) {
        setSelectedSizeObj(found.sizes[0]);
      }
      
      setCustomValues({})
      setModifiers({})
      setUserPhoto(null)
    }
  }, [productId, products])

  // Handle Inputs
  const handleCustomChange = (label, value, inputType, priceMod = 0) => {
    setCustomValues(prev => {
      const newState = { ...prev };
      if (inputType === 'select') {
        const current = Array.isArray(newState[label]) ? newState[label] : [];
        if (current.includes(value)) {
           newState[label] = current.filter(i => i !== value);
           // Remove price modifier logic would be complex for multi-select, 
           // simplifying to single add for now or accumulative if needed.
           // For this fix, we just handle value update.
        } else {
           newState[label] = [...current, value];
        }
      } else {
        newState[label] = value;
      }
      return newState;
    });

    // Update Price Modifiers
    if (inputType === 'select') {
       // Note: Advanced multi-select price calc requires deeper logic. 
       // This simple version adds the price if selected.
       setModifiers(prev => ({ ...prev, [value]: Number(priceMod) }));
    }
  }

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUserPhoto(e.target.files[0])
    }
  }

  // Calculate Extra Price
  const calculateExtraPrice = () => {
    if (!productData?.customizationInputs) return 0;
    let total = 0;

    productData.customizationInputs.forEach(field => {
      if (field.inputType === 'select') {
        const selectedNames = customValues[field.label] || [];
        // Safety Check: Ensure options array exists
        const options = field.selectOptions || field.options || [];
        
        selectedNames.forEach(name => {
           const opt = options.find(o => (o.name || o) === name);
           if (opt && opt.priceModifier) {
             total += Number(opt.priceModifier);
           }
        });
      }
    });
    return total;
  };

  const extraPrice = calculateExtraPrice();
  
  // Base Price logic (Handle both object sizes and simple number price)
  const basePrice = selectedSizeObj ? Number(selectedSizeObj.price) : Number(productData?.price || 0);
  const currentPrice = basePrice + extraPrice;
  
  const discount = productData?.originalPrice && currentPrice
    ? Math.round(((productData.originalPrice - currentPrice) / productData.originalPrice) * 100)
    : 0;

  // Add To Cart
  const handleAddToCart = async () => {
    if (!productData) return;

    // Check size if sizes exist
    if (Array.isArray(productData.sizes) && productData.sizes.length > 0 && !selectedSizeObj) {
      toast.error('Please select a size');
      return;
    }

    // Validate Required Fields
    if (Array.isArray(productData.customizationInputs)) {
      for (const field of productData.customizationInputs) {
        const val = customValues[field.label];
        const isEmpty = !val || (Array.isArray(val) && val.length === 0);
        if (field.required && isEmpty) {
          toast.error(`Please complete: ${field.label}`);
          return;
        }
      }
    }

    if (productData.allowsPhotoUpload && !userPhoto) {
      toast.error('Please upload your photo');
      return;
    }

    let finalData = { ...customValues };
    // Format arrays for display
    Object.keys(finalData).forEach(k => {
       if(Array.isArray(finalData[k])) finalData[k] = finalData[k].join(', ');
    });

    if (extraPrice > 0) finalData['__extra'] = extraPrice;

    // Upload Photo
    if (userPhoto) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', userPhoto);

        const res = await axios.post(`${apiBase}/product/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data.success) {
          finalData['User Photo'] = "View Photo (Click in Order)";
          finalData['Uploaded Photo'] = res.data.imageUrl;
        } else {
          toast.error('Failed to upload image');
          setIsUploading(false);
          return;
        }
      } catch (err) {
        console.error(err);
        toast.error('Image upload failed');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const sizeName = selectedSizeObj ? selectedSizeObj.name : "Default";
    await addToCart(productData._id, sizeName, finalData);
    navigate('/cart');
  }

  if (!productData) return <div className="opacity-0">Loading...</div>

  return (
    <div className="border-t-2 pt-10 mt-20 sm:mt-32 transition-opacity ease-in duration-500 opacity-100 px-4 sm:px-10">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        
        {/* Images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {/* ✅ SAFE MAP: Check if image array exists */}
            {Array.isArray(productData.image) && productData.image.map((item, idx) => (
              <img
                key={idx}
                onClick={() => setImage(item)}
                src={item}
                alt=""
                className={`w-[24%] sm:w-full sm:mb-3 flex-shrink-0 rounded-lg cursor-pointer border ${image === item ? 'border-pink-500' : 'border-transparent'}`}
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%] relative">
            <img className="w-full h-auto rounded-lg object-cover" src={image} alt="" />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
                {productData.bestseller && <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">BESTSELLER</span>}
                {productData.trending && <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">TRENDING</span>}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          {/* MODIFICATION: Changed text-gray-800 to text-pink-600 for a bright pink heading */}
          <h9 className="font-bold text-3xl mt-2 text-pink-600 uppercase tracking-wide">{productData.name}</h9>
          
          <div className="flex items-end gap-3 mt-4 mb-6">
            <p className="text-3xl font-bold text-pink-600 leading-none">{currency} {currentPrice}</p>
            {productData.originalPrice && (
              <div className="mb-1 flex items-center gap-2">
                <p className="text-lg text-gray-400 line-through">{currency} {productData.originalPrice}</p>
                <p className="text-xs text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded">
                  {discount}% OFF
                </p>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500 mb-6">Tax included. Free shipping on prepaid orders.</p>

          {/* Size Selector */}
          {/* ✅ SAFE CHECK: Only show if sizes is an array */}
          {Array.isArray(productData.sizes) && productData.sizes.length > 0 && (
            <div className="mb-8">
              <p className="font-semibold text-sm tracking-wide text-gray-700 mb-3 uppercase">Select Size</p>
              <div className="flex flex-wrap gap-3">
                {productData.sizes.map((s, index) => {
                  // Handle case where s might be a string (old data) or object (new data)
                  const sizeName = typeof s === 'object' ? s.name : s;
                  const sizeDim = typeof s === 'object' ? s.dimension : '';
                  
                  const isSelected = selectedSizeObj?.name === sizeName;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedSizeObj(typeof s === 'object' ? s : { name: s, price: productData.price })}
                      className={`
                        py-2 px-4 rounded-lg border-2 text-sm font-medium transition-all duration-200
                        flex flex-col items-center justify-center min-w-[80px]
                        ${isSelected 
                          ? 'border-pink-600 bg-pink-50 text-pink-700 shadow-sm' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'}
                      `}
                    >
                      <span>{sizeName}</span>
                      {sizeDim && <span className="text-[10px] opacity-70">{sizeDim}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Customization Grid */}
          {/* ✅ SAFE CHECK: Only show if customizationInputs exists */}
          {Array.isArray(productData.customizationInputs) && productData.customizationInputs.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 space-y-5">
              
              {productData.customizationInputs.map((field, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.inputType === 'select' ? (
                    <div className="flex flex-wrap gap-3">
                      {/* ✅ CRITICAL FIX: Handle undefined options array safely */}
                      {(field.selectOptions || field.options || []).map((opt, optIdx) => { 
                        const name = typeof opt === 'object' ? opt.name : opt;
                        const modifier = typeof opt === 'object' ? (opt.priceModifier || 0) : 0;
                        
                        const currentSelections = customValues[field.label] || [];
                        const isSelected = currentSelections.includes(name);
                        
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleCustomChange(field.label, name, 'select', modifier)}
                            className={`
                              px-5 py-2 rounded-md border text-sm font-medium transition-all
                              ${isSelected 
                                ? 'bg-black text-white border-black shadow-md' 
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}
                            `}
                          >
                            {name} {modifier > 0 && <span className="text-xs opacity-80">(+{currency}{modifier})</span>}
                          </button>
                        )
                      })}
                    </div>
                  ) : field.inputType === 'textarea' ? (
                    <textarea 
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                      rows={3}
                      placeholder={`Enter ${field.label}...`}
                      onChange={(e) => handleCustomChange(field.label, e.target.value, 'text')}
                    />
                  ) : (
                    <input 
                      type={field.inputType === 'date' ? 'date' : 'text'}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
                      placeholder={`Enter ${field.label}`}
                      onChange={(e) => handleCustomChange(field.label, e.target.value, 'text')}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Photo Upload */}
          {productData.allowsPhotoUpload && (
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Your Photo <span className="text-red-500">*</span>
              </label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-white hover:bg-blue-50/50 transition-colors">
                  {userPhoto ? (
                    <p className="text-sm font-medium text-green-600">{userPhoto.name}</p>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-2xl mb-1">📸</span>
                      <p className="text-xs text-gray-500">Click to upload image</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className='flex flex-col gap-4'>
            {productData.inStock ? (
              <button
                onClick={handleAddToCart}
                disabled={isUploading}
                className="w-full bg-blue-600 text-white px-8 py-4 text-base font-bold uppercase tracking-widest rounded-lg shadow-lg hover:bg-blue-700 transition active:scale-[0.98] disabled:bg-blue-400"
              >
                {isUploading ? "Uploading Photo..." : "Add to Cart"}
              </button>
            ) : (
              <button disabled className="w-full bg-gray-300 text-gray-500 px-8 py-4 text-base font-bold uppercase rounded-lg cursor-not-allowed">
                Out of Stock
              </button>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded justify-center">
               {/* REMOVED <img src={assets.truck_icon || ""} className="w-5 h-5 opacity-60" alt="🚚" /> */}
               <span>🚚 Estimated Shipping: <span className="font-semibold text-gray-800">{productData.estimatedShipping || '10-12 Days'}</span></span>
            </div>
          </div>

          {/* Accordion */}
          <div className="mt-10 border-t">
            <details className="group py-4 border-b cursor-pointer" open>
              <summary className="flex justify-between items-center font-medium text-gray-800 list-none">
                <span>DESCRIPTION</span>
                <span>▼</span>
              </summary>
              <p className="text-sm text-gray-600 leading-relaxed mt-3 whitespace-pre-line">{productData.description}</p>
            </details>
            <details className="group py-4 border-b cursor-pointer">
              <summary className="flex justify-between items-center font-medium text-gray-800 list-none">
                <span>RETURNS & REFUNDS</span>
                <span>▼</span>
              </summary>
              <p className="text-sm text-gray-600 mt-3">Customized items are not eligible for return unless damaged.</p>
            </details>
          </div>

        </div>
      </div>

      <div className="mt-20">
        <ReviewSection productId={productData._id} />
      </div>

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  )
}

export default Product