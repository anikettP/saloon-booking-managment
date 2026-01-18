import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const CategoryManager = ({ token }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("gift"); // 'gift', 'festive', 'category'
  const [image, setImage] = useState(false);
  
  // Separate states for organization
  const [giftList, setGiftList] = useState([]);
  const [festiveList, setFestiveList] = useState([]);
  const [catList, setCatList] = useState([]);
  
  const [loading, setLoading] = useState(false);

  const fetchList = async () => {
    try {
      const res = await axios.get(`${backendUrl}/category/list`);
      if (res.data.success) {
        // Filter into groups for display
        setGiftList(res.data.categories.filter(item => item.type === 'gift'));
        setFestiveList(res.data.categories.filter(item => item.type === 'festive'));
        setCatList(res.data.categories.filter(item => item.type === 'category'));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      formData.append("image", image);

      const res = await axios.post(`${backendUrl}/category/add`, formData, {
        headers: { token },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setName("");
        setImage(false);
        // Reset file input
        document.getElementById("cat-img").value = "";
        fetchList();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const removeCategory = async (id) => {
    if(!window.confirm("Remove this item?")) return;
    try {
      const res = await axios.post(`${backendUrl}/category/remove`, { id }, { headers: { token } });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchList();
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Helper component to render a section
  const RenderSection = ({ title, data }) => (
    <div className="mb-10">
      <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">{title} Options</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
        {data.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border flex flex-col items-center gap-3 relative group hover:-translate-y-1 transition-transform">
             <button onClick={()=>removeCategory(item._id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">✕</button>
             <div className="w-16 h-16 rounded-full bg-pink-50 border-2 border-white shadow overflow-hidden">
               <img src={item.image} alt="" className="w-full h-full object-cover" />
             </div>
             <div className="text-center">
               <p className="font-bold text-gray-800 text-sm">{item.name}</p>
               <span className="text-[10px] text-gray-400 uppercase">{item.type}</span>
             </div>
          </div>
        ))}
        {data.length === 0 && <p className="text-gray-400 text-sm col-span-full">No items added yet.</p>}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Category & Tag Manager</h2>
      
      {/* Add Form */}
      <form onSubmit={onSubmitHandler} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row gap-6 items-end">
        
        <div className="flex flex-col gap-2 items-center">
          <p className="text-sm font-medium">Icon</p>
          <label htmlFor="cat-img" className="cursor-pointer">
             <div className="w-20 h-20 border-2 border-dashed rounded-full flex items-center justify-center bg-gray-50 hover:bg-pink-50 transition overflow-hidden relative group">
                 {image ? <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" /> : <img src={assets.upload_area} className="w-8 opacity-50" />}
             </div>
             <input type="file" id="cat-img" hidden onChange={(e) => setImage(e.target.files[0])} />
          </label>
        </div>

        <div className="flex-1 w-full">
          <p className="text-sm font-medium mb-2">Name</p>
          <input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full border rounded px-3 py-2" 
            placeholder="e.g. Diwali, Anniversary, Wall Art"
            required 
          />
        </div>

        <div className="w-full sm:w-40">
           <p className="text-sm font-medium mb-2">Type</p>
           <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="gift">Gift For</option>
              <option value="festive">Festive</option>
              <option value="category">Product Category</option>
           </select>
        </div>

        <button className="w-full sm:w-auto bg-black text-white px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition" disabled={loading}>
          {loading ? "Adding..." : "ADD"}
        </button>
      </form>

      {/* Lists separated by type */}
      <RenderSection title="Gift For" data={giftList} />
      <RenderSection title="Festive Occasions" data={festiveList} />
      <RenderSection title="Product Categories" data={catList} />

    </div>
  );
};

export default CategoryManager;