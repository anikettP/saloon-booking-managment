import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const AdminManageSalon = ({ token }) => {
  const { id: salonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("basics");
  const [loading, setLoading] = useState(true);
  const [salon, setSalon] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) setActiveTab(tab);
  }, [location]);

  // Forms State
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    phone: "",
    location: "",
    address: "",
    description: ""
  });
  
  const [services, setServices] = useState([]);
  const [artists, setArtists] = useState([]);
  const [gallery, setGallery] = useState([]);
  
  const [newArtistEmail, setNewArtistEmail] = useState("");
  const [newSvc, setNewSvc] = useState({ name: "", price: "", duration: "60", category: "General" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSalonData();
  }, [salonId, token]);

  const fetchSalonData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/salons/${salonId}`);
      if (res.data.success) {
        const s = res.data.salon;
        setSalon(s);
        setBasicInfo({
          name: s.name || "",
          phone: s.phone || "",
          location: s.location || "",
          address: s.address || "",
          description: s.description || ""
        });
        setServices(res.data.services || []);
        setArtists(s.artists || []);
        setGallery(s.images || []);
      }
    } catch (err) {
      toast.error("Salon not found");
      navigate("/salon-approvals");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBasics = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${backendUrl}/api/salons/${salonId}`, basicInfo, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Salon details updated! 🏢");
      }
    } catch {
      toast.error("Update failed");
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    try {
      setUploading(true);
      const fd = new FormData();
      files.forEach(f => fd.append("images", f));
      
      const res = await axios.put(`${backendUrl}/api/salons/${salonId}`, fd, {
        headers: { authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      
      if (res.data.success) {
        toast.success("Gallery updated!");
        setGallery(res.data.salon.images);
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (imgUrl) => {
    try {
      const updatedGallery = gallery.filter(img => img !== imgUrl);
      const res = await axios.put(`${backendUrl}/api/salons/${salonId}`, { images: updatedGallery }, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setGallery(updatedGallery);
        toast.success("Image removed");
      }
    } catch {
      toast.error("Failed to remove image");
    }
  };

  const handleAddArtist = async () => {
    if (!newArtistEmail) return;
    try {
      const res = await axios.post(`${backendUrl}/api/salons/artist/add`, 
        { salonId, artistEmail: newArtistEmail },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Artist linked!");
        setArtists([...artists, res.data.artist]);
        setNewArtistEmail("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "User not found");
    }
  };

  const handleAddService = async () => {
    if (!newSvc.name || !newSvc.price) return;
    try {
      const res = await axios.post(`${backendUrl}/api/services`, 
        { ...newSvc, salonId },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Service added!");
        setServices([...services, res.data.service]);
        setNewSvc({ name: "", price: "", duration: "60", category: "General" });
      }
    } catch {
      toast.error("Error adding service");
    }
  };

  const handleDeleteSvc = async (svcId) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/services/${svcId}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setServices(services.filter(s => s._id !== svcId));
        toast.success("Deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading salon management...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in mb-20 mt-10">
      
      {/* Premium Header */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-pink-600 rounded-2xl transition shadow-sm border border-gray-100"
          >
            ⬅️
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Admin Override</h1>
              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-red-100">Super Admin Mode</span>
            </div>
            <p className="text-gray-500 font-medium">Currently Managing: <span className="text-pink-600 font-bold underline">{salon.name}</span></p>
          </div>
        </div>

        <div className="flex gap-3">
           <button className="bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl font-bold hover:bg-gray-200 transition text-sm">View Public Profile</button>
           <button className="bg-red-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-700 transition text-sm shadow-lg shadow-red-100">Deactivate Salon</button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50/50 p-6 border-r border-gray-100 flex md:flex-col gap-2 overflow-x-auto">
          {[
            { id: "basics", icon: "🏢", label: "Salon Basics" },
            { id: "gallery", icon: "🖼️", label: "Gallery Photos" },
            { id: "services", icon: "✂️", label: "Services" },
            { id: "artists", icon: "👥", label: "Linked Artists" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-tight transition ${
                activeTab === t.id ? "bg-white text-pink-600 shadow-md border border-pink-100" : "text-gray-400 hover:bg-white hover:text-gray-600"
              }`}
            >
              <span className="text-xl">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-10 lg:p-12">
          
          {/* BASICS */}
          {activeTab === "basics" && (
            <form onSubmit={handleUpdateBasics} className="space-y-8 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-full">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Salon Display Name</label>
                  <input 
                    type="text" value={basicInfo.name} onChange={e => setBasicInfo({...basicInfo, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:ring-2 focus:ring-pink-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Operational Area</label>
                  <input 
                    type="text" value={basicInfo.location} onChange={e => setBasicInfo({...basicInfo, location: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:ring-2 focus:ring-pink-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Official Contact</label>
                  <input 
                    type="text" value={basicInfo.phone} onChange={e => setBasicInfo({...basicInfo, phone: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:ring-2 focus:ring-pink-400 outline-none transition"
                  />
                </div>
                <div className="col-span-full">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Physical Address</label>
                  <textarea 
                    value={basicInfo.address} onChange={e => setBasicInfo({...basicInfo, address: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 font-bold text-gray-800 focus:ring-2 focus:ring-pink-400 outline-none transition resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <button type="submit" className="bg-pink-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-pink-700 transition shadow-xl shadow-pink-100 active:scale-95">
                Apply Global Changes
              </button>
            </form>
          )}

          {/* GALLERY */}
          {activeTab === "gallery" && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-6 flex items-start gap-4">
                 <div className="bg-pink-100 p-2 rounded-xl text-pink-600 text-2xl">✨</div>
                 <div>
                   <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Showcase Participation</p>
                   <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">Images in this gallery are displayed in the <span className="font-black text-pink-600 italic">"Glow Gallery"</span> on the Home Page. As an Admin, you can curate or remove low-quality content from this network salon.</p>
                 </div>
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900 uppercase">Gallery Management</h3>
                <label className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest cursor-pointer hover:bg-black transition shadow-lg shadow-gray-200">
                  {uploading ? "Uploading..." : "+ Upload New"}
                  <input type="file" multiple hidden onChange={handleImageUpload} disabled={uploading}/>
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gallery.map((url, idx) => (
                  <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                    <img src={url} className="w-full h-full object-cover" alt="salon" />
                    <button 
                      onClick={() => handleRemoveImage(url)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                {gallery.length === 0 && <p className="text-gray-400 text-sm">No photos uploaded yet.</p>}
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input type="text" placeholder="Service" value={newSvc.name} onChange={e => setNewSvc({...newSvc, name: e.target.value})} className="border rounded-lg px-3 py-2 text-sm outline-none" />
                <input type="number" placeholder="Price" value={newSvc.price} onChange={e => setNewSvc({...newSvc, price: e.target.value})} className="border rounded-lg px-3 py-2 text-sm outline-none" />
                <input type="number" placeholder="Duration" value={newSvc.duration} onChange={e => setNewSvc({...newSvc, duration: e.target.value})} className="border rounded-lg px-3 py-2 text-sm outline-none" />
                <button onClick={handleAddService} className="bg-pink-600 text-white rounded-lg font-bold text-sm">Add</button>
              </div>
              <div className="divide-y">
                {services.map(s => (
                  <div key={s._id} className="py-3 flex justify-between items-center px-2 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-bold text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-500">₹{s.price} · {s.duration}m</p>
                    </div>
                    <button onClick={() => handleDeleteSvc(s._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "artists" && (
            <div className="space-y-6">
               <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3">
                  <input type="email" placeholder="Artist Email" value={newArtistEmail} onChange={e => setNewArtistEmail(e.target.value)} className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none" />
                  <button onClick={handleAddArtist} className="bg-gray-900 text-white px-6 rounded-lg font-bold text-sm">
                    + Add Artist
                  </button>
               </div>
               <p className="text-xs text-gray-500 italic mt-1 ml-2">Member must first have a Book.My.Glow account.</p>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {artists.map(a => (
                    <div key={a._id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center font-bold">
                        {a.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-900 truncate">{a.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{a.email}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManageSalon;
