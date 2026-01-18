// backend/controllers/reviewController.js
import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";

/**
 * POST /api/review/add
 * Create / update a review for the current user on a product
 */
export const addReview = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { productId, rating, comment } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "Not authorized" });
    }

    if (!productId || !rating) {
      return res.json({
        success: false,
        message: "Product and rating are required",
      });
    }

    const numericRating = Number(rating);
    if (
      Number.isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // fetch user to get display name + email
    const user = await userModel
      .findById(userId)
      .select("name fullName email")
      .lean();

    const userName =
      (user && (user.name || user.fullName)) ||
      (user && user.email && user.email.split("@")[0]) ||
      "User";

    const userEmail = user?.email || "";

    // If user already reviewed this product -> update instead of duplicate
    let review = await reviewModel.findOne({ productId, userId });

    if (review) {
      review.rating = numericRating;
      review.comment = comment || "";
      review.userName = userName;
      review.userEmail = userEmail;
      await review.save();
    } else {
      review = await reviewModel.create({
        productId,
        userId,
        rating: numericRating,
        comment: comment || "",
        userName,
        userEmail,
      });
    }

    // populate user for frontend (optional)
    const populated = await review.populate("userId", "name fullName email");

    const displayName =
      (populated.userId &&
        (populated.userId.name || populated.userId.fullName)) ||
      populated.userName ||
      (populated.userEmail
        ? populated.userEmail.split("@")[0]
        : "User");

    // shape one clean object
    const shaped = {
      _id: populated._id,
      productId: populated.productId,
      rating: populated.rating,
      comment: populated.comment || "",
      createdAt: populated.createdAt,
      updatedAt: populated.updatedAt,
      name: displayName,
      userId: populated.userId?._id || populated.userId,
    };

    return res.json({
      success: true,
      review: shaped,
      message: "Review saved",
    });
  } catch (err) {
    console.error("addReview error:", err);
    return res.json({ success: false, message: err.message });
  }
};

/**
 * GET /api/review/list?productId=xxx&page=&limit=
 * Public endpoint – returns reviews for a product
 */
export const listReviews = async (req, res) => {
  try {
    const { productId, page = 1, limit = 6 } = req.query;

    if (!productId) {
      return res.json({
        success: false,
        message: "productId is required",
      });
    }

    const pageNum = Number(page) || 1;
    const perPage = Number(limit) || 6;

    const query = { productId };

    const [reviews, total] = await Promise.all([
      reviewModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .populate("userId", "name fullName email")
        .lean(),
      reviewModel.countDocuments(query),
    ]);

    const shaped = reviews.map((r) => {
      const userDoc = r.userId; // after populate this is the user document
      const userName =
        (userDoc && (userDoc.name || userDoc.fullName)) ||
        r.userName ||
        (r.userEmail ? r.userEmail.split("@")[0] : "") ||
        "User";

      const userId = userDoc?._id || r.userId || null;

      return {
        _id: r._id,
        productId: r.productId,
        rating: r.rating,
        comment: r.comment || "",
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        name: userName,
        userId,
      };
    });

    return res.json({
      success: true,
      reviews: shaped,
      total,
      page: pageNum,
    });
  } catch (err) {
    console.error("listReviews error:", err);
    return res.json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/review/:id
 * Only review owner or admin can delete
 */
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user?._id;
    const isAdmin = !!req.user?.isAdmin;
    const { id } = req.params;

    const review = await reviewModel.findById(id);
    if (!review) {
      return res.json({ success: false, message: "Review not found" });
    }

    if (!isAdmin && String(review.userId) !== String(userId)) {
      return res.json({
        success: false,
        message: "You cannot delete this review",
      });
    }

    await reviewModel.findByIdAndDelete(id);
    return res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    console.error("deleteReview error:", err);
    return res.json({ success: false, message: err.message });
  }
};
