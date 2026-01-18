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
      const res = await axios.get(`${backendUrl}/banner/list`);
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
        res = await axios.post(`${backendUrl}/banner/update`, fd, {
          headers: { token, "Content-Type": "multipart/form-data" },
        });
      } else {
        // --- ADD MODE ---
        // Check limit before adding
        if (banners.length >= MAX_BANNERS) {
          return toast.error(`Maximum ${MAX_BANNERS} banners allowed.`);
        }
        res = await axios.post(`${backendUrl}/banner/add`, fd, {
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
      const res = await axios.post(`${backendUrl}/banner/remove`, { id }, { headers: { token } });
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
      const res = await axios.post(
        `${backendUrl}/banner/update`,
        { id: b._id, active: !b.active },
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold text-gray-800">Manage Banners</h1>
           <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">Limit: {MAX_BANNERS}</span>
        </div>

        {/* FORM */}
        <form onSubmit={onSubmitHandler} className={`p-6 rounded-xl shadow-sm border mb-8 transition-colors ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              {editingId ? "Edit Banner" : "Add New Banner"}
            </h3>
            {editingId && (
              <button type="button" onClick={resetForm} className="text-xs text-red-600 hover:underline">
                Cancel Edit
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            {renderPreview(imageDesktop, "Desktop (Landscape)", "file-desktop")}
            {renderPreview(imageMobile, "Mobile (Portrait)", "file-mobile")}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Target Link</label>
              <input 
                value={link} 
                onChange={(e) => setLink(e.target.value)} 
                placeholder="e.g. /collection/latest" 
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-black/5 outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">Product Link / Category Link</p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Sort Order</label>
              <input 
                type="number" 
                value={order} 
                onChange={(e) => setOrder(e.target.value)} 
                className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-black/5 outline-none"
              />
            </div>
          </div>

          <button className={`w-full px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wider hover:shadow-lg transition ${editingId ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-black hover:bg-gray-800 text-white'}`}>
            {editingId ? "Update Banner" : "Upload Banner"}
          </button>
        </form>

        {/* LIST */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Active Banners ({banners.length})</h2>
          {loading ? <p className="text-center py-4 text-gray-500">Loading...</p> : (
            <div className="space-y-4">
              {banners.map((b) => (
                <div key={b._id} className={`p-4 rounded-lg shadow-sm border flex flex-col sm:flex-row gap-4 items-center transition-colors ${editingId === b._id ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' : 'bg-white border-gray-200'}`}>
                   
                   {/* Previews */}
                   <div className="flex gap-3">
                      <div className="flex flex-col items-center gap-1">
                         <span className="text-[10px] text-gray-400 uppercase">Desktop</span>
                         {b.image_desktop 
                           ? <img src={b.image_desktop} className="w-32 h-20 object-cover rounded border" alt="D" />
                           : <div className="w-32 h-20 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">None</div>
                         }
                      </div>
                      <div className="flex flex-col items-center gap-1">
                         <span className="text-[10px] text-gray-400 uppercase">Mobile</span>
                         {b.image_mobile 
                           ? <img src={b.image_mobile} className="w-16 h-20 object-cover rounded border" alt="M" />
                           : <div className="w-16 h-20 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">None</div>
                         }
                      </div>
                   </div>

                   <div className="flex-1 text-center sm:text-left overflow-hidden">
                      <p className="text-sm text-blue-600 truncate font-medium" title={b.link}>{b.link || "No Link"}</p>
                      <p className="text-xs text-gray-400 mt-1">Order: {b.order}</p>
                   </div>

                   <div className="flex gap-2">
                      {/* EDIT BUTTON */}
                      <button 
                        onClick={() => handleEdit(b)}
                        className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200"
                      >
                        Edit
                      </button>

                      <button 
                        onClick={() => toggleActive(b)}
                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide ${b.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                      >
                        {b.active ? "Active" : "Off"}
                      </button>
                      
                      <button onClick={() => onRemove(b._id)} className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wide bg-red-50 text-red-600 hover:bg-red-100">
                        Delete
                      </button>
                   </div>
                </div>
              ))}
              {banners.length === 0 && <p className="text-gray-400 text-center py-8 bg-white rounded-lg border border-dashed">No banners found. Add one above.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Banners;