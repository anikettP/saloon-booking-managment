// server.js (SALON BOOKING SYSTEM)

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
import User from "./models/userModel.js";
import bcrypt from "bcrypt";

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    const adminExists = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", salt);
      await User.create({
        name: "System Admin",
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: "admin"
      });
      console.log("✅ Admin user seeded successfully");
    }
  } catch (error) {
    console.error("❌ Admin seeding failed:", error);
  }
};

// Routes
import userRouter from "./routes/userRoute.js";
import authRoutes from "./routes/authRoutes.js";
import salonRoutes from "./routes/salonRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import dashboardRouter from "./routes/dashboardRoute.js";
import paymentRouter from "./routes/paymentRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import analyticsRoutes from "./routes/analyticsRoute.js";
import galleryRouter from "./routes/galleryRoute.js";

/* -------------------- Setup ---------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

const ALLOWED_ORIGINS = [
  "http://localhost:5173",  // Frontend dev
  "http://localhost:5174",  // Admin dev
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

/* ----------------- Security Middlewares ---------------- */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
});
app.use(limiter);

/* ------------------- Uploads --------------------- */
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

/* ---------- Body Parser + CORS ----------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Be permissive in dev; tighten in production
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "token"]
  })
);

/* ---------------- API Routes -------------------- */

// Legacy: frontend still calls /api/user/*
app.use("/api/user", userRouter);

// New unified auth: /api/auth/*
app.use("/api/auth", authRoutes);

// Salons
app.use("/api/salons", salonRoutes);

// Bookings
app.use("/api/bookings", bookingRoutes);

// Services
app.use("/api/services", serviceRoutes);

// Banners (CMS)
app.use("/api/banners", bannerRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Payments (Razorpay Salon Registration)
app.use("/api/payment", paymentRouter);

// Reviews (Customer Rating & Owner Reply)
app.use("/api/reviews", reviewRouter);

// Business Insights for Owners
app.use("/api/analytics", analyticsRoutes);

// Community Gallery (Phase 7)
app.use("/api/gallery", galleryRouter);

// Dashboard (legacy admin dashboard)
app.use("/api/dashboard", dashboardRouter);

/* ---------------- Health Route ------------------ */
app.get("/health", (req, res) =>
  res.json({ ok: true, uptime: process.uptime(), service: "Salon Booking System" })
);

/* ---------------- Serve Frontend (Production) ------------------ */
const frontendDistPath = path.join(__dirname, "../frontend/dist");

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads"))
      return res.status(404).json({ error: "Not Found" });

    const indexPath = path.join(frontendDistPath, "index.html");
    return fs.existsSync(indexPath)
      ? res.sendFile(indexPath)
      : res.status(404).send("Frontend build missing");
  });
}

/* ---------------- Start Server ------------------ */
let server = null;
let io = null;

const start = async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB Connected");

    await connectCloudinary();
    console.log("✅ Cloudinary Connected");

    await seedAdmin();

    server = http.createServer(app);

    io = new IOServer(server, {
      cors: {
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST"]
      },
    });

    app.set("io", io);

    io.on("connection", (socket) => {
      console.log("🔌 Socket connected:", socket.id);

      // Allow salon owners/admins to join rooms for live booking notifications
      socket.on("join-salon", (salonId) => {
        socket.join(`salon-${salonId}`);
        console.log(`Socket ${socket.id} joined salon-${salonId}`);
      });

      socket.on("disconnect", () =>
        console.log("❌ Socket disconnected:", socket.id)
      );
    });

    server.listen(PORT, () =>
      console.log(`🚀 Salon Booking Server running on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed Startup:", err);
    process.exit(1);
  }
};

start();

/* ---------------- Shutdown ------------------- */
process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));