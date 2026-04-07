// admin/src/pages/BookingManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const BookingManagement = ({ token }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/bookings/all`, {
        headers: { authorization: `Bearer ${token}` }
      });
      if (res.data.success) setBookings(res.data.bookings);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id, status) => {
    try {
      setUpdating(id);
      const res = await axios.put(
        `${backendUrl}/api/bookings/status/${id}`,
        { status },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Status updated");
        fetchBookings();
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(null);
    }
  };

  const confirmPayment = async (id) => {
    try {
      setUpdating(id);
      const res = await axios.put(
        `${backendUrl}/api/payments/manual-confirm/${id}`,
        { paymentStatus: "paid" },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Payment confirmed!");
        fetchBookings();
      }
    } catch {
      toast.error("Confirmation failed");
    } finally {
      setUpdating(null);
    }
  };

  const handlePrint = (booking) => {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date(booking.date).toLocaleDateString("en-IN", { day: '2-digit', month: 'long', year: 'numeric' });
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill - ${booking.customerName || booking.user?.name}</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #333; }
            .bill-card { max-width: 400px; margin: 0 auto; border: 1px solid #eee; padding: 30px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #fecdd3; padding-bottom: 20px; margin-bottom: 25px; }
            .brand { color: #db2777; font-weight: 900; font-size: 26px; margin-bottom: 5px; }
            .salon-name { font-size: 18px; font-weight: 700; color: #111; }
            .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
            .label { color: #666; font-weight: 500; }
            .value { color: #000; font-weight: 700; text-align: right; }
            .total-row { border-top: 1px dashed #ddd; padding-top: 15px; margin-top: 15px; }
            .total-label { font-size: 18px; font-weight: 800; }
            .total-value { font-size: 24px; font-weight: 900; color: #db2777; }
            .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1.5px; }
            .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: 900; }
            .paid { background: #dcfce7; color: #15803d; }
            .unpaid { background: #fef3c7; color: #b45309; }
          </style>
        </head>
        <body>
          <div class="bill-card">
            <div class="header">
              <div class="brand">Book.My.Glow</div>
              <div class="salon-name">${booking.salon?.name}</div>
              <div style="font-size: 9px; color: #aaa; margin-top: 8px;">REF: ${booking._id.toString().toUpperCase()}</div>
            </div>
            
            <div class="row"><span class="label">Booking Date</span><span class="value">${dateStr}</span></div>
            <div class="row"><span class="label">Customer</span><span class="value">${booking.customerName || booking.user?.name}</span></div>
            <div class="row"><span class="label">Technician</span><span class="value">${booking.artist?.name || 'Assigned Expert'}</span></div>
            
            <div style="margin: 20px 0; background: #fafafa; padding: 15px; border-radius: 16px; border: 1px solid #f0f0f0;">
              <div class="row" style="margin-bottom: 5px;"><span class="label">Service</span><span class="value">${booking.serviceName || booking.service?.name}</span></div>
              <div class="row" style="margin-bottom: 0;"><span class="label">Time</span><span class="value">${booking.timeSlot}</span></div>
            </div>

            <div class="row"><span class="label">Payment</span><span class="value status-badge ${booking.paymentStatus === 'paid' ? 'paid' : 'unpaid'}">${booking.paymentStatus?.toUpperCase()}</span></div>
            <div class="row"><span class="label">Method</span><span class="value">${booking.paymentMethod}</span></div>
            
            <div class="row total-row">
              <span class="label total-label">Grand Total</span>
              <span class="value total-value">₹${booking.price}</span>
            </div>
            
            <div class="footer">
              Professional Care Receipt<br>
              Book.My.Glow Network
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filtered = bookings.filter(b => {
    const matchStatus = filter === "all" || b.status === filter;
    const matchSearch = !search ||
      b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.salon?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.service?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  return (
    <div className="p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor and manage all bookings across salons.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { key: "total", label: "Total", color: "bg-gray-100 text-gray-700" },
          { key: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
          { key: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
          { key: "completed", label: "Completed", color: "bg-green-100 text-green-700" },
          { key: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-700" },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`${color} rounded-xl p-3 text-center transition hover:opacity-80 ${filter === key ? "ring-2 ring-offset-1 ring-gray-400" : ""}`}
          >
            <p className="text-xl font-bold">{stats[key]}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by customer, salon, or service..."
          className="w-full sm:max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-500">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase">
                  <th className="p-4 text-left font-semibold">Customer</th>
                  <th className="p-4 text-left font-semibold">Salon & Service</th>
                  <th className="p-4 text-left font-semibold">Date & Time</th>
                  <th className="p-4 text-left font-semibold">Financials</th>
                  <th className="p-4 text-left font-semibold">Status/Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{b.user?.name}</p>
                      <p className="text-xs text-gray-400">{b.user?.email}</p>
                      {b.customerPhone && <p className="text-xs text-gray-400">{b.customerPhone}</p>}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{b.salon?.name}</p>
                      <p className="text-xs text-gray-500">{b.service?.name || b.serviceName}</p>
                      {b.artist && <p className="text-xs text-purple-500">by {b.artist.name}</p>}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-gray-800">
                        {new Date(b.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs text-gray-500">{b.timeSlot}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-pink-600">{currency}{b.price}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${b.paymentStatus === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>
                        {b.paymentStatus === 'paid' ? '● Paid' : '○ Unpaid'}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium italic">{b.paymentMethod}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-2">
                        <select
                          value={b.status}
                          onChange={e => updateStatus(b._id, e.target.value)}
                          disabled={updating === b._id}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer capitalize ${STATUS_COLORS[b.status]} focus:outline-none`}
                        >
                          <option value="payment_pending">Payment Pending</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <div className="flex gap-2">
                          {b.paymentStatus !== "paid" && (
                            <button onClick={() => confirmPayment(b._id)} className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded font-bold hover:bg-green-100 uppercase transition">
                              Confirm Cash
                            </button>
                          )}
                          <button onClick={() => handlePrint(b)} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold hover:bg-gray-200 uppercase transition">
                            Print
                          </button>
                        </div>
                      </div>
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

export default BookingManagement;
