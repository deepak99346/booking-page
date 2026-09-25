import { google } from "googleapis";

/**
 * Diagnostic log to check Google Sheets configuration on server startup.
 * NEVER prints private keys or sensitive credentials.
 */
export function logGoogleSheetsConfig() {
  const hasSheetId = Boolean(process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SHEET_ID.trim() !== "");
  const hasServiceAccountEmail = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL.trim() !== "");
  const hasPrivateKey = Boolean(process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_PRIVATE_KEY.trim() !== "");
  const sheetName = process.env.GOOGLE_SHEET_NAME?.trim() || "Bookings";

  console.log("Google Sheets configured:", {
    hasSheetId,
    hasServiceAccountEmail,
    hasPrivateKey,
    sheetName,
  });
}

/**
 * Appends a booking record as a new row in Google Sheets.
 *
 * Header Row Structure (13 columns, A:M):
 * Booking ID | Service | Name | Institute/Company | Department | Email | Contact Number | Details | Design File Name | Design File URL | Assign To | Completion Date | Created At
 *
 * @param {Object} booking - Booking data object
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function appendBookingToSheet(booking) {
  const bookingId = booking.id;
  console.log(`[Google Sheets] Starting sync for booking ID: ${bookingId}`);

  const spreadsheetId = process.env.GOOGLE_SHEET_ID?.trim();
  const sheetName = process.env.GOOGLE_SHEET_NAME?.trim() || "Bookings";
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawPrivateKey = process.env.GOOGLE_PRIVATE_KEY;

  const configPresent = Boolean(spreadsheetId && clientEmail && rawPrivateKey);
  console.log(`[Google Sheets] Configuration present: ${configPresent}`);

  if (!configPresent) {
    const errorMsg = "Google Sheets integration is not configured. Missing required environment variables.";
    console.warn(`[Google Sheets] Sync failed for booking ID ${bookingId}: ${errorMsg}`);
    return {
      success: false,
      error: errorMsg,
    };
  }

  try {
    const privateKey = rawPrivateKey.replace(/\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({
      version: "v4",
      auth,
    });

    const service = booking.service || "";
    const name = booking.name || "";
    const instituteCompany = booking.instituteCompany || booking.institute_company || "";
    const department = booking.department || "";
    const email = booking.email || "";
    const contactNumber = booking.contactNumber || booking.contact_number || "";

    const lengthVal = booking.length ?? booking.length_mm;
    const breadthVal = booking.breadth ?? booking.breadth_mm;
    const thicknessVal = booking.thickness ?? booking.thickness_mm;
    const materialVal = booking.material || "";
    const layerVal = booking.layer || "";
    const filamentVal = booking.filament || "";

    let details = "";

    if (service === "PCB Fabrication" || service === "PCB") {
      details = [
        `Facility: PCB Fabrication`,
        `Length: ${lengthVal} mm`,
        `Breadth: ${breadthVal} mm`,
        `Thickness: ${thicknessVal} mm`,
        `Material: ${materialVal}`,
        `Layer: ${layerVal}`,
      ].join("\n");
    } else if (service === "Laser Cutter") {
      details = [
        `Facility: Laser Cutter`,
        `Material: ${materialVal}`,
        `Thickness: ${thicknessVal} mm`,
      ].join("\n");
    } else if (service === "PCB Design") {
      const designName = booking.designFileName || booking.design_file_name || "";
      const rawExt = designName ? designName.slice(designName.lastIndexOf(".")).replace(".", "").toUpperCase() : "PDF";
      details = [
        `Facility: PCB Design`,
        `Design Type: PCB Design`,
        `File Type: ${rawExt}`,
      ].join("\n");
    } else if (service === "3D Design") {
      details = [
        `Facility: 3D Design`,
        `Filament: ${filamentVal}`,
      ].join("\n");
    } else if (service === "Website Design") {
      const webType = booking.websiteType || booking.website_type || "";
      const webPagesCount = booking.websitePagesCount ?? booking.website_pages_count;
      const webReqPages = booking.websiteRequiredPages || booking.website_required_pages || "";
      const webResponsive = booking.websiteResponsive || booking.website_responsive || "Yes";
      const webRefUrl = booking.websiteReferenceUrl || booking.website_reference_url || "";
      const webReqFeatures = booking.websiteRequiredFeatures || booking.website_required_features || "";
      const webContentStatus = booking.websiteContentStatus || booking.website_content_status || "";
      const webDesignRef = booking.websiteDesignReference || booking.website_design_reference || "";
      const webPrefTech = booking.websitePreferredTechnology || booking.website_preferred_technology || "";
      const webExpTimeline = booking.websiteExpectedTimeline || booking.website_expected_timeline || "";
      const webAddReq = booking.websiteAdditionalRequirements || booking.website_additional_requirements || "";

      const parts = [`Facility: Website Design`];
      if (webType) parts.push(`Website Type: ${webType}`);
      if (webPagesCount !== null && webPagesCount !== undefined && webPagesCount !== "") parts.push(`Number of Pages: ${webPagesCount}`);
      if (webReqPages) parts.push(`Required Pages: ${webReqPages}`);
      if (webResponsive) parts.push(`Responsive: ${webResponsive}`);
      if (webRefUrl) parts.push(`Reference URL: ${webRefUrl}`);
      if (webReqFeatures) parts.push(`Required Features: ${webReqFeatures}`);
      if (webContentStatus) parts.push(`Content Status: ${webContentStatus}`);
      if (webDesignRef) parts.push(`Design Reference: ${webDesignRef}`);
      if (webPrefTech) parts.push(`Preferred Technology: ${webPrefTech}`);
      if (webExpTimeline) parts.push(`Expected Timeline: ${webExpTimeline}`);
      if (webAddReq) parts.push(`Additional Requirements: ${webAddReq}`);

      details = parts.join("\n");
    } else {
      details = `Facility: ${service}`;
    }

    const designFileName = booking.designFileName || booking.design_file_name || "";

    const backendPublicUrl = (process.env.BACKEND_PUBLIC_URL || "http://localhost:5000").replace(/\/+$/, "");
    const designFileUrl = designFileName ? (booking.designFileUrl || `${backendPublicUrl}/api/bookings/${bookingId}/design`) : "";

    const createdAt = booking.createdAt || booking.created_at || new Date().toISOString();

    const rowValues = [
      bookingId,
      service,
      name,
      instituteCompany,
      department,
      email,
      contactNumber,
      details,
      designFileName,
      designFileUrl,
      "",
      "",
      createdAt,
    ];

    const range = `${sheetName}!A:M`;

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [rowValues],
      },
    });

    if (response.status === 200 || response.statusText === "OK") {
      console.log(`[Google Sheets] Append successful for booking ID: ${bookingId}`);

      // Optional: Automatically ensure Column H text wrapping strategy is set to WRAP
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
                    startColumnIndex: 7, // Column H (Details)
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
      } catch (formatErr) {
        console.warn(`[Google Sheets] Note: Could not set wrap text format on Column H: ${formatErr.message || formatErr}`);
      }

      return { success: true };
    } else {
      console.warn(`[Google Sheets] Append returned non-200 status: ${response.status}`);
      return {
        success: false,
        error: `Google Sheets API responded with status ${response.status}`,
      };
    }
  } catch (error) {
    const safeErrorMessage = error.message || "Unknown error during Google Sheets append";
    console.error(`[Google Sheets] Sync failed for booking ID ${bookingId}: ${safeErrorMessage}`);
    return {
      success: false,
      error: safeErrorMessage,
    };
  }
}

