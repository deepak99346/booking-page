import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/designs directory exists
const uploadDir = path.join(__dirname, "..", "..", "uploads", "designs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Prevent path traversal by extracting clean basename
    const safeOriginalName = path.basename(file.originalname).replace(/[^a-zA-Z0-0._-]/g, "_");
    const ext = path.extname(safeOriginalName).toLowerCase();
    const nameWithoutExt = path.basename(safeOriginalName, ext);
    
    // Format: timestamp-random-originalfilename.ext
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const finalFilename = `${uniqueSuffix}-${nameWithoutExt}${ext}`;
    
    cb(null, finalFilename);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (ext === ".gbr" || ext === ".dxf") {
    cb(null, true);
  } else {
    cb(new Error("INVALID_FILE_TYPE: Only .gbr and .dxf files are allowed."));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max limit
  },
  fileFilter,
});
