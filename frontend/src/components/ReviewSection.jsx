// frontend/src/components/ReviewSection.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { ShopContext } from "../context/ShopContext";
import { backendUrl } from "../config";
import UserAvatar from "./UserAvatar";
import { toast } from "react-toastify";

/* -----------------------
   Star icon
   ----------------------- */
const StarIcon = ({ filled = false, className = "" }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 17.27L18.18 21l-1.63-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.45 4.73L5.82 21z" />
  </svg>
);

/* -----------------------
   Stars control
   ----------------------- */
const Stars = ({
  value = 0,
  onChange = () => {},
  readOnly = false,
  size = "md", // sm | md | lg
}) => {
  const sizeClass =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-7 h-7" : "w-5 h-5";

  if (readOnly) {
    return (
      <div className="flex items-center gap-1 pointer-events-none select-none">
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            className={s <= value ? "text-yellow-400" : "text-gray-300"}
          >
            <StarIcon filled={s <= value} className={sizeClass} />
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          title={`${s} star${s > 1 ? "s" : ""}`}
          className={`transition transform focus:outline-none ${
            s <= value
              ? "text-yellow-400 hover:-translate-y-0.5"
              : "text-gray-300 hover:-translate-y-0.5"
          }`}
        >
          <StarIcon filled={s <= value} className={sizeClass} />
        </button>
      ))}
    </div>
  );
};

/* -----------------------
   Decode JWT safely
   ----------------------- */
const getUserFromToken = (token) => {
  if (!token) return { userId: null, isAdmin: false };
  try {
    const [, payloadBase64] = token.split(".");
    if (!payloadBase64) return { userId: null, isAdmin: false };

    const payloadJson = atob(
      payloadBase64.replace(/-/g, "+").replace(/_/g, "/")
    );
    const payload = JSON.parse(payloadJson);

    const userId = payload.id || payload._id || payload.userId || null;
    const isAdmin = Boolean(payload.isAdmin);

    return { userId: userId ? String(userId) : null, isAdmin };
  } catch (err) {
    console.warn("Failed to decode token payload", err);
    return { userId: null, isAdmin: false };
  }
};

/* ======================================================
   MAIN COMPONENT
   ====================================================== */
const ReviewSection = ({ productId }) => {
  const { token } = useContext(ShopContext) || {};
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 6;
  const [loading, setLoading] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // IMPORTANT: correct base path -> /api/review
  const apiBase = `${backendUrl.replace(/\/$/, "")}/api/review`;

  // AOS init
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      mirror: false,
    });
  }, []);

  // decode token
  useEffect(() => {
    if (!token) {
      setCurrentUserId(null);
      setIsAdmin(false);
      return;
    }
    const { userId, isAdmin: adminFlag } = getUserFromToken(token);
    setCurrentUserId(userId);
    setIsAdmin(adminFlag);
  }, [token]);

  /* -----------------------
     Fetch reviews
     ----------------------- */
  const fetchReviews = async (p = 1) => {
    if (!productId) return;
    try {
      setLoading(true);

      const res = await fetch(
        `${apiBase}/list?productId=${productId}&page=${p}&limit=${limit}`
      );

      if (!res.ok) {
        const text = await res.text();
        console.warn("fetchReviews non-OK", res.status, text);
        setReviews([]);
        setTotal(0);
        return;
      }

      const data = await res.json();
      if (data && data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews.filter(Boolean));
        setTotal(Number(data.total) || 0);
        setPage(Number(data.page) || p);
        setTimeout(() => AOS.refresh(), 50);
      } else {
        console.warn("fetchReviews bad payload", data);
        setReviews([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("fetchReviews err", err);
      setReviews([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  /* -----------------------
     Submit review
     ----------------------- */
  const submitReview = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!productId) {
      toast.error("Product id missing.");
      return;
    }
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5.");
      return;
    }

    setSubmitting(true);
    try {
      const headers = {
        "Content-Type": "application/json",
        token,
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(`${apiBase}/add`, {
        method: "POST",
        headers,
        body: JSON.stringify({ productId, rating, comment }),
      });

      const data = await res.json().catch(async () => {
        const text = await res.text();
        console.warn("submitReview invalid JSON", text);
        return { success: false, message: text || "Invalid response" };
      });

      if (data && data.success) {
        await fetchReviews(1);
        setComment("");
        setRating(5);
        toast.success("Review posted.");
      } else {
        console.warn("Failed to add review", data);
        const msg =
          (data && data.message) ||
          "Could not save your review. Please try again.";
        toast.error(msg);

        // if backend says not authorized -> send to login
        if (data && /not authorized/i.test(String(data.message))) {
          navigate("/login");
        }
      }
    } catch (err) {
      console.error("submitReview err", err);
      toast.error("Something went wrong while posting review.");
    } finally {
      setSubmitting(false);
    }
  };

  /* -----------------------
     Delete review
     ----------------------- */
  const handleDelete = async (id) => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!id) return;
    if (!window.confirm("Delete review?")) return;

    try {
      const res = await fetch(`${apiBase}/${id}`, {
        method: "DELETE",
        headers: { token, Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(async () => {
        const text = await res.text();
        console.warn("deleteReview invalid JSON", text);
        return { success: false, message: text || "Invalid response" };
      });

      if (data && data.success) {
        fetchReviews(page);
        toast.success("Review deleted.");
      } else {
        console.warn("Failed to delete review", data);
        toast.error(
          (data && data.message) || "Could not delete this review."
        );
      }
    } catch (err) {
      console.error("handleDelete err", err);
      toast.error("Something went wrong while deleting review.");
    }
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r?.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  /* ======================================================
     RENDER
     ====================================================== */
  return (
    <section className="mt-12" data-aos="fade-up">
      <h3 className="text-2xl font-semibold mb-4 text-black">Reviews</h3>

      <div className="max-w-3xl mx-auto relative">
        <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-pink-200/60 via-rose-100/50 to-amber-100/60 blur-3xl" />

        <div className="rounded-[2rem] bg-gradient-to-br from-white/85 via-rose-50/80 to-white/90 border border-pink-100/80 shadow-[0_18px_40px_rgba(0,0,0,0.06)] backdrop-blur-2xl p-5 sm:p-6 space-y-5">
          {/* FORM CARD */}
          <div className="relative" data-aos="zoom-in" data-aos-delay="50">
            <div className="absolute inset-0 rounded-[1.8rem] bg-gradient-to-br from-white/40 via-rose-50/40 to-amber-50/40 blur-md -z-10" />
            <div className="p-5 sm:p-6 rounded-[1.8rem] bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_14px_30px_rgba(0,0,0,0.05)]">
              {/* header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-yellow-400 shadow-sm">
                    <span className="text-lg">⭐</span>
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-[0.18em] text-pink-500 font-semibold">
                      Product rating
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-base sm:text-lg font-semibold text-black">
                        {avgRating}
                      </span>
                      <Stars
                        value={Math.round(Number(avgRating))}
                        readOnly
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-pink-50 text-[11px] text-gray-600">
                  {total} review{total === 1 ? "" : "s"}
                </div>
              </div>

              <div className="mt-1 mb-4">
                <h4 className="text-lg sm:text-xl font-semibold text-black">
                  Rate your experience
                </h4>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                  Tell others how you felt about this design. Your feedback
                  helps us improve and helps other buyers choose better.
                </p>
              </div>

              <div className="h-px w-full bg-pink-100/80 mb-4" />

              {/* If not logged in – CTA only */}
              {!token ? (
                <div className="mt-1">
                  <p className="text-sm font-medium text-black mb-1">
                    Login to share your review
                  </p>
                  <p className="text-xs text-gray-600 mb-4">
                    We show reviews from verified accounts only.
                  </p>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full px-4 py-2.5 rounded-full bg-black text-white text-sm font-semibold shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-0.5"
                  >
                    Login to Review
                  </button>
                </div>
              ) : (
                <>
                  {/* rating row */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-pink-600 mb-2">
                      Your rating
                    </p>
                    <div className="bg-pink-50/80 rounded-2xl py-3 flex flex-col items-center gap-1">
                      <Stars value={rating} onChange={setRating} size="lg" />
                      <span className="text-[11px] text-gray-500">
                        Tap a star to set your rating
                      </span>
                    </div>
                  </div>

                  {/* textarea */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-pink-600 mb-2">
                      Your review
                    </p>
                    <div className="rounded-2xl bg-white shadow-inner border border-pink-100/80 overflow-hidden">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        placeholder="Tell us about the quality, packaging, delivery experience, or how the receiver liked it."
                        className="w-full p-3.5 bg-transparent placeholder:text-gray-500 text-sm text-black outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <button
                      onClick={submitReview}
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-transform text-sm disabled:opacity-70"
                    >
                      {submitting ? "Posting…" : "Post Review"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setComment("");
                        setRating(5);
                      }}
                      className="px-4 py-2.5 rounded-full border border-pink-100 text-[13px] text-gray-700 bg-white/80 hover:bg-pink-50 transition"
                    >
                      Reset
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* REVIEWS LIST */}
          <div className="space-y-4 pt-2">
            {loading ? (
              <div className="text-gray-600 text-sm">Loading reviews…</div>
            ) : reviews.length === 0 ? (
              <div
                className="p-4 sm:p-5 rounded-2xl border border-pink-100 bg-white/80 shadow-sm"
                style={{ backdropFilter: "blur(10px)" }}
                data-aos="fade-up"
              >
                <p className="text-gray-700 text-sm">
                  No reviews yet. Be the first to share your experience with
                  this design.
                </p>
              </div>
            ) : (
              reviews.map((r) => {
                const rid = r._id || r.id;
                if (!rid) return null;

                const ownerId = r.userId ? String(r.userId) : null;

                const canDelete =
                  !!token &&
                  ((ownerId && currentUserId && ownerId === currentUserId) ||
                    isAdmin);

                const fullName = (r.name || "").trim() || "User";
                const avatarId = ownerId || fullName || rid;

                return (
                  <article
                    key={rid}
                    className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl border border-pink-100 bg-white/85 shadow-sm"
                    style={{ backdropFilter: "blur(8px)" }}
                    data-aos="fade-up"
                  >
                    <UserAvatar name={fullName} id={avatarId} size="md" />

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-black text-sm">
                            {fullName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Verified buyer
                          </p>
                          {r?.createdAt && (
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {new Date(r.createdAt).toLocaleString()}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-end">
                            <Stars
                              value={r?.rating || 0}
                              readOnly
                              size="sm"
                            />
                            <span className="text-[10px] text-gray-500 mt-0.5">
                              {r?.rating?.toFixed
                                ? r.rating.toFixed(1)
                                : r?.rating || ""}
                              /5
                            </span>
                          </div>
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(rid)}
                              className="text-[11px] text-red-500 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>

                      {r?.comment && (
                        <p className="mt-2 text-gray-800 text-sm leading-relaxed">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  </article>
                );
              })
            )}

            {total > limit && (
              <div className="flex items-center gap-3 justify-end pt-1">
                <button
                  disabled={page === 1}
                  onClick={() => fetchReviews(page - 1)}
                  className="px-3 py-1.5 rounded-full border border-pink-100 text-gray-700 bg-white/80 hover:bg-pink-50 transition text-xs disabled:opacity-60"
                >
                  Prev
                </button>
                <span className="text-gray-700 text-xs">
                  Page <span className="font-medium">{page}</span>
                </span>
                <button
                  disabled={page * limit >= total}
                  onClick={() => fetchReviews(page + 1)}
                  className="px-3 py-1.5 rounded-full border border-pink-100 text-gray-700 bg-white/80 hover:bg-pink-50 transition text-xs disabled:opacity-60"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
