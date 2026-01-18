import express from "express";
import {
  addCategory,
  listCategories,
  removeCategory,
} from "../controllers/categoryController.js";

import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const categoryRouter = express.Router();

categoryRouter.post("/add", adminAuth, upload.single("image"), addCategory);
categoryRouter.get("/list", listCategories);
categoryRouter.post("/remove", adminAuth, removeCategory);

export default categoryRouter;
