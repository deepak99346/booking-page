import db from "../server/db.js";

async function verify() {
  console.log("=== CHECKING RECENT DATABASE ROWS ===");
  const rows = db.prepare("SELECT id, service, name, material, layer, filament, website_type, design_file_name, design_file_path FROM service_bookings ORDER BY id DESC LIMIT 12").all();
  console.table(rows);

  // Find a booking with design file and test download endpoint
  const fileBooking = rows.find(r => r.design_file_path && r.design_file_path !== "");
  if (fileBooking) {
    console.log(`\nTesting download endpoint for Booking ID ${fileBooking.id}...`);
    const res = await fetch(`http://localhost:5000/api/bookings/${fileBooking.id}/design`);
    console.log(`Download status code: ${res.status} (expected 200)`);
  }

  // Find a Website Design booking (no file) and test download endpoint
  const webBooking = rows.find(r => r.service === "Website Design");
  if (webBooking) {
    console.log(`\nTesting download endpoint for Website Design Booking ID ${webBooking.id}...`);
    const res = await fetch(`http://localhost:5000/api/bookings/${webBooking.id}/design`);
    console.log(`Download status code: ${res.status} (expected 404)`);
  }
}

verify().catch(console.error);
