import jwt from "jsonwebtoken";

export const generateToken = (id, role) => {
  try {
    if (!process.env.SECRET_KEY) {
      console.error("❌ SECRET_KEY is not defined in environment variables.");
      return null;
    }

    // Generate JWT Token
    const token = jwt.sign({ id, role }, process.env.SECRET_KEY, {
      expiresIn: 60 * 30, // 30 minutes in seconds (better compatibility)
    });

    return token;
  } catch (error) {
    console.error("❌ Error generating token:", error.message);
    return null;
  }
};
