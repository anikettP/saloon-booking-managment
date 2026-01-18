import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState(""); 
  
  const [category, setCategory] = useState("Art"); // Default fallback
  const [subCategory, setSubCategory] = useState("String Art");
  
  // ✅ Dynamic Arrays from Backend
  const [giftOptions, setGiftOptions] = useState([]);
  const [festiveOptions, setFestiveOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  // Selections
  const [giftFor, setGiftFor] = useState([]);
  const [festive, setFestive] = useState([]);

  const [baseMaterial, setBaseMaterial] = useState("Wood");
  const [threadColor, setThreadColor] = useState("");
  const [theme, setTheme] = useState("Love");
  
  const [bestseller, setBestseller] = useState(false);
  const [trending, setTrending] = useState(false);
  const [inStock, setInStock] = useState(true);
  const [allowsPhotoUpload, setAllowsPhotoUpload] = useState(false);
  const [estimatedShipping, setEstimatedShipping] = useState("10-12 Days");

  const [averageRating, setAverageRating] = useState(4.5);
  const [reviewCount, setReviewCount] = useState(10);

  const [sizeRows, setSizeRows] = useState([]);
  const [customInputs, setCustomInputs] = useState([]);

  // ✅ Fetch Categories on Mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axios.get(`${backendUrl}/category/list`);
        if (res.data.success) {
          const all = res.data.categories;
          // Filter by type and map to just the Name string
          setGiftOptions(all.filter(c => c.type === 'gift').map(c => c.name));
          setFestiveOptions(all.filter(c => c.type === 'festive').map(c => c.name));
          setCategoryOptions(all.filter(c => c.type === 'category').map(c => c.name));
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load categories");
      }
    };
    fetchCats();
  }, []);

  const toggleAttribute = (setter, currentArray, value) => {
    if (currentArray.includes(value)) setter(currentArray.filter((item) => item !== value));
    else setter([...currentArray, value]);
  };

  const addSizeRow = () => setSizeRows([...sizeRows, { name: "", dimension: "", price: "" }]);
  const removeSizeRow = (index) => setSizeRows(sizeRows.filter((_, i) => i !== index));
  const updateSizeRow = (index, field, value) => {
    const updated = [...sizeRows];
    updated[index][field] = value;
    setSizeRows(updated);
  };

  const addCustomInput = () => setCustomInputs([...customInputs, { inputType: "text", label: "", required: true, selectOptions: [] }]);
  const removeCustomInput = (index) => setCustomInputs(customInputs.filter((_, i) => i !== index));
  const updateCustomInput = (index, field, value) => {
    const updated = [...customInputs];
    updated[index][field] = value;
    if (field === 'inputType' && value !== 'select') updated[index].selectOptions = [];
    setCustomInputs(updated);
  };
  const addSelectOption = (idx) => {
    const updated = [...customInputs];
    updated[idx].selectOptions.push({ name: '', priceModifier: 0 });
    setCustomInputs(updated);
  };
  const updateSelectOption = (idx, optIdx, field, value) => {
    const updated = [...customInputs];
    updated[idx].selectOptions[optIdx][field] = value;
    setCustomInputs(updated);
  };
  const removeSelectOption = (idx, optIdx) => {
    const updated = [...customInputs];
    updated[idx].selectOptions.splice(optIdx, 1);
    setCustomInputs(updated);
  };

  const getBaseListingPrice = () => {
    if (sizeRows.length === 0) return "";
    const prices = sizeRows.map(s => Number(s.price)).filter(p => p > 0);
    return prices.length > 0 ? Math.min(...prices) : "";
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if(sizeRows.length === 0) return toast.error("Please add at least one size & price.");
      const basePrice = getBaseListingPrice();
      if(!basePrice) return toast.error("Please ensure sizes have prices.");
      
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", basePrice); 
      formData.append("originalPrice", originalPrice);
      formData.append("category", category);
      formData.append("subCategory", subCategory);
      formData.append("baseMaterial", baseMaterial);
      formData.append("threadColor", threadColor);
      formData.append("theme", theme);
      formData.append("bestseller", bestseller);
      formData.append("trending", trending);
      formData.append("inStock", inStock);
      formData.append("allowsPhotoUpload", allowsPhotoUpload);
      formData.append("estimatedShipping", estimatedShipping);
      formData.append("averageRating", averageRating);
      formData.append("reviewCount", reviewCount);

      formData.append("sizes", JSON.stringify(sizeRows));
      formData.append("giftFor", JSON.stringify(giftFor));
      formData.append("festive", JSON.stringify(festive));
      
      const cleanedInputs = customInputs.map(input => ({
        ...input,
        selectOptions: input.selectOptions.filter(opt => opt.name.trim() !== '')
      }));
      formData.append("customizationInputs", JSON.stringify(cleanedInputs));

      image1 && formData.append("image1", image1);
      image2 && formData.append("image2", image2);
      image3 && formData.append("image3", image3);
      image4 && formData.append("image4", image4);

      const res = await axios.post(`${backendUrl}/product/add`, formData, { headers: { token } });

      if (res.data.success) {
        toast.success(res.data.message);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };

  const renderImgInput = (img, setImg) => (
    <label className="cursor-pointer">
      <div className="w-24 h-24 border rounded flex items-center justify-center bg-gray-50 overflow-hidden hover:bg-gray-100 transition">
        {img ? <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="" /> : <img src={assets.upload_area} className="w-8 opacity-50" alt="" />}
      </div>
      <input type="file" hidden onChange={(e) => setImg(e.target.files[0])} />
    </label>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto pb-20">
      <form onSubmit={onSubmitHandler} className="flex flex-col gap-8 bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>

        {/* Images */}
        <div>
          <p className="font-medium mb-3">Upload Images</p>
          <div className="flex gap-4">
            {renderImgInput(image1, setImage1)}
            {renderImgInput(image2, setImage2)}
            {renderImgInput(image3, setImage3)}
            {renderImgInput(image4, setImage4)}
          </div>
        </div>

        {/* Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <p className="font-medium mb-2">Product Name</p>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div className="col-span-2">
            <p className="font-medium mb-2">Description</p>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded px-3 py-2 h-32" required />
          </div>
           <div>
            <p className="font-medium mb-2">Original MRP (₹)</p>
            <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="w-full border rounded px-3 py-2"/>
          </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
                <p className="font-medium mb-2">Star Rating</p>
                <input type="number" step="0.1" max="5" value={averageRating} onChange={(e) => setAverageRating(e.target.value)} className="w-full border rounded px-3 py-2"/>
             </div>
             <div>
                <p className="font-medium mb-2">Review Count</p>
                <input type="number" value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} className="w-full border rounded px-3 py-2"/>
             </div>
           </div>
        </div>

        {/* Categories (Updated to use fetched options) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg border">
          <div>
            <p className="font-medium mb-2">Category</p>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="Art">Art</option>
              {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <p className="font-medium mb-2">Sub Category</p>
            <input value={subCategory} onChange={(e)=>setSubCategory(e.target.value)} className="w-full border rounded px-3 py-2"/>
          </div>
           <div>
            <p className="font-medium mb-2">Shipping Text</p>
            <input value={estimatedShipping} onChange={(e)=>setEstimatedShipping(e.target.value)} className="w-full border rounded px-3 py-2"/>
          </div>

          {/* Dynamic Gift Options */}
          <div className="col-span-full">
            <p className="font-medium mb-2">Gift For (Select Multiple)</p>
            <div className="flex flex-wrap gap-2">
              {giftOptions.length > 0 ? giftOptions.map((opt) => (
                <button key={opt} type="button" onClick={() => toggleAttribute(setGiftFor, giftFor, opt)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${giftFor.includes(opt) ? "bg-pink-500 text-white" : "bg-white"}`}>{opt}</button>
              )) : <p className="text-xs text-gray-400">No Gift categories found in Category Manager</p>}
            </div>
          </div>

          {/* Dynamic Festive Options */}
          <div className="col-span-full">
            <p className="font-medium mb-2">Festive (Select Multiple)</p>
            <div className="flex flex-wrap gap-2">
              {festiveOptions.length > 0 ? festiveOptions.map((opt) => (
                <button key={opt} type="button" onClick={() => toggleAttribute(setFestive, festive, opt)}
                  className={`px-3 py-1 rounded-full text-xs border transition ${festive.includes(opt) ? "bg-purple-500 text-white" : "bg-white"}`}>{opt}</button>
              )) : <p className="text-xs text-gray-400">No Festive categories found in Category Manager</p>}
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div className="border p-4 rounded-lg bg-green-50">
           <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">Size & Pricing <span className="text-red-500">*</span></h3>
            <button type="button" onClick={addSizeRow} className="bg-green-600 text-white px-4 py-2 rounded text-sm">+ Add Variant</button>
          </div>
          {sizeRows.length === 0 && <p className="text-red-500 text-sm">Please add at least one size.</p>}
          <div className="flex flex-col gap-3">
            {sizeRows.map((row, index) => (
              <div key={index} className="flex flex-wrap items-end gap-3 bg-white p-3 rounded border shadow-sm relative">
                <input value={row.name} onChange={(e) => updateSizeRow(index, "name", e.target.value)} placeholder="Size Label (S)" className="border rounded px-2 py-1 text-sm flex-1"/>
                <input value={row.dimension} onChange={(e) => updateSizeRow(index, "dimension", e.target.value)} placeholder="Dimensions" className="border rounded px-2 py-1 text-sm flex-[2]"/>
                <input type="number" value={row.price} onChange={(e) => updateSizeRow(index, "price", e.target.value)} placeholder="Price" className="border rounded px-2 py-1 text-sm flex-1 font-bold"/>
                <button type="button" onClick={() => removeSizeRow(index)} className="text-red-500 text-lg">×</button>
              </div>
            ))}
          </div>
        </div>

        {/* Customization */}
        <div className="border p-4 rounded-lg bg-blue-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700">Customization Fields</h3>
            <button type="button" onClick={addCustomInput} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">+ Add Field</button>
          </div>
          <div className="flex flex-col gap-4">
            {customInputs.map((input, index) => (
              <div key={index} className="bg-white p-4 rounded border shadow-sm relative flex flex-col gap-3">
                 <button type="button" onClick={() => removeCustomInput(index)} className="text-red-500 absolute top-2 right-3 text-sm">Remove</button>
                <div className="flex flex-wrap gap-4 items-end">
                    <input value={input.label} onChange={(e) => updateCustomInput(index, "label", e.target.value)} placeholder="Label" className="border rounded px-2 py-1 text-sm flex-1" />
                    <select value={input.inputType} onChange={(e) => updateCustomInput(index, "inputType", e.target.value)} className="border rounded px-2 py-1 text-sm">
                        <option value="text">Text Box</option>
                        <option value="date">Date Picker</option>
                        <option value="select">Select/Boxes</option>
                        <option value="textarea">Long Text</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={input.required} onChange={(e) => updateCustomInput(index, "required", e.target.checked)} /> Required</label>
                </div>
                {input.inputType === 'select' && (
                    <div className="ml-4 pl-4 border-l-2 border-blue-200 bg-blue-50/50 p-3 rounded">
                        {input.selectOptions.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-3 mb-2">
                                <input placeholder="Option Name" value={option.name} onChange={(e)=>updateSelectOption(index, optIndex, 'name', e.target.value)} className="border rounded px-2 py-1 text-sm flex-1"/>
                                <input type="number" placeholder="+Price" value={option.priceModifier} onChange={(e)=>updateSelectOption(index, optIndex, 'priceModifier', e.target.value)} className="border rounded px-2 py-1 text-sm w-20"/>
                                <button type="button" onClick={()=>removeSelectOption(index, optIndex)} className="text-red-500">×</button>
                            </div>
                        ))}
                        <button type="button" onClick={()=>addSelectOption(index)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded mt-2">+ Add Option</button>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6 border-t pt-6">
          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded border"><input type="checkbox" checked={bestseller} onChange={() => setBestseller(!bestseller)} /> Bestseller</label>
          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded border"><input type="checkbox" checked={trending} onChange={() => setTrending(!trending)} /> Trending</label>
          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded border"><input type="checkbox" checked={inStock} onChange={() => setInStock(!inStock)} /> In Stock</label>
          <label className="flex items-center gap-2 cursor-pointer bg-yellow-50 px-4 py-2 rounded border"><input type="checkbox" checked={allowsPhotoUpload} onChange={() => setAllowsPhotoUpload(!allowsPhotoUpload)} /> User Photo</label>
        </div>

        <button type="submit" className="bg-black text-white py-4 rounded-lg font-bold text-lg hover:bg-gray-900 transition">ADD PRODUCT</button>
      </form>
    </div>
  );
};

export default Add;