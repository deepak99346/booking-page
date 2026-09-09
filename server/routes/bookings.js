import express from "express";
import path from "path";
import fs from "fs";
import pool from "../db.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Helper to remove uploaded file if error occurs
const removeFileSilently = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("Error removing orphan file:", err);
    });
  }
};

router.post("/", (req, res, next) => {
  upload.single("designFile")(req, res, (err) => {
    if (err) {
      // Handle Multer upload errors (e.g. invalid file type or size limit)
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error",
      });
    }
    next();
  });
}, async (req, res) => {
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

    // Common fields validation
    if (!service || !name || !instituteCompany || !department || !email || !contactNumber || !material || thickness === undefined || thickness === "") {
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
    if (!emailRegex.test(email)) {
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
      // length and breadth explicitly NULL
      lengthVal = null;
      breadthVal = null;
    }

    // Save filename and relative/stored path
    const designFileName = req.file.originalname;
    const designFilePath = path.relative(path.join(process.cwd()), req.file.path).replace(/\\/g, "/");

    // Insert into MySQL
    const sql = `
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
    `;

    const values = [
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
      designFilePath,
    ];

    const [result] = await pool.execute(sql, values);

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: {
        id: result.insertId,
      },
    });

  } catch (error) {
    console.error("Database or server error during booking:", error);
    removeFileSilently(uploadedFilePath);
    return res.status(500).json({
      success: false,
      message: "Server error occurred while saving booking. Please try again later.",
    });
  }
});

export default router;
