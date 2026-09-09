import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { testConnection } from "./db.js";
import bookingsRouter from "./routes/bookings.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "designs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors({
  origin: true, // Allow frontend origin in development
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded designs statically (optional/restricted)
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Health Check Endpoint
app.get("/api/health", async (req, res) => {
  const dbStatus = await testConnection();
  res.status(200).json({
    success: true,
    message: "Backend server is running",
    database: dbStatus,
  });
});

// API Routes
app.use("/api/bookings", bookingsRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
