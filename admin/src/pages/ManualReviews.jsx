import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const ManualReviews = ({ token }) => {
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [userImage, setUserImage] = useState(false);
  const [productImage, setProductImage] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${backendUrl}/testimonial/list`);
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!userImage || !productImage) return toast.error("Please upload both images");
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("userName", userName);
      formData.append("rating", rating);
      formData.append("comment", comment);
      formData.append("userImage", userImage);
      formData.append("productImage", productImage);

      const res = await axios.post(`${backendUrl}/testimonial/add`, formData, {
        headers: { token },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setUserName("");
        setComment("");
        setUserImage(false);
        setProductImage(false);
        fetchReviews();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeReview = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    try {
      const res = await axios.post(`${backendUrl}/testimonial/remove`, { id }, { headers: { token } });
      if (res.data.success) {
        toast.success("Deleted");
        fetchReviews();
      } else toast.error(res.data.message);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Testimonials</h2>

      {/* --- FORM --- */}
      <form onSubmit={onSubmitHandler} className="bg-white p-6 rounded-xl shadow-sm border mb-8 max-w-2xl">
        <div className="flex gap-6 mb-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-semibold">User Photo</p>
            <label className="cursor-pointer w-20 h-20 border-2 border-dashed rounded-full flex items-center justify-center bg-gray-50 overflow-hidden">
              {userImage ? <img src={URL.createObjectURL(userImage)} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs text-center">Upload<br/>Face</span>}
              <input type="file" hidden onChange={(e) => setUserImage(e.target.files[0])} />
            </label>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-semibold">Product Photo</p>
            <label className="cursor-pointer w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
              {productImage ? <img src={URL.createObjectURL(productImage)} className="w-full h-full object-cover" /> : <span className="text-gray-400 text-xs text-center">Upload<br/>Product</span>}
              <input type="file" hidden onChange={(e) => setProductImage(e.target.files[0])} />
            </label>
          </div>
        </div>

        <div className="grid gap-4">
          <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Customer Name" className="border px-3 py-2 rounded" required />
          <select value={rating} onChange={(e) => setRating(e.target.value)} className="border px-3 py-2 rounded">
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
          </select>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Review Message..." className="border px-3 py-2 rounded h-24" required />
        </div>

        <button disabled={loading} className="mt-4 bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50">
          {loading ? "Uploading..." : "Add Testimonial"}
        </button>
      </form>

      {/* --- LIST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border flex gap-4 relative">
            <button onClick={() => removeReview(item._id)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded">✕</button>
            
            <img src={item.productImage} className="w-24 h-24 object-cover rounded-lg bg-gray-100 shrink-0" />
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img src={item.userImage} className="w-6 h-6 rounded-full object-cover" />
                <p className="font-bold text-sm">{item.userName}</p>
              </div>
              <p className="text-yellow-500 text-xs mb-1">{'★'.repeat(item.rating)}</p>
              <p className="text-xs text-gray-600 line-clamp-3">"{item.comment}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManualReviews;