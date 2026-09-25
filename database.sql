-- SQLite Database Schema Documentation for Service Booking Application
-- Database file: server/data/service_bookings.db
-- Table: service_bookings

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
  layer TEXT NULL,
  filament TEXT NULL,
  website_type TEXT NULL,
  website_pages_count INTEGER NULL,
  website_required_pages TEXT NULL,
  website_responsive TEXT NULL,
  website_reference_url TEXT NULL,
  website_required_features TEXT NULL,
  website_content_status TEXT NULL,
  website_design_reference TEXT NULL,
  website_preferred_technology TEXT NULL,
  website_expected_timeline TEXT NULL,
  website_additional_requirements TEXT NULL,
  design_file_name TEXT NOT NULL,
  design_file_path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

