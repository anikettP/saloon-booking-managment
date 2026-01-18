// backend/routes/reviewRouter.js
import express from "express";
import authUser from "../middleware/auth.js";
import {
  addReview,
  listReviews,
  deleteReview,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// PUBLIC – get reviews for a product
reviewRouter.get("/list", listReviews);

// LOGGED-IN – add/update a review
reviewRouter.post("/add", authUser, addReview);

// LOGGED-IN – delete own review (or admin)
reviewRouter.delete("/:id", authUser, deleteReview);

export default reviewRouter;
