// admin/src/pages/SalonApprovals.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { AdminContext } from "../context/AdminContext";

const SalonApprovals = ({ token }) => {
  const { role } = useContext(AdminContext);
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // "all" | "pending" | "approved"
  const [processing, setProcessing] = useState(null);

  const isSuperAdmin = role === "superAdmin";

  const fetchSalons = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?approved=${filter === "approved"}` : "";
      const res = await axios.get(`${backendUrl}/api/admin/salons${params}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) setSalons(res.data.salons);
    } catch {
      toast.error("Failed to load salons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalons(); }, [filter]);

  const handleApprove = async (id, approve) => {
    try {
      setProcessing(id);
      const res = await axios.put(
        `${backendUrl}/api/admin/salons/${id}/approve`,
        { approved: approve },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Salon ${approve ? "approved" : "rejected"} successfully!`);
        fetchSalons();
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setProcessing(null);
    }
  };

  const handlePaymentStatus = async (id, status, method = "manual_online") => {
    try {
      setProcessing(id);
      const res = await axios.put(
        `${backendUrl}/api/admin/salons/${id}/payment`,
        { paymentStatus: status, paymentMethod: method },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Payment status updated to ${status}`);
        fetchSalons();
      }
    } catch {
      toast.error("Failed to update payment status");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this salon permanently?")) return;
    try {
      await axios.delete(`${backendUrl}/api/admin/salons/${id}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      toast.success("Salon deleted");
      fetchSalons();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Salon Approvals</h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve salon registrations</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          {["pending", "approved", "all"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                filter === f ? "bg-white shadow text-pink-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : salons.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-6xl mb-4">✂️</p>
          <p className="text-xl font-semibold text-gray-600">No {filter} salons found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {salons.map(salon => (
            <div key={salon._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
              {/* Banner Image */}
              {(salon.images?.[0] || salon.bannerImage) && (
                <div className="h-36 overflow-hidden">
                  <img
                    src={salon.images?.[0] || salon.bannerImage}
                    alt={salon.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{salon.name}</h3>
                    <p className="text-sm text-gray-500">📍 {salon.location}</p>
                    {salon.owner && (
                      <p className="text-xs text-gray-400 mt-1">
                        Owner: {salon.owner.name} · {salon.owner.email}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 ${
                    salon.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {salon.approved ? "✓ Approved" : "⏳ Pending"}
                  </span>
                </div>

                {/* Payment Status Badge */}
                <div className={`mb-3 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${
                  salon.paymentStatus === 'paid' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : salon.paymentStatus === 'failed' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : 'bg-orange-50 text-orange-700 border-orange-200'
                }`}>
                  {salon.paymentStatus === 'paid' ? '💰 Registration Paid' : salon.paymentStatus === 'failed' ? '❌ Payment Failed' : '🕒 Awaiting Payment'}
                </div>

                {/* Details */}
                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  {salon.phone && <p>📞 {salon.phone}</p>}
                  {salon.email && <p>✉️ {salon.email}</p>}
                  {salon.categories?.length > 0 && (
                    <p>🏷️ {salon.categories.join(", ")}</p>
                  )}
                  <p>🕒 {salon.workingHours?.start} - {salon.workingHours?.end}</p>
                  <p>📅 Registered: {new Date(salon.createdAt).toLocaleDateString("en-IN")}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {salon.paymentStatus !== "paid" && (
                       <>
                         <button 
                           onClick={() => handlePaymentStatus(salon._id, 'paid', 'manual_online')}
                           className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition uppercase tracking-widest whitespace-nowrap"
                         >
                           💰 Paid (Online)
                         </button>
                         <button 
                           onClick={() => handlePaymentStatus(salon._id, 'paid', 'manual_cash')}
                           className="text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 hover:bg-rose-100 transition uppercase tracking-widest whitespace-nowrap"
                         >
                           💵 Paid (Cash)
                         </button>
                       </>
                    )}
                  </div>
                </div>

                {salon.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{salon.description}</p>
                )}
                
                {salon.razorpayPaymentId && (
                  <p className="text-xs text-gray-400 mb-4 bg-gray-50 px-2 py-1 inline-block rounded border border-gray-100 font-mono">
                    TXN: {salon.razorpayPaymentId}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {!salon.approved ? (
                    <button
                      onClick={() => handleApprove(salon._id, true)}
                      disabled={processing === salon._id || (!isSuperAdmin && salon.paymentStatus !== 'paid')}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition shadow-md ${
                        processing === salon._id || (!isSuperAdmin && salon.paymentStatus !== 'paid') 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50' 
                        : isSuperAdmin && salon.paymentStatus !== 'paid'
                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100'
                        : 'bg-green-500 text-white hover:bg-green-600 shadow-green-100'
                      }`}
                      title={!isSuperAdmin && salon.paymentStatus !== 'paid' ? "Cannot approve until payment is completed" : isSuperAdmin && salon.paymentStatus !== 'paid' ? "Super Admin Bypass: Approve without Payment" : "Approve Salon"}
                    >
                      {processing === salon._id ? "..." : isSuperAdmin && salon.paymentStatus !== 'paid' ? "✨ Super Approve" : "✓ Approve"}
                    </button>
                  ) : (
                    <div className="flex-1 flex gap-2">
                      <button
                        onClick={() => handleApprove(salon._id, false)}
                        disabled={processing === salon._id}
                        className="bg-amber-500 text-white py-2 px-4 rounded-xl text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition"
                      >
                        Revoke
                      </button>
                      <button
                        onClick={() => window.location.href = `/manage-salon/${salon._id}`}
                        className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
                      >
                        ⚙️ Manage
                      </button>
                      <button
                        onClick={() => window.location.href = `/manage-salon/${salon._id}?tab=artists`}
                        className="bg-pink-600 text-white py-2 px-4 rounded-xl text-sm font-semibold hover:bg-pink-700 transition"
                        title="Add Artist to this Salon"
                      >
                        + Artist
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(salon._id)}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalonApprovals;
