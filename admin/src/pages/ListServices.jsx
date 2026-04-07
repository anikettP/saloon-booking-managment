// admin/src/pages/ListServices.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const ListServices = ({ token }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/services/all`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) setServices(res.data.services);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      setDeleting(id);
      const res = await axios.delete(`${backendUrl}/api/services/${id}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Service deleted");
        fetchServices();
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const toggleAvailable = async (id, current) => {
    try {
      await axios.put(
        `${backendUrl}/api/services/${id}`,
        { isAvailable: !current },
        { headers: { authorization: `Bearer ${token}` } }
      );
      fetchServices();
    } catch {
      toast.error("Update failed");
    }
  };

  const filtered = services.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.salon?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Services</h1>
          <p className="text-gray-500 text-sm mt-1">{services.length} total services across all salons</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search services..."
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 w-48"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">✂️</p>
          <p>No services found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-gray-500 text-xs uppercase">
                <th className="p-4 text-left font-semibold">Service</th>
                <th className="p-4 text-left font-semibold">Salon</th>
                <th className="p-4 text-left font-semibold">Category</th>
                <th className="p-4 text-left font-semibold">Price</th>
                <th className="p-4 text-left font-semibold">Duration</th>
                <th className="p-4 text-left font-semibold">Available</th>
                <th className="p-4 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(service => (
                <tr key={service._id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {service.image && (
                        <img src={service.image} alt={service.name} className="w-10 h-10 rounded-lg object-cover" />
                      )}
                      <p className="font-medium text-gray-800">{service.name}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600">{service.salon?.name || "—"}</td>
                  <td className="p-4">
                    <span className="bg-pink-50 text-pink-700 text-xs px-2 py-0.5 rounded-full">{service.category}</span>
                  </td>
                  <td className="p-4 font-semibold text-pink-600">{currency}{service.price}</td>
                  <td className="p-4 text-gray-600">{service.duration} min</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleAvailable(service._id, service.isAvailable)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                        service.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {service.isAvailable ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(service._id)}
                      disabled={deleting === service._id}
                      className="text-red-500 hover:text-red-700 text-xs px-3 py-1 rounded-lg hover:bg-red-50 transition"
                    >
                      {deleting === service._id ? "..." : "🗑️ Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListServices;
