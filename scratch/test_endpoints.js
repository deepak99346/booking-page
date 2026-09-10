import fs from "fs";
import path from "path";

async function runTests() {
  console.log("=== STARTING BACKEND BOOKING TESTS ===");

  // Create test dummy files
  const scratchDir = path.resolve(process.cwd(), "scratch");
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const validGbrPath = path.join(scratchDir, "test_circuit.gbr");
  const validDxfPath = path.join(scratchDir, "test_shape.dxf");
  const invalidPdfPath = path.join(scratchDir, "test_document.pdf");

  fs.writeFileSync(validGbrPath, "G04 Test Gerber file content*");
  fs.writeFileSync(validDxfPath, "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nEOF");
  fs.writeFileSync(invalidPdfPath, "%PDF-1.4 dummy pdf content");

  // Helper to send multipart/form-data
  async function submitBooking(fields, filePath, fileName) {
    const formData = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    }

    if (filePath) {
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new Blob([fileBuffer]);
      formData.append("designFile", blob, fileName || path.basename(filePath));
    }

    const res = await fetch("http://localhost:5000/api/bookings", {
      method: "POST",
      body: formData,
    });

    const json = await res.json();
    return { status: res.status, data: json };
  }

  // TEST 1: PCB Booking with .gbr (Missing Resend API Key mode)
  console.log("\n--- TEST 1: PCB Booking with .gbr ---");
  const pcbRes = await submitBooking({
    service: "PCB",
    name: "Deepak Kumar",
    instituteCompany: "IIT Patna",
    department: "Computer Science",
    email: "deepak@example.com",
    contactNumber: "9876543210",
    length: "100",
    breadth: "80",
    material: "FR4",
    thickness: "1.6"
  }, validGbrPath, "test-board.gbr");

  console.log("PCB Booking Response:", pcbRes);
  if (pcbRes.status === 201 && pcbRes.data.success && pcbRes.data.emailSent === false) {
    console.log("✔ TEST 1 PASSED: Booking saved, emailSent: false returned as expected when key is unconfigured.");
  } else {
    console.error("❌ TEST 1 FAILED");
  }

  // TEST 2: Laser Cutter Booking with .dxf
  console.log("\n--- TEST 2: Laser Cutter Booking with .dxf ---");
  const laserRes = await submitBooking({
    service: "Laser Cutter",
    name: "Deepak Kumar",
    instituteCompany: "IIT Patna",
    department: "Computer Science",
    email: "deepak@example.com",
    contactNumber: "9876543210",
    material: "Acrylic",
    thickness: "3"
  }, validDxfPath, "design.dxf");

  console.log("Laser Cutter Response:", laserRes);
  if (laserRes.status === 201 && laserRes.data.success && laserRes.data.emailSent === false) {
    console.log("✔ TEST 2 PASSED: Laser Cutter booking saved.");
  } else {
    console.error("❌ TEST 2 FAILED");
  }

  // TEST 3: Invalid File Extension (.pdf for PCB)
  console.log("\n--- TEST 3: Invalid File Extension (.pdf) ---");
  const invalidFileRes = await submitBooking({
    service: "PCB",
    name: "Deepak Kumar",
    instituteCompany: "IIT Patna",
    department: "Computer Science",
    email: "deepak@example.com",
    contactNumber: "9876543210",
    length: "100",
    breadth: "80",
    material: "FR4",
    thickness: "1.6"
  }, invalidPdfPath, "invalid.pdf");

  console.log("Invalid File Response:", invalidFileRes);
  if (invalidFileRes.status === 400 && !invalidFileRes.data.success) {
    console.log("✔ TEST 3 PASSED: 400 Bad Request returned for invalid file extension.");
  } else {
    console.error("❌ TEST 3 FAILED");
  }

  // TEST 4: Fetch Bookings List (GET /api/bookings)
  console.log("\n--- TEST 4: GET /api/bookings ---");
  const listRes = await fetch("http://localhost:5000/api/bookings");
  const listJson = await listRes.json();
  console.log(`Retrieved ${listJson.data?.length} bookings from SQLite database.`);
  if (listRes.status === 200 && listJson.success && Array.isArray(listJson.data)) {
    console.log("✔ TEST 4 PASSED");
  } else {
    console.error("❌ TEST 4 FAILED");
  }

  console.log("\n=== ALL TESTS COMPLETED ===");
}

runTests().catch(err => console.error("Test execution error:", err));
