import http from "http";
import fs from "fs";
import path from "path";
import db from "../server/db.js";

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

// Create dummy test files
const scratchDir = path.join(process.cwd(), "scratch");
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

const gbrFilePath = path.join(scratchDir, "test_circuit.gbr");
const dxfFilePath = path.join(scratchDir, "test_cut.dxf");

fs.writeFileSync(gbrFilePath, "G04 Test Gerber File Content*");
fs.writeFileSync(dxfFilePath, "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nEOF");

async function postMultipart(endpoint, fields, fileField) {
  return new Promise((resolve, reject) => {
    const boundary = "--------------------------" + Date.now().toString(16);
    let body = [];

    // Append text fields
    for (const [key, value] of Object.entries(fields)) {
      body.push(`--${boundary}\r\n`);
      body.push(`Content-Disposition: form-data; name="${key}"\r\n\r\n`);
      body.push(`${value}\r\n`);
    }

    // Append file if provided
    if (fileField) {
      const fileBuffer = fs.readFileSync(fileField.path);
      const filename = path.basename(fileField.path);
      body.push(`--${boundary}\r\n`);
      body.push(`Content-Disposition: form-data; name="${fileField.name}"; filename="${filename}"\r\n`);
      body.push(`Content-Type: application/octet-stream\r\n\r\n`);
      body.push(fileBuffer);
      body.push(`\r\n`);
    }

    body.push(`--${boundary}--\r\n`);

    const bodyBuffer = Buffer.concat(
      body.map((item) => (typeof item === "string" ? Buffer.from(item) : item))
    );

    const url = new URL(endpoint, BASE_URL);
    const req = http.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": bodyBuffer.length,
        },
      },
      (res) => {
        let rawData = "";
        res.on("data", (chunk) => (rawData += chunk));
        res.on("end", () => {
          let json = {};
          try {
            json = JSON.parse(rawData);
          } catch (e) {
            json = { raw: rawData };
          }
          resolve({ status: res.statusCode, body: json });
        });
      }
    );

    req.on("error", (err) => reject(err));
    req.write(bodyBuffer);
    req.end();
  });
}

async function getJson(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    http.get(url, (res) => {
      let rawData = "";
      res.on("data", (chunk) => (rawData += chunk));
      res.on("end", () => {
        let json = {};
        try {
          json = JSON.parse(rawData);
        } catch (e) {
          json = { raw: rawData };
        }
        resolve({ status: res.statusCode, body: json });
      });
    }).on("error", (err) => reject(err));
  });
}

async function runTests() {
  console.log("=== STARTING INTEGRATION TESTS ===");

  let passCount = 0;
  let totalCount = 0;

  function assert(condition, testName, details = "") {
    totalCount++;
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passCount++;
    } else {
      console.error(`✗ FAIL: ${testName} - ${details}`);
    }
  }

  // 1. PCB + .gbr
  const pcbGbrRes = await postMultipart(
    "/api/bookings",
    {
      service: "PCB",
      name: "Alice Johnson",
      instituteCompany: "IIT Patna",
      department: "Electrical Engineering",
      email: "alice@iitp.ac.in",
      contactNumber: "9876543210",
      length: "100",
      breadth: "50",
      material: "FR4",
      thickness: "1.6",
    },
    { name: "designFile", path: gbrFilePath }
  );

  assert(
    pcbGbrRes.status === 201 && pcbGbrRes.body.success === true && pcbGbrRes.body.sheetSynced !== undefined,
    "PCB service booking with .gbr file",
    JSON.stringify(pcbGbrRes.body)
  );

  const booking1Id = pcbGbrRes.body.bookingId;

  // Verify SQLite DB record for booking1
  const dbBooking1 = db.prepare("SELECT * FROM service_bookings WHERE id = ?").get(booking1Id);
  assert(
    dbBooking1 && dbBooking1.email === "alice@iitp.ac.in" && dbBooking1.service === "PCB",
    "SQLite contains created PCB booking record",
    JSON.stringify(dbBooking1)
  );

  // Verify design download endpoint for booking1
  const downloadRes1 = await getJson(`/api/bookings/${booking1Id}/design`);
  assert(
    downloadRes1.status === 200,
    "Design download endpoint GET /api/bookings/:id/design returns status 200"
  );

  // 2. PCB + .dxf
  const pcbDxfRes = await postMultipart(
    "/api/bookings",
    {
      service: "PCB",
      name: "Bob Smith",
      instituteCompany: "Tech Corp",
      department: "Hardware",
      email: "bob@techcorp.com",
      contactNumber: "9123456789",
      length: "80",
      breadth: "40",
      material: "Aluminum",
      thickness: "2.0",
    },
    { name: "designFile", path: dxfFilePath }
  );

  assert(
    pcbDxfRes.status === 201 && pcbDxfRes.body.success === true,
    "PCB service booking with .dxf file",
    JSON.stringify(pcbDxfRes.body)
  );

  // 3. Laser Cutter + .dxf
  const laserDxfRes = await postMultipart(
    "/api/bookings",
    {
      service: "Laser Cutter",
      name: "Charlie Brown",
      instituteCompany: "Design Studio",
      department: "Prototyping",
      email: "charlie@studio.com",
      contactNumber: "9988776655",
      material: "Acrylic",
      thickness: "3.0",
    },
    { name: "designFile", path: dxfFilePath }
  );

  assert(
    laserDxfRes.status === 201 && laserDxfRes.body.success === true,
    "Laser Cutter booking with .dxf file",
    JSON.stringify(laserDxfRes.body)
  );

  // 4. Invalid extension for Laser Cutter (.gbr not allowed for Laser Cutter)
  const laserGbrRes = await postMultipart(
    "/api/bookings",
    {
      service: "Laser Cutter",
      name: "Dave Miller",
      instituteCompany: "Lab",
      department: "R&D",
      email: "dave@lab.com",
      contactNumber: "9112233445",
      material: "Acrylic",
      thickness: "3.0",
    },
    { name: "designFile", path: gbrFilePath }
  );

  assert(
    laserGbrRes.status === 400 && laserGbrRes.body.success === false,
    "Laser Cutter rejects invalid .gbr file",
    JSON.stringify(laserGbrRes.body)
  );

  // 5. Missing design file
  const missingFileRes = await postMultipart(
    "/api/bookings",
    {
      service: "PCB",
      name: "Eve Online",
      instituteCompany: "Virtual",
      department: "IT",
      email: "eve@virtual.com",
      contactNumber: "9000000000",
      length: "50",
      breadth: "50",
      material: "FR4",
      thickness: "1.0",
    },
    null
  );

  assert(
    missingFileRes.status === 400 && missingFileRes.body.success === false,
    "Rejects request missing design file",
    JSON.stringify(missingFileRes.body)
  );

  // 6. Graceful Google Sheets failure response check
  assert(
    pcbGbrRes.body.sheetSynced === false && pcbGbrRes.body.message.includes("Google Sheets synchronization failed"),
    "Google Sheets fallback returns sheetSynced: false when unconfigured without crashing",
    pcbGbrRes.body.message
  );

  console.log(`\n=== TEST SUMMARY: ${passCount}/${totalCount} PASSED ===`);
  process.exit(passCount === totalCount ? 0 : 1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
