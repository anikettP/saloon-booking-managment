// admin/src/pages/AddService.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const CATEGORIES = ["Hair", "Spa", "Nails", "Makeup", "Beard", "Skincare", "General"];

const AddService = ({ token }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Hair");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState(60);
  const [image, setImage] = useState(null);
  const [salonId, setSalonId] = useState("");
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch all approved salons for admin to assign service to
    const fetchSalons = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/admin/salons?approved=true`, {
          headers: { authorization: `Bearer ${token}` }
        });
        if (res.data.success) setSalons(res.data.salons);
      } catch {}
    };
    fetchSalons();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !duration || !salonId) {
      return toast.error("Please fill in all required fields including salon selection.");
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("duration", duration);
      formData.append("salonId", salonId);
      if (image) formData.append("image", image);

      const res = await axios.post(`${backendUrl}/api/services`, formData, {
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (res.data.success) {
        toast.success("✅ Service added successfully!");
        // Reset form
        setName(""); setDescription(""); setCategory("Hair"); setPrice(""); setDuration(60); setImage(null); setSalonId("");
      } else {
        toast.error(res.data.message || "Failed to add service");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Add New Service</h1>
        <p className="text-gray-500 text-sm mt-1">Add a service to a salon's menu.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

        {/* Salon Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Salon <span className="text-red-500">*</span>
          </label>
          <select
            value={salonId}
            onChange={e => setSalonId(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
          >
            <option value="">Choose a salon...</option>
            {salons.map(s => (
              <option key={s._id} value={s._id}>{s.name} – {s.location}</option>
            ))}
          </select>
        </div>

        {/* Service Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Service Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Premium Hair Color"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description of the service..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
          />
        </div>

        {/* Category + Duration + Price */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="500"
              min="0"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Duration (min) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              placeholder="60"
              min="15"
              step="15"
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Service Image</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl px-5 py-3 hover:border-pink-300 transition text-gray-500 text-sm">
              📷 {image ? image.name : "Choose image"}
              <input type="file" hidden accept="image/*" onChange={e => setImage(e.target.files[0])} />
            </label>
            {image && (
              <img src={URL.createObjectURL(image)} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-60 transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Adding...</>
          ) : (
            "✂️ Add Service"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddService;
