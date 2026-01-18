// server.js (FINAL PRODUCTION BUILD FOR SINGLE DOMAIN)
// - Serves APIs
// - Serves frontend (../frontend/dist) at '/'
// - Serves admin panel (../admin/dist) at '/admin'
// - Razorpay webhook raw body
// - Proper CORS for 1 domain
// - No localhost fallback
// - Fully deploy-ready

import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server as IOServer } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// Local Modules
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

// Routes
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import bannerRouter from "./routes/bannerRoute.js";
import banner2Router from "./routes/banner2Route.js";
import categoryRouter from "./routes/categoryRoute.js";
import manualReviewRouter from "./routes/manualReviewRoute.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import { razorpayWebhook } from "./controllers/paymentController.js";

/* -------------------- Setup ---------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

// IMPORTANT: Single domain only
const FRONTEND_URL = "https://wowwoolies.co.in";
const ADMIN_URL = "https://wowwoolies.co.in/admin";

// Allowed origins
const allowedOrigins = [FRONTEND_URL, "https://www.wowwoolies.co.in"];

/* ----------------- Security Middlewares ---------------- */
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
});
app.use(limiter);

/* ------------------- Uploads --------------------- */
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

/* ------- Razorpay Webhook (RAW BODY) ---------- */
app.post(
  "/api/payment/razorpay-webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    try {
      req.rawBody = req.body;
      return razorpayWebhook(req, res);
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
);

/* ---------- Body Parser + CORS ----------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

/* ---------------- API Routes -------------------- */
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/review", reviewRoute);
app.use("/api/banner", bannerRouter);
app.use("/api/banner2", banner2Router);
app.use("/api/category", categoryRouter);
app.use("/api/testimonial", manualReviewRouter);
app.use("/api/dashboard", dashboardRouter);

/* ---------------- Health Route ------------------ */
app.get("/health", (req, res) =>
  res.json({ ok: true, uptime: process.uptime() })
);

/* ---------------- Serve Frontend & Admin ------------------ */
const frontendDistPath = path.join(__dirname, "../frontend/dist");
const adminDistPath = path.join(__dirname, "../admin/dist");

app.use(express.static(frontendDistPath)); // main site
app.use("/admin", express.static(adminDistPath)); // admin panel

/* ---------------- SPA Fallbacks ------------------ */
app.get("*", (req, res) => {
  // Skip API & uploads
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads"))
    return res.status(404).json({ error: "Not Found" });

  // Admin fallback
  if (req.path.startsWith("/admin")) {
    const adminIndex = path.join(adminDistPath, "index.html");
    return fs.existsSync(adminIndex)
      ? res.sendFile(adminIndex)
      : res.status(404).send("Admin build missing");
  }

  // Frontend fallback
  const frontendIndex = path.join(frontendDistPath, "index.html");
  return fs.existsSync(frontendIndex)
    ? res.sendFile(frontendIndex)
    : res.status(404).send("Frontend build missing");
});

/* ---------------- Start After DB ------------------ */
let server = null;
let io = null;

const start = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected");

    connectCloudinary();

    server = http.createServer(app);

    // Socket.io
    io = new IOServer(server, {
      cors: {
        origin: allowedOrigins,
      },
    });

    app.set("io", io);

    io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);
      socket.on("disconnect", () => console.log("Socket disconnected:", socket.id));
    });

    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error("Failed Startup:", err);
    process.exit(1);
  }
};

start();

/* ---------------- Graceful Shutdown ------------------- */
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));
