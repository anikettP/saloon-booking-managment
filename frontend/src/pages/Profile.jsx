import React, { useContext, useEffect, useMemo, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import UserAvatar from "../components/UserAvatar"; 
import AOS from "aos"; 
import { Package, ShoppingCart, IndianRupee, Clock, Mail } from 'lucide-react'; 

// Helper function to render loading state placeholder
const LoadingPlaceholder = ({ height = 'h-5', className = 'w-full' }) => (
    <div className={`animate-pulse bg-pink-100 rounded ${height} ${className}`}></div>
);

const Profile = () => {
    const { token, backendUrl, navigate, currency } = useContext(ShopContext);

    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]); 
    const [loading, setLoading] = useState(true);

    // 1. Redirect if not authenticated
    useEffect(() => {
        if (!token) {
            navigate("/login?redirect=/profile");
        }
        AOS.refresh(); 
    }, [token, navigate]);

    // 2. Data Loading Effect
    useEffect(() => {
        const loadData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            
            setLoading(true);

            try {
                const apiBase = `${backendUrl.replace(/\/$/, "")}/api`;

                const [meRes, normalOrdersRes] = await Promise.all([
                    axios.get(`${apiBase}/user/me`, { headers: { token } }),
                    axios.post(
                        `${apiBase}/order/userorders`,
                        {},
                        { headers: { token } }
                    ),
                ]);

                // --- Process User Profile ---
                if (meRes.data.success) {
                    setUser(meRes.data.user);
                } else {
                    // Silent fail or toast
                    // toast.error(meRes.data.message);
                }

                // --- Process Orders ---
                const finalOrders = normalOrdersRes.data.success
                    ? normalOrdersRes.data.orders || []
                    : [];

                finalOrders.sort(
                    (a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
                );

                setOrders(finalOrders);
                
            } catch (err) {
                console.error("Profile load error:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [backendUrl, token, navigate]); 

    // 3. Stats Calculation
    const stats = useMemo(() => {
        const totalOrders = orders.length;
        let totalItems = 0;
        let totalAmount = 0;

        orders.forEach((order) => {
            totalAmount += order.amount || 0;

            if (Array.isArray(order.items)) {
                order.items.forEach((item) => {
                    totalItems += item.quantity || 1;
                });
            }
        });

        return { totalOrders, totalItems, totalAmount };
    }, [orders]);

    if (!token) return null; 

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
        })
        : "N/A";
    
    const fullName = user?.name || "User"; 
    const avatarId = user?._id || fullName;

    const getOrderStatusClass = (status) => {
        const s = (status || '').toLowerCase();
        if (s.includes('delivered')) return 'bg-green-100 text-green-700 border-green-200';
        if (s.includes('shipped') || s.includes('out for delivery')) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (s.includes('cancelled')) return 'bg-red-100 text-red-700 border-red-200';
        if (s.includes('placed')) return 'bg-pink-100 text-pink-700 border-pink-200';
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    };

    return (
        <section className="pt-40 pb-20 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                
                {/* 1. TITLE SECTION - BRIGHT PINK & PROFESSIONAL */}
                <div 
                    className="mb-10 p-8 bg-white rounded-3xl shadow-2xl border border-pink-50 relative overflow-hidden"
                    data-aos="fade-down"
                >
                    {/* Decorative Background Blur */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                    
                    <div className="relative z-10">
                        {/* Bright Pink Text with Gradient for Professional Look */}
                        <h6 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500 drop-shadow-sm mb-2">
                            My Profile
                        </h6>
                        <p className="text-base text-gray-500 font-medium max-w-lg">
                            Manage your personal details and view your order history in one place.
                        </p>
                    </div>
                </div>

                {/* 2. MAIN GRID CONTAINER */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] gap-6 lg:gap-8">
                    
                    {/* LEFT COLUMN: Profile + Stats */}
                    <div className="space-y-6">
                        
                        {/* A. Profile Info CARD */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Personal Details
                                </h2>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active
                                </span>
                            </div>

                            <div className="flex items-center gap-5">
                                <UserAvatar name={fullName} id={avatarId} size="xl" className="shadow-lg ring-4 ring-pink-50" />
                                
                                <div className="flex-1 min-w-0">
                                    {/* Using DIV instead of P to avoid console errors */}
                                    <div className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
                                        {loading ? <LoadingPlaceholder height="h-8" className="w-4/5" /> : fullName}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate mt-1 flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-pink-400 shrink-0" />
                                        {loading ? <LoadingPlaceholder height="h-4" className="w-3/4" /> : user?.email || "N/A"}
                                    </div>
                                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-medium border border-pink-100">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Joined {memberSince}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* B. Activity Stats CARD - BRIGHTENED PINK */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-lg p-6">
                            <h2 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest border-b border-gray-100 pb-3">
                                Account Overview
                            </h2>

                            {loading ? (
                                <div className="space-y-3"><LoadingPlaceholder height="h-24" /></div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Stat 1: Orders */}
                                    <div className="p-4 rounded-2xl bg-pink-50 hover:bg-pink-100 transition-colors border border-gray-100 flex flex-col items-center text-center group">
                                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-pink-600">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <p className="text-xl font-bold text-gray-800">{stats.totalOrders}</p>
                                        <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wide">Orders</p>
                                    </div>

                                    {/* Stat 2: Items */}
                                    <div className="p-4 rounded-2xl bg-pink-50 hover:bg-pink-100 transition-colors border border-gray-100 flex flex-col items-center text-center group">
                                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-pink-600">
                                            <ShoppingCart className="w-5 h-5" />
                                        </div>
                                        <p className="text-xl font-bold text-gray-800">{stats.totalItems}</p>
                                        <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wide">Items</p>
                                    </div>

                                    {/* Stat 3: Total Spent */}
                                    <div className="p-4 rounded-2xl bg-pink-50 hover:bg-pink-100 transition-colors border border-gray-100 flex flex-col items-center text-center group">
                                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform text-pink-600">
                                            <IndianRupee className="w-5 h-5" />
                                        </div>
                                        <p className="text-xl font-bold text-gray-800">{stats.totalAmount.toFixed(0)}</p>
                                        <p className="text-[10px] uppercase text-gray-500 font-bold tracking-wide">Spent</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Recent Orders List - ENHANCED DETAILS */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-lg p-6 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                Recent Activity
                            </h2>
                            <button
                                onClick={() => navigate("/orders")}
                                className="text-xs font-bold text-pink-600 hover:text-pink-800 transition-colors hover:underline"
                            >
                                View All Orders
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                <LoadingPlaceholder height="h-20" />
                                <LoadingPlaceholder height="h-20" />
                                <LoadingPlaceholder height="h-20" />
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Package className="w-12 h-12 text-gray-300 mb-3" />
                                <p className="text-sm text-gray-500 font-medium">No orders found.</p>
                                <button 
                                    onClick={()=>navigate('/collection')} 
                                    className="mt-3 px-4 py-2 bg-pink-600 text-white text-xs font-bold rounded-lg hover:bg-pink-700 transition shadow-md"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {orders.slice(0, 5).map((order) => {
                                    const itemsArray = Array.isArray(order.items) ? order.items : [];
                                    const firstItem = itemsArray[0] || {};
                                    // Use a map to build a cleaner list of item names and quantities
                                    const itemSummary = itemsArray.map(it => `${it.name} (x${it.quantity || 1})`).join(", ");
                                    const itemCount = itemsArray.reduce((sum, it) => sum + (it.quantity || 1), 0);
                                    
                                    const dateObject = new Date(order.date || order.createdAt);
                                    const dateDisplay = dateObject.toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    });
                                    const timeDisplay = dateObject.toLocaleTimeString("en-IN", {
                                        hour: '2-digit', minute: '2-digit', hour12: true
                                    });
                                    
                                    const statusClass = getOrderStatusClass(order.status);

                                    return (
                                        <div
                                            key={order._id}
                                            onClick={() => navigate('/orders')}
                                            className="group relative bg-white border border-gray-100 rounded-xl p-4 hover:border-pink-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                                        >
                                            
                                            {/* TOP ROW: Order Ref, Date, Time & Status */}
                                            <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                                                        <p className="text-sm font-bold text-gray-800 group-hover:text-pink-600 transition-colors">
                                                            Order #{order._id.slice(-6).toUpperCase()}
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-gray-500 pl-4 mt-0.5 flex gap-1">
                                                        <Clock className="w-3 h-3 text-pink-400" />
                                                        {dateDisplay} at {timeDisplay}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${statusClass} shrink-0`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            
                                            {/* ENHANCED PRODUCT DETAILS ROW */}
                                            <div className="flex items-center gap-4 py-2">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0 shadow-sm">
                                                    {/* Display the image of the first item in the order */}
                                                    <img 
                                                        src={firstItem.image} 
                                                        alt={firstItem.name || 'Product'} 
                                                        className="w-full h-full object-cover" 
                                                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.jpg' }} // Fallback image needed
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {/* Item Name and Quantity */}
                                                    <p className="text-sm font-bold text-gray-900 truncate" title={firstItem.name}>
                                                        {firstItem.name || 'Product Name Missing'} 
                                                        <span className="text-pink-600 font-extrabold ml-2">x{firstItem.quantity || 1}</span>
                                                        {itemCount > 1 && <span className="text-gray-400 font-normal text-xs ml-2">+ {itemCount - (firstItem.quantity || 1)} more items</span>}
                                                    </p>
                                                    
                                                    {/* Category/Type Metadata */}
                                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                                        {firstItem.category && `Category: ${firstItem.category}`}
                                                        {firstItem.type && ` | Type: ${firstItem.type}`}
                                                    </p>
                                                    
                                                    {/* Full Item Summary */}
                                                    <p className="text-xs text-gray-400 italic mt-1 truncate" title={itemSummary}>
                                                        {itemSummary}
                                                    </p>
                                                </div>
                                                
                                                {/* Total Amount */}
                                                <div className="flex items-center gap-1 font-bold text-gray-900 text-lg shrink-0">
                                                    <IndianRupee className="w-5 h-5 text-pink-600" />
                                                    {order.amount.toFixed(2)}
                                                </div>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Profile;