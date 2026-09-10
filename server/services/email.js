import fs from "fs";
import path from "path";
import { Resend } from "resend";

/**
 * Diagnostic log to check email configuration on startup without leaking API key.
 */
export function logEmailConfig() {
  console.log("Email configured:", {
    hasResendApiKey: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== ""),
    hasAdminEmail: Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_EMAIL.trim() !== ""),
    hasEmailFrom: Boolean(process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim() !== ""),
  });
}

/**
 * Format plain text fallback for email notification.
 */
export function formatBookingText(booking) {
  const {
    id,
    service,
    name,
    instituteCompany,
    department,
    email,
    contactNumber,
    length,
    breadth,
    material,
    thickness,
    designFileName,
    createdAt,
  } = booking;

  let serviceDetailsText = "";
  if (service === "PCB") {
    serviceDetailsText = `PCB DETAILS\nLength: ${length} mm\nBreadth: ${breadth} mm\nMaterial: ${material}\nThickness: ${thickness} mm`;
  } else {
    serviceDetailsText = `LASER CUTTER DETAILS\nMaterial: ${material}\nThickness: ${thickness} mm`;
  }

  const formattedDate = createdAt || new Date().toISOString().replace("T", " ").substring(0, 16);

  return `NEW SERVICE BOOKING

Booking ID: #${id}
Service: ${service}
Submitted At: ${formattedDate}

CUSTOMER DETAILS
Name: ${name}
Institute/Company: ${instituteCompany}
Department: ${department}
Email: ${email}
Contact Number: ${contactNumber}

${serviceDetailsText}

DESIGN FILE
File Name: ${designFileName}`;
}

/**
 * Format professional HTML content for email notification.
 */
export function formatBookingHtml(booking) {
  const {
    id,
    service,
    name,
    instituteCompany,
    department,
    email,
    contactNumber,
    length,
    breadth,
    material,
    thickness,
    designFileName,
    createdAt,
  } = booking;

  const formattedDate = createdAt || new Date().toISOString().replace("T", " ").substring(0, 16);

  let serviceDetailsHtml = "";
  if (service === "PCB") {
    serviceDetailsHtml = `
      <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #2563eb;">
        <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">PCB DETAILS</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
          <tr><td style="padding: 4px 0; font-weight: 600; width: 140px;">Length:</td><td>${length} mm</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 600;">Breadth:</td><td>${breadth} mm</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 600;">Material:</td><td>${material}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 600;">Thickness:</td><td>${thickness} mm</td></tr>
        </table>
      </div>
    `;
  } else {
    serviceDetailsHtml = `
      <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #0284c7;">
        <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">LASER CUTTER DETAILS</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
          <tr><td style="padding: 4px 0; font-weight: 600; width: 140px;">Material:</td><td>${material}</td></tr>
          <tr><td style="padding: 4px 0; font-weight: 600;">Thickness:</td><td>${thickness} mm</td></tr>
        </table>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Service Booking #${id}</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #1e293b; color: #ffffff; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">NEW SERVICE BOOKING</h1>
            <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">Booking ID: #${id} | Service: ${service}</p>
          </div>
          <div style="padding: 24px;">
            <div style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
              <strong>Submitted At:</strong> ${formattedDate}
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #64748b;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">CUSTOMER DETAILS</h3>
              <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
                <tr><td style="padding: 4px 0; font-weight: 600; width: 140px;">Name:</td><td>${name}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Institute/Company:</td><td>${instituteCompany}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Department:</td><td>${department}</td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Email:</td><td><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td></tr>
                <tr><td style="padding: 4px 0; font-weight: 600;">Contact Number:</td><td>${contactNumber}</td></tr>
              </table>
            </div>

            ${serviceDetailsHtml}

            <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 6px; border-left: 4px solid #10b981;">
              <h3 style="margin: 0 0 10px 0; color: #1e293b; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">DESIGN FILE</h3>
              <p style="margin: 0; font-size: 14px; color: #334155;"><strong>File Name:</strong> ${designFileName}</p>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            Service Booking Notification System
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send booking notification email with design file attachment using Resend SDK.
 */
export async function sendBookingEmail(booking, attachmentPath) {
  console.log("[sendBookingEmail] Started sendBookingEmail execution.");

  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const emailFrom = process.env.EMAIL_FROM;

  const hasApiKey = Boolean(apiKey && apiKey.trim() !== "");
  const hasAdminEmail = Boolean(adminEmail && adminEmail.trim() !== "");
  const hasEmailFrom = Boolean(emailFrom && emailFrom.trim() !== "");

  console.log("[sendBookingEmail] Env variables presence:", {
    hasResendApiKey: hasApiKey,
    hasAdminEmail: hasAdminEmail,
    hasEmailFrom: hasEmailFrom,
  });

  if (!hasApiKey || !hasAdminEmail || !hasEmailFrom) {
    const missingErr = "Resend email notification skipped: Missing RESEND_API_KEY, ADMIN_EMAIL, or EMAIL_FROM configuration.";
    console.warn(`[sendBookingEmail] ${missingErr}`);
    return { success: false, error: missingErr };
  }

  console.log("[sendBookingEmail] Attachment path provided:", attachmentPath);

  // Validate attachment existence and safety
  if (!attachmentPath) {
    const pathErr = "Email attachment error: No attachment path provided";
    console.error(`[sendBookingEmail] ${pathErr}`);
    return { success: false, error: pathErr };
  }

  const absolutePath = path.resolve(process.cwd(), attachmentPath);
  const fileExists = fs.existsSync(absolutePath);
  console.log("[sendBookingEmail] Attachment file absolute path:", absolutePath);
  console.log("[sendBookingEmail] Attachment file exists on disk:", fileExists);

  const uploadsBase = path.resolve(process.cwd(), "uploads");
  const relativePath = path.relative(uploadsBase, absolutePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    const traversalErr = "Email attachment error: Path traversal attempt detected";
    console.error(`[sendBookingEmail] ${traversalErr}`, { attachmentPath });
    return { success: false, error: traversalErr };
  }

  if (!fileExists) {
    const notFoundErr = "Design file not found on server";
    console.error(`[sendBookingEmail] ${notFoundErr} at ${absolutePath}`);
    return { success: false, error: notFoundErr };
  }

  const ext = path.extname(absolutePath).toLowerCase();
  console.log("[sendBookingEmail] Attachment extension:", ext);

  const allowedExts = booking.service === "PCB" ? [".gbr", ".dxf"] : [".dxf"];
  if (!allowedExts.includes(ext)) {
    const extErr = `File extension '${ext}' not allowed for service '${booking.service}'`;
    console.error(`[sendBookingEmail] ${extErr}`);
    return { success: false, error: extErr };
  }

  try {
    const fileBuffer = fs.readFileSync(absolutePath);
    const base64Content = fileBuffer.toString("base64");

    const resend = new Resend(apiKey.trim());

    const subject = `New ${booking.service} Booking #${booking.id} - ${booking.name}`;
    const htmlContent = formatBookingHtml(booking);
    const textContent = formatBookingText(booking);

    console.log("[sendBookingEmail] Attempting Resend API call (resend.emails.send)...", {
      service: booking.service,
      bookingId: booking.id,
      attachmentFilename: booking.designFileName || path.basename(absolutePath),
    });

    const response = await resend.emails.send({
      from: emailFrom.trim(),
      to: [adminEmail.trim()],
      subject,
      html: htmlContent,
      text: textContent,
      attachments: [
        {
          filename: booking.designFileName || path.basename(absolutePath),
          content: base64Content,
        },
      ],
    });

    const { data, error } = response || {};

    console.log("[sendBookingEmail] Resend API call complete.", {
      hasData: Boolean(data),
      hasError: Boolean(error),
    });

    if (error) {
      console.error("[sendBookingEmail] Resend API returned error:", {
        message: error.message,
        name: error.name,
        statusCode: error.statusCode || error.status || null,
        response: error.response || null,
        fullErrorObject: error,
      });
      return { success: false, error: error.message || error };
    }

    if (data) {
      console.log("[sendBookingEmail] Resend email sent successfully. Email ID:", data.id);
      return { success: true, data };
    }

    console.warn("[sendBookingEmail] Resend API response contained neither data nor error.");
    return { success: false, error: "Unknown response state from Resend API" };
  } catch (err) {
    console.error("[sendBookingEmail] Exception caught inside sendBookingEmail:", {
      message: err.message,
      name: err.name,
      statusCode: err.statusCode || err.status || null,
      response: err.response || null,
      fullErrorObject: err,
    });
    return { success: false, error: err.message || err };
  }
}
