import React, { useContext, useEffect, useState } from "react";
import { SalonContext } from "../context/SalonContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const SalonReviews = () => {
  const { salonId } = useParams();
  const { apiBase, token, user } = useContext(SalonContext);
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({}); // { reviewId: text }
  const [submitting, setSubmitting] = useState({}); // { reviewId: bool }

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchReviews();
  }, [token, salonId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // We'll use the public salon reviews endpoint, but the owner can reply.
      // Alternatively, we could use a dashboard-specific endpoint if we want more data.
      const res = await axios.get(`${apiBase}/reviews/salon/${salonId}`);
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleReplySubmit = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text || text.trim() === "") return;

    try {
      setSubmitting(prev => ({ ...prev, [reviewId]: true }));
      const res = await axios.put(`${apiBase}/reviews/${reviewId}/reply`, 
        { ownerReply: text.trim() },
        { headers: { authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Reply posted successfully!");
        // Update local state
        setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, ownerReply: text.trim() } : r));
        setReplyText(prev => ({ ...prev, [reviewId]: "" }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post reply");
    } finally {
      setSubmitting(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const handleTextChange = (reviewId, val) => {
    setReplyText(prev => ({ ...prev, [reviewId]: val }));
  };

  if (loading) return <div className="min-h-screen pt-32 text-center text-gray-500 font-medium">Loading reviews...</div>;

  return (
    <div className="min-h-screen pt-32 pb-16 px-4 sm:px-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button onClick={() => navigate("/dashboard")} className="text-gray-500 text-sm hover:text-pink-500 transition mb-2">← Back to Dashboard</button>
          <h1 className="text-3xl font-bold text-gray-900">Manage Reviews</h1>
          <p className="text-gray-500 mt-1">Reply to your customers' feedback.</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <p className="text-4xl mb-4">⭐</p>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No reviews found</h3>
          <p className="text-gray-500">Reviews for this salon will appear here once customers start booking.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map(review => (
            <div key={review._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-pink-600 font-bold text-lg">
                    {review.user?.name?.[0].toUpperCase() || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.user?.name || "Customer"}</h4>
                    <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={`text-lg transition-colors ${review.rating >= star ? "text-yellow-400" : "text-gray-100"}`}>★</span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                <p className="text-gray-700 italic leading-relaxed">"{review.comment}"</p>
              </div>

              {review.ownerReply ? (
                <div className="mt-4 bg-pink-50 rounded-2xl p-4 border-l-4 border-pink-500 transition-all">
                  <p className="text-xs font-bold text-pink-600 mb-1 uppercase tracking-wider">Your Reply</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.ownerReply}</p>
                </div>
              ) : (
                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest pl-1">Write a reply</label>
                  <div className="flex gap-2">
                    <textarea 
                      value={replyText[review._id] || ""}
                      onChange={(e) => handleTextChange(review._id, e.target.value)}
                      placeholder="Thank the customer or address their concerns..."
                      className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm focus:ring-2 focus:ring-pink-400 focus:bg-white outline-none transition-all resize-none h-20"
                    />
                    <button 
                      onClick={() => handleReplySubmit(review._id)}
                      disabled={submitting[review._id] || !replyText[review._id]?.trim()}
                      className="px-6 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50 active:scale-95"
                    >
                      {submitting[review._id] ? "..." : "Reply"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalonReviews;
