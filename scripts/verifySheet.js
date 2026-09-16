import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function checkSheet() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID?.trim();
  const sheetName = process.env.GOOGLE_SHEET_NAME?.trim() || "Bookings";
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

  const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:M`,
  });

  const rows = res.data.values || [];
  console.log("TOTAL ROWS IN GOOGLE SHEET:", rows.length);
  console.log("\nHEADER ROW (Row 1):", rows[0]);

  const lastRow = rows[rows.length - 1];
  console.log("\nLAST ROW (New Test Booking):");
  console.log("Col A (Booking ID):", lastRow[0]);
  console.log("Col B (Service):", lastRow[1]);
  console.log("Col C (Name):", lastRow[2]);
  console.log("Col D (Institute/Company):", lastRow[3]);
  console.log("Col E (Department):", lastRow[4]);
  console.log("Col F (Email):", lastRow[5]);
  console.log("Col G (Contact Number):", lastRow[6]);
  console.log("Col H (Details):\n" + JSON.stringify(lastRow[7]));
  console.log("Col I (Design File Name):", lastRow[8]);
  console.log("Col J (Design File URL):", lastRow[9]);
  console.log("Col K (Assign To):", JSON.stringify(lastRow[10] ?? ""));
  console.log("Col L (Completion Date):", JSON.stringify(lastRow[11] ?? ""));
  console.log("Col M (Created At):", lastRow[12]);
}

checkSheet().catch((err) => console.error(err));
