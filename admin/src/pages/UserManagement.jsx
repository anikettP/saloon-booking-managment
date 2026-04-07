// admin/src/pages/UserManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const ROLES = ["customer", "salonOwner", "admin", "contentAdmin", "artist"];

const ROLE_STYLES = {
  admin: "bg-purple-100 text-purple-700",
  contentAdmin: "bg-indigo-100 text-indigo-700",
  salonOwner: "bg-blue-100 text-blue-700",
  artist: "bg-pink-100 text-pink-700",
  customer: "bg-gray-100 text-gray-600",
};

const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updating, setUpdating] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = roleFilter !== "all" ? `?role=${roleFilter}` : "";
      const res = await axios.get(`${backendUrl}/api/admin/users${params}`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) setUsers(res.data.users);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const updateRole = async (id, role) => {
    try {
      setUpdating(id);
      const res = await axios.put(
        `${backendUrl}/api/admin/users/${id}/role`,
        { role },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Role updated!");
        fetchUsers();
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/admin/users/${id}/toggle`,
        {},
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`User ${res.data.isActive ? "activated" : "deactivated"}`);
        fetchUsers();
      }
    } catch {
      toast.error("Update failed");
    }
  };

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleCounts = ROLES.reduce((acc, role) => {
    acc[role] = users.filter(u => u.role === role).length;
    return acc;
  }, {});

  return (
    <div className="p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} total registered users</p>
      </div>

      {/* Role Summary */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setRoleFilter("all")}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${roleFilter === "all" ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
        >
          All ({users.length})
        </button>
        {ROLES.map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition capitalize ${roleFilter === role ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
          >
            {role} ({roleCounts[role] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full sm:max-w-xs border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-gray-400">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-gray-500 text-xs uppercase">
                  <th className="p-4 text-left font-semibold">User</th>
                  <th className="p-4 text-left font-semibold">Role</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Joined</th>
                  <th className="p-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={e => updateRole(user._id, e.target.value)}
                        disabled={updating === user._id}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer capitalize focus:outline-none ${ROLE_STYLES[user.role]}`}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-xs">
                      {new Date(user.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleStatus(user._id)}
                        className={`text-xs px-3 py-1 rounded-lg font-medium transition ${
                          user.isActive ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"
                        }`}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
