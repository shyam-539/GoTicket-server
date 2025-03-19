import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export const qrCodeGenerator = async (bookingData, bookingId) => {
  try {
    const bookingString = JSON.stringify(bookingData); // Convert booking data to string
    const qrCodePath = path.join("public/qrcodes", `${bookingId}.png`); // Save QR with booking ID

    // Generate QR Code and save as a PNG file
    await QRCode.toFile(qrCodePath, bookingString);

    // Return the relative URL for frontend use
    const qrCodeUrl = `/qrcodes/${bookingId}.png`;
    return qrCodeUrl;
  } catch (error) {
    console.error("Error generating QR Code:", error);
    throw new Error("QR Code generation failed");
  }
};
