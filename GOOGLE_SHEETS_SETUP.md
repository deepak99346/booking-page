# Google Sheets Integration Setup Guide

This guide explains how to configure Google Sheets integration for the service booking application.

---

## 1. Create / Select a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your Google account.
3. Click the project dropdown at the top of the page and select **New Project** (or select an existing project).
4. Enter a project name (e.g., `Booking System Integrations`) and click **Create**.

---

## 2. Enable the Google Sheets API

1. In the Google Cloud Console search bar, search for **Google Sheets API**.
2. Select **Google Sheets API** from the Marketplace / APIs section.
3. Click **Enable**.

---

## 3. Create a Service Account

1. Navigation Menu $\rightarrow$ **IAM & Admin** $\rightarrow$ **Service Accounts**.
2. Click **+ Create Service Account** at the top.
3. Enter details:
   - **Service account name**: `booking-sheets-sync`
   - **Service account ID**: (Auto-generated, e.g. `booking-sheets-sync@your-project-id.iam.gserviceaccount.com`)
4. Click **Create and Continue**.
5. (Optional) You can skip granting project roles (the sheet will be explicitly shared with this email).
6. Click **Done**.

---

## 4. Generate Service Account Key (JSON)

1. On the Service Accounts list page, click on the newly created service account email.
2. Go to the **Keys** tab.
3. Click **Add Key** $\rightarrow$ **Create new key**.
4. Select **JSON** format and click **Create**.
5. A `.json` credentials file will be downloaded to your computer.

> [!CAUTION]
> Keep this JSON key safe and NEVER commit it or expose private keys in public code repositories.

---

## 5. Create and Setup the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/) and create a **Blank spreadsheet**.
2. Name the spreadsheet (e.g., `Service Bookings`).
3. Set the active tab name to `Bookings` (or note your tab name).
4. Add the following **exact header row** in Row 1 (Columns A through N):

| Col | Column Name |
| --- | --- |
| **A** | `Booking ID` |
| **B** | `Service` |
| **C** | `Name` |
| **D** | `Institute/Company` |
| **E** | `Department` |
| **F** | `Email` |
| **G** | `Contact Number` |
| **H** | `Length (mm)` |
| **I** | `Breadth (mm)` |
| **J** | `Thickness (mm)` |
| **K** | `Material` |
| **L** | `Design File Name` |
| **M** | `Design File URL` |
| **N** | `Created At` |

---

## 6. Share the Google Sheet with the Service Account

1. Copy the **Service Account Email** from your Google Cloud Console (or from `client_email` in the downloaded JSON file).
   - Example: `booking-sheets-sync@your-project-id.iam.gserviceaccount.com`
2. Open your Google Sheet.
3. Click the **Share** button in the top-right corner.
4. Paste the Service Account Email into the add people field.
5. Set permission level to **Editor**.
6. Uncheck "Notify people" and click **Share**.

---

## 7. Get the Google Spreadsheet ID

Look at your Google Sheet URL in your browser address bar:

```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0
```

The **Spreadsheet ID** is the long string between `/d/` and `/edit`:
`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

---

## 8. Configure Environment Variables (`.env`)

In the project root directory, edit or create `.env` (ensure `.env` is listed in `.gitignore`):

```env
PORT=5000
SQLITE_DB_PATH=server/data/service_bookings.db

# Public URL of backend server (used for generating Design File URLs)
BACKEND_PUBLIC_URL=http://localhost:5000

# Google Sheets Configuration
GOOGLE_SHEET_ID=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_SHEET_NAME=Bookings
GOOGLE_SERVICE_ACCOUNT_EMAIL=booking-sheets-sync@your-project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

> [!TIP]
> Make sure the `GOOGLE_PRIVATE_KEY` wraps the entire private key string inside double quotes and contains literal `\n` line breaks as provided in the downloaded JSON file.

---

## 9. Start the Application

Start the development servers:

```bash
npm run dev:full
```

Observe server startup logs:
```
Google Sheets configured: {
  hasSheetId: true,
  hasServiceAccountEmail: true,
  hasPrivateKey: true,
  sheetName: 'Bookings'
}
```

---

## 10. Test Booking Submission

1. Open the frontend application in your browser (default: `http://localhost:5173`).
2. Submit a new **PCB** or **Laser Cutter** booking with a valid `.gbr` or `.dxf` design file.
3. Upon submission:
   - Check SQLite database: a new booking record is stored.
   - Check Google Sheet: a new row is appended automatically with design file download URL.
