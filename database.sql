-- Database SQL Script for Service Booking Application
-- Database: service_booking
-- Table: service_bookings

CREATE DATABASE IF NOT EXISTS service_booking;
USE service_booking;

CREATE TABLE IF NOT EXISTS service_bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  institute_company VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  contact_number VARCHAR(50) NOT NULL,
  length_mm DECIMAL(10,2) NULL,
  breadth_mm DECIMAL(10,2) NULL,
  material VARCHAR(100) NULL,
  thickness_mm DECIMAL(10,2) NULL,
  design_file_name VARCHAR(255) NOT NULL,
  design_file_path VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_service CHECK (service IN ('PCB', 'Laser Cutter')),
  CONSTRAINT chk_thickness CHECK (thickness_mm IS NULL OR thickness_mm > 0),
  CONSTRAINT chk_length CHECK (length_mm IS NULL OR length_mm > 0),
  CONSTRAINT chk_breadth CHECK (breadth_mm IS NULL OR breadth_mm > 0)
);
