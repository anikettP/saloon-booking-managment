import express from "express";
import { addManualReview, listManualReviews, removeManualReview } from "../controllers/manualReviewController.js";
import adminAuth from "../middleware/adminAuth.js";
import upload from "../middleware/multer.js";

const manualReviewRouter = express.Router();

// Upload fields configuration
const uploadFields = upload.fields([
  { name: 'userImage', maxCount: 1 },
  { name: 'productImage', maxCount: 1 }
]);

manualReviewRouter.post("/add", adminAuth, uploadFields, addManualReview);
manualReviewRouter.get("/list", listManualReviews);
manualReviewRouter.post("/remove", adminAuth, removeManualReview);

export default manualReviewRouter;