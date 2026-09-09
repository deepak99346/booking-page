import db, { testConnection } from "./server/db.js";

console.log("Initializing SQLite Database...");

const status = testConnection();
if (status.success) {
  console.log("SQLite database and service_bookings table initialized successfully at server/data/service_bookings.db");
} else {
  console.error("Failed to initialize SQLite database:", status.message);
  process.exit(1);
}
