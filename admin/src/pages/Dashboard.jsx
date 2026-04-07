// admin/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const StatCard = ({ label, value, icon, color, subtext }) => (
  <div className={`${color} rounded-2xl p-5 flex items-start gap-4`}>
    <div className="text-3xl">{icon}</div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-medium opacity-80">{label}</p>
      {subtext && <p className="text-xs opacity-60 mt-0.5">{subtext}</p>}
    </div>
  </div>
);

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/stats`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) setStats(res.data);
      else toast.error(res.data.message || "Failed to load stats");
    } catch (err) {
      // Fallback to legacy endpoint
      try {
        const res2 = await axios.get(`${backendUrl}/api/dashboard/stats`, { headers: { token } });
        if (res2.data.success) {
          setStats({ stats: { totalUsers: res2.data.totalUsers }, recentUsers: res2.data.users, recentBookings: [] });
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, [token]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );

  const s = stats?.stats || {};
  const statusMap = s.bookingsByStatus || {};

  return (
    <div className="w-full p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={s.totalUsers || 0} icon="👥" color="bg-blue-50 text-blue-800" />
        <StatCard label="Active Salons" value={s.totalSalons || 0} icon="✂️" color="bg-pink-50 text-pink-800" />
        <StatCard label="Pending Approvals" value={s.pendingSalons || 0} icon="⏳" color="bg-amber-50 text-amber-800" />
        <StatCard label="Total Bookings" value={s.totalBookings || 0} icon="📅" color="bg-green-50 text-green-800" />
      </div>

      {/* Booking Status */}
      {Object.keys(statusMap).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h2 className="font-bold text-gray-700 mb-4">Booking Status Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
              { key: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
              { key: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
              { key: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
            ].map(({ key, label, color }) => (
              <div key={key} className={`${color} rounded-xl p-3 text-center`}>
                <p className="text-xl font-bold">{statusMap[key] || 0}</p>
                <p className="text-xs font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-700">Recent Bookings</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.recentBookings || []).slice(0, 8).map(b => (
              <div key={b._id} className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-sm font-bold flex-shrink-0">
                  {b.user?.name?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{b.user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{b.service?.name} @ {b.salon?.name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${
                  b.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                  b.status === "completed" ? "bg-green-100 text-green-700" :
                  b.status === "cancelled" ? "bg-red-100 text-red-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
            {(stats?.recentBookings || []).length === 0 && (
              <p className="p-6 text-center text-gray-400 text-sm">No bookings yet.</p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-700">Recent Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="p-3 text-left font-semibold">Name</th>
                  <th className="p-3 text-left font-semibold">Role</th>
                  <th className="p-3 text-left font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(stats?.recentUsers || []).slice(0, 8).map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="p-3">
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                        user.role === "admin" ? "bg-purple-100 text-purple-700" :
                        user.role === "salonOwner" ? "bg-blue-100 text-blue-700" :
                        user.role === "artist" ? "bg-pink-100 text-pink-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(stats?.recentUsers || []).length === 0 && (
              <p className="p-6 text-center text-gray-400 text-sm">No users yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;