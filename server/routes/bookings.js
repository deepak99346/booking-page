import express from "express";
import path from "path";
import fs from "fs";
import db from "../db.js";
import { upload } from "../middleware/upload.js";
import {
  formatBookingMessage,
  sendTelegramMessage,
  sendTelegramDocument,
} from "../services/telegram.js";

const router = express.Router();

// Helper to remove uploaded file if error or validation failure occurs
const removeFileSilently = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Error removing orphan file:", err);
    }
  }
};

// 1. CREATE BOOKING (POST /api/bookings)
router.post(
  "/",
  (req, res, next) => {
    upload.single("designFile")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error",
        });
      }
      next();
    });
  },
  async (req, res) => {
    const uploadedFilePath = req.file?.path;

    try {
      const {
        service,
        name,
        instituteCompany,
        department,
        email,
        contactNumber,
        length,
        breadth,
        material,
        thickness,
      } = req.body;

      // Check file existence
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Design file is required.",
        });
      }

      // Common required fields validation
      if (
        !service ||
        !name ||
        !instituteCompany ||
        !department ||
        !email ||
        !contactNumber ||
        !material ||
        thickness === undefined ||
        thickness === ""
      ) {
        removeFileSilently(uploadedFilePath);
        return res.status(400).json({
          success: false,
          message: "All required fields must be provided.",
        });
      }

      // Service validation
      if (service !== "PCB" && service !== "Laser Cutter") {
        removeFileSilently(uploadedFilePath);
        return res.status(400).json({
          success: false,
          message: "Invalid service selected. Allowed: PCB, Laser Cutter.",
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        removeFileSilently(uploadedFilePath);
        return res.status(400).json({
          success: false,
          message: "Invalid email address format.",
        });
      }

      // Thickness validation
      const thicknessVal = parseFloat(thickness);
      if (isNaN(thicknessVal) || thicknessVal <= 0) {
        removeFileSilently(uploadedFilePath);
        return res.status(400).json({
          success: false,
          message: "Thickness must be a positive number (in mm).",
        });
      }

      // Service-specific validation & normalization
      let lengthVal = null;
      let breadthVal = null;
      const fileExt = path.extname(req.file.originalname).toLowerCase();

      if (service === "PCB") {
        if (length === undefined || length === "" || breadth === undefined || breadth === "") {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Length and breadth are required for PCB service.",
          });
        }

        lengthVal = parseFloat(length);
        breadthVal = parseFloat(breadth);

        if (isNaN(lengthVal) || lengthVal <= 0) {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Length must be a positive number (in mm).",
          });
        }

        if (isNaN(breadthVal) || breadthVal <= 0) {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Breadth must be a positive number (in mm).",
          });
        }

        if (fileExt !== ".gbr" && fileExt !== ".dxf") {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Invalid design file for PCB. Allowed extensions: .gbr, .dxf",
          });
        }
      } else if (service === "Laser Cutter") {
        // Laser cutter only allows .dxf
        if (fileExt !== ".dxf") {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Invalid design file for Laser Cutter. Only .dxf files are allowed.",
          });
        }
        lengthVal = null;
        breadthVal = null;
      }

      // Filename and relative file path for database storage
      const designFileName = req.file.originalname;
      const designFilePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, "/");

      // Prepared statement insert into SQLite
      const stmt = db.prepare(`
        INSERT INTO service_bookings (
          service,
          name,
          institute_company,
          department,
          email,
          contact_number,
          length_mm,
          breadth_mm,
          material,
          thickness_mm,
          design_file_name,
          design_file_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const info = stmt.run(
        service,
        name.trim(),
        instituteCompany.trim(),
        department.trim(),
        email.trim(),
        contactNumber.trim(),
        lengthVal,
        breadthVal,
        material.trim(),
        thicknessVal,
        designFileName,
        designFilePath
      );

      const bookingId = Number(info.lastInsertRowid);

      // Attempt Telegram Notification (Non-blocking DB persistence)
      let telegramSent = false;
      try {
        const createdRow = db.prepare("SELECT created_at FROM service_bookings WHERE id = ?").get(bookingId);
        const createdAt = createdRow?.created_at || new Date().toISOString().replace("T", " ").substring(0, 19);

        const bookingDetails = {
          id: bookingId,
          service,
          name: name.trim(),
          instituteCompany: instituteCompany.trim(),
          department: department.trim(),
          email: email.trim(),
          contactNumber: contactNumber.trim(),
          length: lengthVal,
          breadth: breadthVal,
          material: material.trim(),
          thickness: thicknessVal,
          designFileName,
          createdAt,
        };

        const messageText = formatBookingMessage(bookingDetails);
        const msgResult = await sendTelegramMessage(messageText);

        if (msgResult.success) {
          const absoluteFilePath = path.resolve(process.cwd(), req.file.path);
          const caption = `New ${service} Booking #${bookingId}\nCustomer: ${name.trim()}\nFile: ${designFileName}`;
          const docResult = await sendTelegramDocument(absoluteFilePath, caption, designFileName);

          if (docResult.success) {
            telegramSent = true;
          } else {
            console.error("Telegram document attachment failed:", docResult.error);
          }
        } else {
          console.error("Telegram text message notification failed:", msgResult.error);
        }
      } catch (tgError) {
        console.error("Error during Telegram notification process:", tgError.message);
      }

      if (telegramSent) {
        return res.status(201).json({
          success: true,
          bookingId,
          telegramSent: true,
          message: "Booking created successfully",
          data: {
            id: bookingId,
          },
        });
      } else {
        return res.status(201).json({
          success: true,
          bookingId,
          telegramSent: false,
          message: "Booking created successfully, but admin notification could not be sent.",
          data: {
            id: bookingId,
          },
        });
      }
    } catch (error) {
      console.error("Database or server error during booking:", error);
      removeFileSilently(uploadedFilePath);
      return res.status(500).json({
        success: false,
        message: "Server error occurred while saving booking. Please try again later.",
      });
    }
  }
);

// 2. GET ALL BOOKINGS (GET /api/bookings)
router.get("/", (req, res) => {
  try {
    const stmt = db.prepare("SELECT * FROM service_bookings ORDER BY created_at DESC");
    const bookings = stmt.all();
    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve bookings",
    });
  }
});

// 3. GET SINGLE BOOKING (GET /api/bookings/:id)
router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare("SELECT * FROM service_bookings WHERE id = ?");
    const booking = stmt.get(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error fetching booking by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve booking",
    });
  }
});

// 4. DOWNLOAD DESIGN FILE (GET /api/bookings/:id/design)
router.get("/:id/design", (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare("SELECT design_file_path, design_file_name FROM service_bookings WHERE id = ?");
    const booking = stmt.get(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const absoluteFilePath = path.resolve(process.cwd(), booking.design_file_path);

    // Prevent path traversal
    const uploadsBase = path.resolve(process.cwd(), "uploads");
    if (!absoluteFilePath.startsWith(uploadsBase)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (!fs.existsSync(absoluteFilePath)) {
      return res.status(404).json({
        success: false,
        message: "Design file not found on server",
      });
    }

    return res.download(absoluteFilePath, booking.design_file_name);
  } catch (error) {
    console.error("Error downloading design file:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to download design file",
    });
  }
});

export default router;

