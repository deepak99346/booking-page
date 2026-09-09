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
  design_file_name TEXT NOT NULL,
  design_file_path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
