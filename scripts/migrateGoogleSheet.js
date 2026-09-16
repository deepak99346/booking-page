import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const TARGET_HEADERS = [
  "Booking ID",
  "Service",
  "Name",
  "Institute/Company",
  "Department",
  "Email",
  "Contact Number",
  "Details",
  "Design File Name",
  "Design File URL",
  "Assign To",
  "Completion Date",
  "Created At",
];

export async function migrateSheet() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID?.trim();
  const sheetName = process.env.GOOGLE_SHEET_NAME?.trim() || "Bookings";
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!spreadsheetId || !clientEmail || !rawPrivateKey) {
    console.error("[Migration] Missing Google Sheets credentials in .env");
    process.exit(1);
  }

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  console.log(`[Migration] Reading existing sheet data from: ${sheetName}...`);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  const rows = response.data.values || [];

  if (rows.length === 0) {
    console.log("[Migration] Sheet is empty. Writing 13-column headers...");
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:M1`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [TARGET_HEADERS],
      },
    });
    console.log("[Migration] Header written successfully.");
    return;
  }

  const rawHeaders = rows[0].map((h) => (h || "").toString().trim());
  console.log("[Migration] Existing Header Row:", rawHeaders);

  // Determine index map based on header names
  const findIdx = (name) => rawHeaders.findIndex((h) => h.toLowerCase() === name.toLowerCase());

  const bookingIdIdx = findIdx("Booking ID");
  const serviceIdx = findIdx("Service");
  const nameIdx = findIdx("Name");
  const instituteIdx = findIdx("Institute/Company");
  const departmentIdx = findIdx("Department");
  const emailIdx = findIdx("Email");
  const contactIdx = findIdx("Contact Number");
  const detailsIdx = findIdx("Details");

  const lengthIdx = findIdx("Length (mm)");
  const breadthIdx = findIdx("Breadth (mm)");
  const thicknessIdx = findIdx("Thickness (mm)");
  const materialIdx = findIdx("Material");

  const designNameIdx = findIdx("Design File Name");
  const designUrlIdx = findIdx("Design File URL");
  const assignToIdx = findIdx("Assign To");
  const completionDateIdx = findIdx("Completion Date");
  const createdAtIdx = findIdx("Created At");

  const newRows = [TARGET_HEADERS];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const bookingId = (bookingIdIdx >= 0 ? row[bookingIdIdx] : row[0]) || "";
    const service = (serviceIdx >= 0 ? row[serviceIdx] : row[1]) || "";
    const name = (nameIdx >= 0 ? row[nameIdx] : row[2]) || "";
    const institute = (instituteIdx >= 0 ? row[instituteIdx] : row[3]) || "";
    const department = (departmentIdx >= 0 ? row[departmentIdx] : row[4]) || "";
    const email = (emailIdx >= 0 ? row[emailIdx] : row[5]) || "";
    const contact = (contactIdx >= 0 ? row[contactIdx] : row[6]) || "";

    let details = "";

    if (detailsIdx >= 0 && row[detailsIdx] && row[detailsIdx].trim() !== "") {
      // Row already has a Details cell
      details = row[detailsIdx];
    } else if (lengthIdx >= 0 || breadthIdx >= 0 || thicknessIdx >= 0 || materialIdx >= 0) {
      // Old layout with separate columns
      const len = lengthIdx >= 0 && row[lengthIdx] !== undefined && row[lengthIdx] !== "" ? row[lengthIdx] : "N/A";
      const brd = breadthIdx >= 0 && row[breadthIdx] !== undefined && row[breadthIdx] !== "" ? row[breadthIdx] : "N/A";
      const thk = thicknessIdx >= 0 && row[thicknessIdx] !== undefined && row[thicknessIdx] !== "" ? row[thicknessIdx] : "N/A";
      const mat = materialIdx >= 0 && row[materialIdx] !== undefined ? row[materialIdx] : "";

      details = [
        `Length: ${len} mm`,
        `Breadth: ${brd} mm`,
        `Thickness: ${thk} mm`,
        `Material: ${mat}`,
      ].join("\n");
    } else if (row.length >= 14) {
      // Fallback positional index for old 14 column layout
      const len = row[7] !== undefined && row[7] !== "" ? row[7] : "N/A";
      const brd = row[8] !== undefined && row[8] !== "" ? row[8] : "N/A";
      const thk = row[9] !== undefined && row[9] !== "" ? row[9] : "N/A";
      const mat = row[10] || "";

      details = [
        `Length: ${len} mm`,
        `Breadth: ${brd} mm`,
        `Thickness: ${thk} mm`,
        `Material: ${mat}`,
      ].join("\n");
    }

    const designName = (designNameIdx >= 0 ? row[designNameIdx] : (row.length >= 14 ? row[11] : row[8])) || "";
    const designUrl = (designUrlIdx >= 0 ? row[designUrlIdx] : (row.length >= 14 ? row[12] : row[9])) || "";
    const assignTo = (assignToIdx >= 0 ? row[assignToIdx] : "") || "";
    const completionDate = (completionDateIdx >= 0 ? row[completionDateIdx] : "") || "";
    const createdAt = (createdAtIdx >= 0 ? row[createdAtIdx] : (row.length >= 14 ? row[13] : row[10])) || "";

    newRows.push([
      bookingId,
      service,
      name,
      institute,
      department,
      email,
      contact,
      details,
      designName,
      designUrl,
      assignTo,
      completionDate,
      createdAt,
    ]);
  }

  console.log(`[Migration] Rebuilding sheet with ${newRows.length - 1} data rows...`);

  // Clear existing cells in sheet range
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  // Write new 13-column matrix
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A1:M${newRows.length}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: newRows,
    },
  });

  console.log("[Migration] Data rows successfully updated in Google Sheet!");

  // Set wrap text formatting on Column H (Details)
  try {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetObj = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title?.toLowerCase() === sheetName.toLowerCase()
    );
    const numericSheetId = sheetObj?.properties?.sheetId ?? 0;

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: numericSheetId,
                startColumnIndex: 7, // Column H
                endColumnIndex: 8,
                startRowIndex: 0,
              },
              cell: {
                userEnteredFormat: {
                  wrapStrategy: "WRAP",
                },
              },
              fields: "userEnteredFormat.wrapStrategy",
            },
          },
        ],
      },
    });
    console.log("[Migration] Set text wrapping (wrapStrategy: WRAP) on Column H");
  } catch (err) {
    console.warn("[Migration] Note: Could not format text wrap on Column H:", err.message);
  }

  console.log("[Migration] Sheet migration completed successfully!");
}

if (process.argv[1] && process.argv[1].endsWith("migrateGoogleSheet.js")) {
  migrateSheet().catch((err) => {
    console.error("[Migration] Migration failed:", err);
    process.exit(1);
  });
}
