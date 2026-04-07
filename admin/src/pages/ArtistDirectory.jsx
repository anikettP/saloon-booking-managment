// admin/src/pages/ArtistDirectory.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const ArtistDirectory = ({ token }) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/admin/users`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Filter for artists only
        const allArtists = res.data.users.filter(u => u.role === "artist");
        setArtists(allArtists);
      }
    } catch {
      toast.error("Failed to load artists");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const filtered = artists.filter(a => 
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.salon?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Artist <span className="text-pink-600">Inventory</span></h1>
          <p className="text-gray-500 text-sm mt-1 font-medium italic">Global directory of all platform-registered beauty experts</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search by name, email or salon..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-all text-sm font-medium"
          />
          <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-white rounded-3xl animate-pulse border border-gray-100 shadow-sm" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
           <div className="text-6xl mb-4">👨‍🎨</div>
           <p className="text-gray-500 font-bold text-lg">No artists found</p>
           <p className="text-gray-400 text-sm">Try broadening your search or register new artists</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(artist => (
            <div key={artist._id} className="bg-white rounded-[32px] p-6 border border-gray-50 shadow-xl shadow-gray-100/50 hover:shadow-pink-100/50 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-pink-200">
                   {artist.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-900 truncate text-lg uppercase tracking-tight">{artist.name}</h3>
                  <p className="text-xs text-pink-600 font-bold uppercase tracking-wider">Expert Professional</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-500 text-xs font-medium">
                   <span className="w-5 h-5 bg-gray-50 rounded-lg flex items-center justify-center">✉️</span>
                   <span className="truncate">{artist.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-xs font-medium">
                   <span className="w-5 h-5 bg-pink-50 rounded-lg flex items-center justify-center">🏢</span>
                   <span className="text-gray-800 font-bold">{artist.salon?.name || <span className="text-orange-400 italic">Unassigned</span>}</span>
                </div>
              </div>

              <div className="flex gap-2">
                 <div className="flex-1 bg-gray-50 rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Status</p>
                    <span className="text-xs font-bold text-green-600 uppercase">● Active</span>
                 </div>
                 <div className="flex-1 bg-gray-50 rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Account</p>
                    <span className="text-xs font-bold text-gray-700 uppercase">Verified</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArtistDirectory;
