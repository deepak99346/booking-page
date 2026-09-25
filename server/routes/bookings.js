import express from "express";
import path from "path";
import fs from "fs";
import db from "../db.js";
import { upload } from "../middleware/upload.js";
import { appendBookingToSheet } from "../services/googleSheets.js";

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
      let {
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
        layer,
        filament,
        websiteType,
        websitePagesCount,
        websiteRequiredPages,
        websiteResponsive,
        websiteReferenceUrl,
        websiteRequiredFeatures,
        websiteContentStatus,
        websiteDesignReference,
        websitePreferredTechnology,
        websiteExpectedTimeline,
        websiteAdditionalRequirements,
      } = req.body;

      // Rename legacy "PCB" to "PCB Fabrication" if received
      if (service === "PCB") {
        service = "PCB Fabrication";
      }

      const validFacilities = [
        "PCB Fabrication",
        "Laser Cutter",
        "PCB Design",
        "3D Design",
        "Website Design",
      ];

      if (!service || !validFacilities.includes(service)) {
        removeFileSilently(uploadedFilePath);
        return res.status(400).json({
          success: false,
          message: `Invalid facility selected. Allowed: ${validFacilities.join(", ")}`,
        });
      }

      // Common required fields validation
      if (
        !name ||
        !name.trim() ||
        !instituteCompany ||
        !instituteCompany.trim() ||
        !department ||
        !department.trim() ||
        !email ||
        !email.trim() ||
        !contactNumber ||
        !contactNumber.trim()
      ) {
        removeFileSilently(uploadedFilePath);
        return res.status(400).json({
          success: false,
          message: "All common contact fields (Name, Institute/Company, Department, Email, Contact Number) are required.",
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

      let lengthVal = null;
      let breadthVal = null;
      let thicknessVal = null;
      let materialVal = null;
      let layerVal = null;
      let filamentVal = null;
      let webTypeVal = null;
      let webPagesCountVal = null;
      let webReqPagesVal = null;
      let webResponsiveVal = null;
      let webRefUrlVal = null;
      let webReqFeaturesVal = null;
      let webContentStatusVal = null;
      let webDesignRefVal = null;
      let webPrefTechVal = null;
      let webExpTimelineVal = null;
      let webAddReqVal = null;

      const fileExt = req.file ? path.extname(req.file.originalname).toLowerCase() : "";

      // Service-specific validation & normalization
      if (service === "PCB Fabrication") {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "Design file is required for PCB Fabrication.",
          });
        }

        const allowedPcbExts = [".gbr", ".dxf", ".zip", ".drl"];
        if (!allowedPcbExts.includes(fileExt)) {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Invalid design file for PCB Fabrication. Allowed extensions: .gbr, .dxf, .zip, .drl",
          });
        }

        if (
          length === undefined ||
          length === "" ||
          breadth === undefined ||
          breadth === "" ||
          thickness === undefined ||
          thickness === "" ||
          !material ||
          !material.trim() ||
          !layer ||
          !layer.trim()
        ) {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Length, breadth, thickness, material, and layer are required for PCB Fabrication.",
          });
        }

        lengthVal = parseFloat(length);
        breadthVal = parseFloat(breadth);
        thicknessVal = parseFloat(thickness);

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

        if (isNaN(thicknessVal) || thicknessVal <= 0) {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Thickness must be a positive number (in mm).",
          });
        }

        if (layer !== "Single" && layer !== "Double") {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Layer must be 'Single' or 'Double'.",
          });
        }

        materialVal = material.trim();
        layerVal = layer.trim();

      } else if (service === "Laser Cutter") {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "Design file is required for Laser Cutter.",
          });
        }

        if (fileExt !== ".dxf") {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Invalid design file for Laser Cutter. Only .dxf files are allowed.",
          });
        }

        if (!material || !material.trim() || thickness === undefined || thickness === "") {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Material and thickness are required for Laser Cutter.",
          });
        }

        thicknessVal = parseFloat(thickness);
        if (isNaN(thicknessVal) || thicknessVal <= 0) {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Thickness must be a positive number (in mm).",
          });
        }

        materialVal = material.trim();

      } else if (service === "PCB Design") {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "Design file is required for PCB Design.",
          });
        }

        const allowedPcbDesignExts = [".pdf", ".zip"];
        if (!allowedPcbDesignExts.includes(fileExt)) {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Invalid design file for PCB Design. Allowed extensions: .pdf, .zip",
          });
        }

      } else if (service === "3D Design") {
        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "Design file is required for 3D Design.",
          });
        }

        if (fileExt !== ".stl") {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Invalid design file for 3D Design. Only .stl files are allowed.",
          });
        }

        if (!filament || (filament !== "PLA" && filament !== "ABS")) {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Filament is required for 3D Design and must be 'PLA' or 'ABS'.",
          });
        }

        filamentVal = filament;

      } else if (service === "Website Design") {
        if (!websiteType || !websiteType.trim()) {
          removeFileSilently(uploadedFilePath);
          return res.status(400).json({
            success: false,
            message: "Website Type is required for Website Design.",
          });
        }

        webTypeVal = websiteType.trim();
        webPagesCountVal = websitePagesCount ? parseInt(websitePagesCount, 10) : null;
        webReqPagesVal = Array.isArray(websiteRequiredPages)
          ? websiteRequiredPages.join(", ")
          : (websiteRequiredPages ? String(websiteRequiredPages).trim() : "");
        webResponsiveVal = websiteResponsive || "Yes";
        webRefUrlVal = websiteReferenceUrl ? websiteReferenceUrl.trim() : "";
        webReqFeaturesVal = websiteRequiredFeatures ? websiteRequiredFeatures.trim() : "";
        webContentStatusVal = websiteContentStatus ? websiteContentStatus.trim() : "";
        webDesignRefVal = websiteDesignReference ? websiteDesignReference.trim() : "";
        webPrefTechVal = websitePreferredTechnology ? websitePreferredTechnology.trim() : "";
        webExpTimelineVal = websiteExpectedTimeline ? websiteExpectedTimeline.trim() : "";
        webAddReqVal = websiteAdditionalRequirements ? websiteAdditionalRequirements.trim() : "";
      }

      // Filename and relative file path for database storage
      const designFileName = req.file ? req.file.originalname : "";
      const designFilePath = req.file ? path.relative(process.cwd(), req.file.path).replace(/\\/g, "/") : "";

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
          layer,
          filament,
          website_type,
          website_pages_count,
          website_required_pages,
          website_responsive,
          website_reference_url,
          website_required_features,
          website_content_status,
          website_design_reference,
          website_preferred_technology,
          website_expected_timeline,
          website_additional_requirements,
          design_file_name,
          design_file_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        materialVal,
        thicknessVal,
        layerVal,
        filamentVal,
        webTypeVal,
        webPagesCountVal,
        webReqPagesVal,
        webResponsiveVal,
        webRefUrlVal,
        webReqFeaturesVal,
        webContentStatusVal,
        webDesignRefVal,
        webPrefTechVal,
        webExpTimelineVal,
        webAddReqVal,
        designFileName,
        designFilePath
      );

      const bookingId = Number(info.lastInsertRowid);

      console.log("[POST /api/bookings] SQLite insertion succeeded.");
      console.log("[POST /api/bookings] Booking ID:", bookingId);
      console.log("[POST /api/bookings] Service:", service);

      const createdRow = db.prepare("SELECT created_at FROM service_bookings WHERE id = ?").get(bookingId);
      const createdAt = createdRow?.created_at || new Date().toISOString().replace("T", " ").substring(0, 19);

      const backendPublicUrl = (process.env.BACKEND_PUBLIC_URL || "http://localhost:5000").replace(/\/+$/, "");
      const designFileUrl = designFileName ? `${backendPublicUrl}/api/bookings/${bookingId}/design` : "";

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
        material: materialVal,
        thickness: thicknessVal,
        layer: layerVal,
        filament: filamentVal,
        websiteType: webTypeVal,
        websitePagesCount: webPagesCountVal,
        websiteRequiredPages: webReqPagesVal,
        websiteResponsive: webResponsiveVal,
        websiteReferenceUrl: webRefUrlVal,
        websiteRequiredFeatures: webReqFeaturesVal,
        websiteContentStatus: webContentStatusVal,
        websiteDesignReference: webDesignRefVal,
        websitePreferredTechnology: webPrefTechVal,
        websiteExpectedTimeline: webExpTimelineVal,
        websiteAdditionalRequirements: webAddReqVal,
        designFileName,
        designFileUrl,
        createdAt,
      };

      let sheetSynced = false;
      try {
        const sheetResult = await appendBookingToSheet(bookingDetails);
        sheetSynced = Boolean(sheetResult && sheetResult.success === true);
      } catch (sheetErr) {
        console.error("[POST /api/bookings] Exception during Google Sheets append:", sheetErr.message || sheetErr);
        sheetSynced = false;
      }

      console.log("[POST /api/bookings] Google Sheets sheetSynced:", sheetSynced);

      const responseObj = sheetSynced
        ? {
            success: true,
            bookingId,
            sheetSynced: true,
            message: "Booking created successfully",
            data: {
              id: bookingId,
            },
          }
        : {
            success: true,
            bookingId,
            sheetSynced: false,
            message: "Booking created successfully, but Google Sheets synchronization failed.",
            data: {
              id: bookingId,
            },
          };

      return res.status(201).json(responseObj);
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

    if (!booking.design_file_path || booking.design_file_path.trim() === "") {
      return res.status(404).json({
        success: false,
        message: "Design file not found for this booking",
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

