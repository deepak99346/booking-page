import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure server/data directory exists
const defaultDbPath = path.join(__dirname, "data", "service_bookings.db");
const dbPath = process.env.SQLITE_DB_PATH
  ? path.resolve(process.cwd(), process.env.SQLITE_DB_PATH)
  : defaultDbPath;

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to SQLite database
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Automatically create table if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS service_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service TEXT NOT NULL,
  name TEXT NOT NULL,
  institute_company TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  length_mm REAL NULL,
  breadth_mm REAL NULL,
  material TEXT NULL,
  thickness_mm REAL NULL,
  design_file_name TEXT NOT NULL,
  design_file_path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

db.exec(createTableQuery);

// Migrate database columns if they do not exist
const existingColumns = db.pragma("table_info(service_bookings)").map((col) => col.name);

const newColumns = [
  { name: "layer", type: "TEXT" },
  { name: "filament", type: "TEXT" },
  { name: "website_type", type: "TEXT" },
  { name: "website_pages_count", type: "INTEGER" },
  { name: "website_required_pages", type: "TEXT" },
  { name: "website_responsive", type: "TEXT" },
  { name: "website_reference_url", type: "TEXT" },
  { name: "website_required_features", type: "TEXT" },
  { name: "website_content_status", type: "TEXT" },
  { name: "website_design_reference", type: "TEXT" },
  { name: "website_preferred_technology", type: "TEXT" },
  { name: "website_expected_timeline", type: "TEXT" },
  { name: "website_additional_requirements", type: "TEXT" },
];

for (const col of newColumns) {
  if (!existingColumns.includes(col.name)) {
    db.exec(`ALTER TABLE service_bookings ADD COLUMN ${col.name} ${col.type};`);
    console.log(`[DB Migration] Added column '${col.name}' (${col.type}) to service_bookings table.`);
  }
}

export function testConnection() {
  try {
    const result = db.prepare("SELECT 1 AS alive").get();
    if (result && result.alive === 1) {
      return { success: true, message: "SQLite database connected" };
    }
    return { success: false, message: "SQLite query returned unexpected result" };
  } catch (error) {
    console.error("SQLite connection test failed:", error);
    return {
      success: false,
      message: `SQLite error: ${error.message}`,
    };
  }
}

export default db;

