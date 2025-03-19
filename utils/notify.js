import { Notification } from "../models/Notification.js";

export const notifyAdmin = async (newTheaterOwner) => {
  try {
    if (!newTheaterOwner || !newTheaterOwner.name || !newTheaterOwner.email) {
      console.error("Invalid theater owner details provided for notification.");
      return;
    }

    const newNotification = new Notification({
      type: "TheaterOwnerSignup",
      message: `New Theater Owner Signup: ${newTheaterOwner.name} (${newTheaterOwner.email})`,
      ownerId: newTheaterOwner._id,
      isRead: false, // Mark as unread for admin
    });

    await newNotification.save();

    console.log("✅ New theater owner request saved for admin notification.");
    return { success: true, message: "Notification saved successfully." };
  } catch (error) {
    console.error("❌ Error notifying admin:", error);
    return { success: false, message: "Failed to save notification." };
  }
};
