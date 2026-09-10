import fs from "fs";
import path from "path";

/**
 * Format booking details into a structured Telegram text message.
 */
export function formatBookingMessage(booking) {
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

  let detailsBlock = "";
  if (service === "PCB") {
    detailsBlock = `PCB DETAILS
Length: ${length} mm
Breadth: ${breadth} mm
Material: ${material}
Thickness: ${thickness} mm`;
  } else {
    detailsBlock = `LASER CUTTER DETAILS
Material: ${material}
Thickness: ${thickness} mm`;
  }

  const formattedDate = createdAt || new Date().toISOString().replace("T", " ").substring(0, 16);

  return `🔔 NEW BOOKING

Booking ID: #${id}
Service: ${service}
Submitted At: ${formattedDate}

CUSTOMER DETAILS
Name: ${name}
Institute/Company: ${instituteCompany}
Department: ${department}
Email: ${email}
Contact Number: ${contactNumber}

${detailsBlock}

DESIGN FILE
File Name: ${designFileName}`;
}

/**
 * Helper to check Telegram configuration without logging sensitive tokens.
 */
export function isTelegramConfigured() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const configured = Boolean(token && chatId && token.trim() !== "" && chatId.trim() !== "");
  console.log("Telegram configured:", configured);
  return configured;
}

/**
 * Send text message to configured Telegram admin chat.
 */
export async function sendTelegramMessage(messageText) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!isTelegramConfigured()) {
    console.warn("Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing");
    return { success: false, error: "Telegram bot token or chat ID not configured" };
  }

  const url = `https://api.telegram.org/bot${token.trim()}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: messageText,
      }),
    });

    const data = await response.json();
    console.log("Telegram sendMessage HTTP status:", response.status);
    console.log("Telegram sendMessage response:", data.ok ? "Success (200 OK)" : data.description);

    if (response.ok && data.ok) {
      return { success: true, result: data.result };
    } else {
      const errorMsg = data.description || `HTTP ${response.status}: ${response.statusText}`;
      console.error("Telegram API error (sendMessage):", errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    console.error("Network error sending Telegram message:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send document file to configured Telegram admin chat.
 */
export async function sendTelegramDocument(filePath, caption, originalFileName) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId || token.trim() === "" || chatId.trim() === "") {
    return { success: false, error: "Telegram bot token or chat ID not configured" };
  }

  // Safe path resolution relative to process.cwd() or root
  const absolutePath = path.resolve(process.cwd(), filePath);
  const uploadsBase = path.resolve(process.cwd(), "uploads");
  const relativePath = path.relative(uploadsBase, absolutePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    console.error("Telegram document error: Path traversal attempt detected", { filePath, uploadsBase, absolutePath });
    return { success: false, error: "Access denied: invalid document file path" };
  }

  if (!fs.existsSync(absolutePath)) {
    console.error("Telegram document error: File does not exist at path", absolutePath);
    return { success: false, error: "File not found on server" };
  }

  const url = `https://api.telegram.org/bot${token.trim()}/sendDocument`;

  try {
    const fileBuffer = fs.readFileSync(absolutePath);
    const fileBlob = new Blob([fileBuffer]);

    const formData = new FormData();
    formData.append("chat_id", chatId.trim());
    if (caption) {
      formData.append("caption", caption);
    }
    formData.append("document", fileBlob, originalFileName || path.basename(absolutePath));

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("Telegram sendDocument HTTP status:", response.status);
    console.log("Telegram sendDocument response:", data.ok ? "Success (200 OK)" : data.description);

    if (response.ok && data.ok) {
      return { success: true, result: data.result };
    } else {
      const errorMsg = data.description || `HTTP ${response.status}: ${response.statusText}`;
      console.error("Telegram API error (sendDocument):", errorMsg);
      return { success: false, error: errorMsg };
    }
  } catch (error) {
    console.error("Network error sending Telegram document:", error.message);
    return { success: false, error: error.message };
  }
}
