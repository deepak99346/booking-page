import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_URL = "http://localhost:5000/api/bookings";

// Ensure dummy test files exist in scratch directory
const scratchDir = __dirname;

const createDummyFile = (filename, content = "dummy file content") => {
  const filePath = path.join(scratchDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf-8");
  }
  return filePath;
};

// Create dummy test files
const gbrFile = createDummyFile("test-board.gbr");
const zipFile = createDummyFile("test-board.zip");
const drlFile = createDummyFile("test-board.drl");
const dxfFile = createDummyFile("test-cut.dxf");
const pdfFile = createDummyFile("pcb-design.pdf");
const stlFile = createDummyFile("model.stl");

async function runTest(testName, service, fields, fileField = null) {
  const formData = new FormData();
  formData.append("service", service);
  formData.append("name", fields.name || "Test User");
  formData.append("instituteCompany", fields.instituteCompany || "IIT Patna");
  formData.append("department", fields.department || "CSE");
  formData.append("email", fields.email || "test@example.com");
  formData.append("contactNumber", fields.contactNumber || "9876543210");

  for (const key in fields) {
    if (["name", "instituteCompany", "department", "email", "contactNumber"].includes(key)) continue;
    if (Array.isArray(fields[key])) {
      formData.append(key, fields[key].join(", "));
    } else if (fields[key] !== null && fields[key] !== undefined) {
      formData.append(key, fields[key]);
    }
  }

  if (fileField) {
    const fileBuffer = fs.readFileSync(fileField.path);
    const blob = new Blob([fileBuffer], { type: "application/octet-stream" });
    formData.append("designFile", blob, fileField.filename);
  }

  try {
    const res = await fetch(SERVER_URL, {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    return { status: res.status, ok: res.ok, body: json };
  } catch (err) {
    return { status: 500, ok: false, error: err.message };
  }
}

async function runAllTests() {
  console.log("==================================================");
  console.log("RUNNING SUITE OF 12 FACILITY TEST CASES");
  console.log("==================================================\n");

  const results = [];

  // TEST 1: PCB Fabrication with .gbr
  const t1 = await runTest("TEST 1: PCB Fabrication (.gbr)", "PCB Fabrication", {
    length: "4",
    breadth: "5",
    thickness: "5",
    material: "Wood",
    layer: "Double",
  }, { path: gbrFile, filename: "test-board.gbr" });
  results.push({ test: "TEST 1: PCB Fabrication (.gbr)", expected: "Accepted (201)", got: t1.status, pass: t1.status === 201 && t1.body.success, details: t1.body });

  // TEST 2: PCB Fabrication with .zip
  const t2 = await runTest("TEST 2: PCB Fabrication (.zip)", "PCB Fabrication", {
    length: "4",
    breadth: "5",
    thickness: "5",
    material: "FR4",
    layer: "Single",
  }, { path: zipFile, filename: "test-board.zip" });
  results.push({ test: "TEST 2: PCB Fabrication (.zip)", expected: "Accepted (201)", got: t2.status, pass: t2.status === 201 && t2.body.success, details: t2.body });

  // TEST 3: PCB Fabrication with .drl
  const t3 = await runTest("TEST 3: PCB Fabrication (.drl)", "PCB Fabrication", {
    length: "10",
    breadth: "12",
    thickness: "1.6",
    material: "Copper",
    layer: "Double",
  }, { path: drlFile, filename: "test-board.drl" });
  results.push({ test: "TEST 3: PCB Fabrication (.drl)", expected: "Accepted (201)", got: t3.status, pass: t3.status === 201 && t3.body.success, details: t3.body });

  // TEST 4: Laser Cutter with .dxf
  const t4 = await runTest("TEST 4: Laser Cutter (.dxf)", "Laser Cutter", {
    material: "Acrylic",
    thickness: "3",
  }, { path: dxfFile, filename: "test-cut.dxf" });
  results.push({ test: "TEST 4: Laser Cutter (.dxf)", expected: "Accepted (201)", got: t4.status, pass: t4.status === 201 && t4.body.success, details: t4.body });

  // TEST 5: PCB Design with .pdf
  const t5 = await runTest("TEST 5: PCB Design (.pdf)", "PCB Design", {}, { path: pdfFile, filename: "pcb-design.pdf" });
  results.push({ test: "TEST 5: PCB Design (.pdf)", expected: "Accepted (201)", got: t5.status, pass: t5.status === 201 && t5.body.success, details: t5.body });

  // TEST 6: PCB Design with .zip
  const t6 = await runTest("TEST 6: PCB Design (.zip)", "PCB Design", {}, { path: zipFile, filename: "pcb-design.zip" });
  results.push({ test: "TEST 6: PCB Design (.zip)", expected: "Accepted (201)", got: t6.status, pass: t6.status === 201 && t6.body.success, details: t6.body });

  // TEST 7: 3D Design with PLA
  const t7 = await runTest("TEST 7: 3D Design (PLA)", "3D Design", { filament: "PLA" }, { path: stlFile, filename: "model.stl" });
  results.push({ test: "TEST 7: 3D Design (PLA)", expected: "Accepted (201)", got: t7.status, pass: t7.status === 201 && t7.body.success, details: t7.body });

  // TEST 8: 3D Design with ABS
  const t8 = await runTest("TEST 8: 3D Design (ABS)", "3D Design", { filament: "ABS" }, { path: stlFile, filename: "model.stl" });
  results.push({ test: "TEST 8: 3D Design (ABS)", expected: "Accepted (201)", got: t8.status, pass: t8.status === 201 && t8.body.success, details: t8.body });

  // TEST 9: Website Design without file
  const t9 = await runTest("TEST 9: Website Design (no file)", "Website Design", {
    websiteType: "Business Website",
    websitePagesCount: "5",
    websiteRequiredPages: ["Home", "About", "Services", "Contact"],
    websiteResponsive: "Yes",
    websiteReferenceUrl: "https://example.com",
    websiteRequiredFeatures: "Contact form, admin panel",
    websiteContentStatus: "Content Ready",
    websiteDesignReference: "Modern minimal design",
    websitePreferredTechnology: "React",
    websiteExpectedTimeline: "2 Weeks",
    websiteAdditionalRequirements: "SEO optimization required",
  });
  results.push({ test: "TEST 9: Website Design (no file)", expected: "Accepted (201)", got: t9.status, pass: t9.status === 201 && t9.body.success, details: t9.body });

  // TEST 10: Invalid PCB Fabrication file (.pdf)
  const t10 = await runTest("TEST 10: Invalid PCB Fab file (.pdf)", "PCB Fabrication", {
    length: "4",
    breadth: "5",
    thickness: "5",
    material: "Wood",
    layer: "Double",
  }, { path: pdfFile, filename: "test-board.pdf" });
  results.push({ test: "TEST 10: Invalid PCB Fab file (.pdf)", expected: "Rejected (400)", got: t10.status, pass: t10.status === 400 && !t10.body.success, details: t10.body });

  // TEST 11: Invalid PCB Design file (.gbr)
  const t11 = await runTest("TEST 11: Invalid PCB Design file (.gbr)", "PCB Design", {}, { path: gbrFile, filename: "pcb-design.gbr" });
  results.push({ test: "TEST 11: Invalid PCB Design file (.gbr)", expected: "Rejected (400)", got: t11.status, pass: t11.status === 400 && !t11.body.success, details: t11.body });

  // TEST 12: Invalid 3D Design file (.dxf)
  const t12 = await runTest("TEST 12: Invalid 3D Design file (.dxf)", "3D Design", { filament: "PLA" }, { path: dxfFile, filename: "model.dxf" });
  results.push({ test: "TEST 12: Invalid 3D Design file (.dxf)", expected: "Rejected (400)", got: t12.status, pass: t12.status === 400 && !t12.body.success, details: t12.body });

  let allPassed = true;
  for (const r of results) {
    const statusSymbol = r.pass ? "✅ PASS" : "❌ FAIL";
    console.log(`${statusSymbol} | ${r.test} | Expected: ${r.expected} | Got: ${r.got} | Message: ${r.details?.message || ""}`);
    if (!r.pass) allPassed = false;
  }

  console.log("\n==================================================");
  console.log(allPassed ? "ALL 12 TEST CASES PASSED SUCCESSFULLY!" : "SOME TESTS FAILED!");
  console.log("==================================================");
}

runAllTests().catch(console.error);
