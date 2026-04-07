import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

// Limit (Keep same as before)
const MAX_BANNERS = 6;

const Banners = ({ token }) => {
  // Form States
  const [imageDesktop, setImageDesktop] = useState(null);
  const [imageMobile, setImageMobile] = useState(null);
  const [link, setLink] = useState("");
  const [order, setOrder] = useState(0);

  // Data States
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Edit Mode State
  const [editingId, setEditingId] = useState(null); // If null, we are adding. If set, we are editing.

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/banners/list?all=true`);
      if (res.data.success) {
        setBanners(res.data.banners || []);
      }
    } catch (err) {
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const resetForm = () => {
    setImageDesktop(null);
    setImageMobile(null);
    setLink("");
    setOrder(0);
    setEditingId(null); // Exit edit mode
    
    // Reset file inputs manually
    document.getElementById("file-desktop").value = "";
    document.getElementById("file-mobile").value = "";
  };

  // Populate form for editing
  const handleEdit = (banner) => {
    setEditingId(banner._id);
    setLink(banner.link || "");
    setOrder(banner.order || 0);
    setImageDesktop(null); // Reset files (we keep old ones if not changed)
    setImageMobile(null);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // VALIDATION:
    // If Adding: Must have at least one image.
    // If Editing: Images are optional (keep old ones).
    if (!editingId && !imageDesktop && !imageMobile) {
      return toast.error("Please upload at least one image (Desktop or Mobile)");
    }

    try {
      const fd = new FormData();
      
      // Only append files if user selected new ones
      if (imageDesktop) fd.append("image_desktop", imageDesktop);
      if (imageMobile) fd.append("image_mobile", imageMobile);
      
      fd.append("link", link);
      fd.append("order", order);

      let res;
      
      if (editingId) {
        // --- UPDATE MODE ---
        fd.append("id", editingId);
        res = await axios.post(`${backendUrl}/api/banners/update`, fd, {
          headers: { token, "Content-Type": "multipart/form-data" },
        });
      } else {
        // --- ADD MODE ---
        // Check limit before adding
        if (banners.length >= MAX_BANNERS) {
          return toast.error(`Maximum ${MAX_BANNERS} banners allowed.`);
        }
        res = await axios.post(`${backendUrl}/api/banners/add`, fd, {
          headers: { token, "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data.success) {
        toast.success(editingId ? "Banner updated!" : "Banner added!");
        resetForm();
        fetchBanners();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const onRemove = async (id) => {
    if (!window.confirm("Remove this banner?")) return;
    try {
      const res = await axios.post(`${backendUrl}/api/banners/remove`, { id }, { headers: { token } });
      if (res.data.success) {
        toast.success("Banner removed");
        fetchBanners();
        if (editingId === id) resetForm(); // If deleting the one being edited
      } else toast.error(res.data.message);
    } catch (err) {
      toast.error("Error removing banner");
    }
  };

  const toggleActive = async (b) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/banners/${b._id}/toggle`,
        {},
        { headers: { token } }
      );
      if (res.data.success) fetchBanners();
      else toast.error("Update failed");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  // Helper for preview
  const renderPreview = (file, label, id) => (
    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 bg-white relative">
      {file ? (
        <img src={URL.createObjectURL(file)} className="w-full h-full object-contain rounded-lg" alt="preview" />
      ) : (
        <div className="flex flex-col items-center text-center p-2">
          <span className="text-2xl text-gray-400">+</span>
          <span className="text-xs text-gray-500 font-medium">{label}</span>
          <span className="text-[10px] text-gray-400 mt-1">
            {editingId ? "Click to Change (Optional)" : "Click to Upload"}
          </span>
        </div>
      )}
      <input 
        id={id}
        type="file" 
        className="hidden" 
        onChange={(e) => id.includes("desktop") ? setImageDesktop(e.target.files[0]) : setImageMobile(e.target.files[0])} 
        accept="image/*" 
      />
    </label>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen animate-fade-in pb-20">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
           <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Hero Banners</h1>
              <p className="text-gray-500 font-medium">Manage High-Impact Visuals for the <span className="text-pink-600 font-bold decoration-pink-200 underline">Home Page</span></p>
           </div>
           <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-2xl border border-gray-100 shadow-sm">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Capacity</span>
              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-pink-500 rounded-full transition-all duration-500" style={{ width: `${(banners.length / MAX_BANNERS) * 100}%` }}></div>
              </div>
              <span className="text-xs font-bold text-gray-900">{banners.length}/{MAX_BANNERS}</span>
           </div>
        </div>

        {/* FORM */}
        <form onSubmit={onSubmitHandler} className={`p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border mb-12 transition-all duration-300 ${editingId ? 'bg-white border-pink-200 ring-2 ring-pink-100' : 'bg-white border-gray-100'}`}>
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-xl">🖼️</div>
               <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                 {editingId ? "Edit Hero Banner" : "Create New Banner"}
               </h3>
            </div>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs font-black text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition uppercase tracking-widest border border-red-100">
                Cancel Edit
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-2">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Desktop Display (1920x800)</span>
               {renderPreview(imageDesktop, "Choose Desktop Image", "file-desktop")}
            </div>
            <div className="space-y-2">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Display (800x1200)</span>
               {renderPreview(imageMobile, "Choose Mobile Image", "file-mobile")}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Call-to-Action Link</label>
              <input 
                value={link} 
                onChange={(e) => setLink(e.target.value)} 
                placeholder="e.g. /salons or /category/hair" 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:ring-2 focus:ring-pink-400 outline-none transition"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Display Priority</label>
              <input 
                type="number" 
                value={order} 
                onChange={(e) => setOrder(e.target.value)} 
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:ring-2 focus:ring-pink-400 outline-none transition"
              />
            </div>
          </div>

          <button className={`w-full py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-xl active:scale-95 ${editingId ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-blue-100' : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-pink-100'}`}>
            {editingId ? "✓ Save Changes" : "🚀 Launch New Banner"}
          </button>
        </form>

        {/* LIST */}
        <div className="animate-fade-in-up">
          <h2 className="text-xl font-black mb-8 text-gray-900 uppercase tracking-tight flex items-center gap-3">
             Current Catalog
             <span className="h-[1px] flex-1 bg-gray-100"></span>
          </h2>
          {loading ? <p className="text-center py-10 font-bold text-gray-400 animate-pulse">Synchronizing Data...</p> : (
            <div className="grid grid-cols-1 gap-6">
              {banners.map((b) => (
                <div key={b._id} className={`p-6 rounded-[2.5rem] shadow-sm border flex flex-col lg:flex-row gap-8 items-center transition-all duration-500 ${editingId === b._id ? 'bg-pink-50 border-pink-200 shadow-lg scale-[1.02]' : 'bg-white border-gray-100 hover:shadow-lg'}`}>
                   
                   {/* Previews */}
                   <div className="flex gap-4 shrink-0">
                      <div className="flex flex-col items-center gap-2">
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Desktop Preview</span>
                         <div className="w-48 h-28 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                            {b.image_desktop 
                              ? <img src={b.image_desktop} className="w-full h-full object-cover transition hover:scale-110" alt="D" />
                              : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300 font-bold">MISSING</div>
                            }
                         </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Mobile</span>
                         <div className="w-20 h-28 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                            {b.image_mobile 
                              ? <img src={b.image_mobile} className="w-full h-full object-cover transition hover:scale-110" alt="M" />
                              : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300 font-bold">NULL</div>
                            }
                         </div>
                      </div>
                   </div>

                   <div className="flex-1 text-center lg:text-left min-w-0">
                      <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                         <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest">Order: {b.order}</span>
                         {b.active ? (
                            <span className="bg-green-50 text-green-600 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest border border-green-100">Live</span>
                         ) : (
                            <span className="bg-gray-100 text-gray-400 text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-widest border border-gray-200 italic">Off-Platform</span>
                         )}
                      </div>
                      <p className="text-lg font-black text-gray-900 truncate uppercase tracking-tighter" title={b.link}>{b.link || "No Redirect Link"}</p>
                      <p className="text-xs text-gray-400 mt-1 font-medium italic">Created on {new Date(b.createdAt).toLocaleDateString()}</p>
                   </div>

                   <div className="flex gap-3 shrink-0">
                      <button 
                        onClick={() => handleEdit(b)}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-blue-500 hover:border-blue-100 hover:bg-blue-50 transition shadow-sm"
                        title="Edit Banner Settings"
                      >
                        ✏️
                      </button>

                      <button 
                        onClick={() => toggleActive(b)}
                        className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition shadow-sm ${b.active ? "bg-green-50 text-green-500 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}
                        title={b.active ? "Click to Deactivate" : "Click to Put Live"}
                      >
                        {b.active ? "✅" : "💤"}
                      </button>
                      
                      <button 
                        onClick={() => onRemove(b._id)} 
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition shadow-sm"
                        title="Permanently Remove"
                      >
                        🗑️
                      </button>
                   </div>
                </div>
              ))}
              {banners.length === 0 && (
                <div className="p-32 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">🏜️</div>
                   <h4 className="text-xl font-bold text-gray-900 mb-2">No Active Banners</h4>
                   <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm leading-relaxed">Add a hero banner above to start engaging users on your landing page.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Banners;