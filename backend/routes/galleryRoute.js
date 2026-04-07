import express from "express";
import { getCommunityGallery } from "../controllers/galleryController.js";

const galleryRouter = express.Router();

galleryRouter.get("/community", getCommunityGallery);

export default galleryRouter;
