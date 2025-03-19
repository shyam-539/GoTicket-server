import { connect } from "mongoose";
import dotenv from "dotenv";
import { Admin } from "../models/Admin.js";
import bcrypt from "bcrypt";

dotenv.config();

const url = process.env.MONGO_URI;
const adminPassword = process.env.ADMIN_PWD;

const insertAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: "testadmin@example.com" });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = new Admin({
        name: "Admin",
        email: "testadmin@example.com",
        password: hashedPassword,
        role: "admin",
      });

      await admin.save();
      console.log("✅ Admin created successfully");
    } else {
      console.log("ℹ️ Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  }
};

// MongoDB connection logic
export const connectDB = async () => {
  try {
    if (!url) {
      throw new Error("MONGO_URI environment variable is not defined.");
    }

    // ✅ Use the latest connection syntax
    await connect(url);  
    console.log("✅ DB Connected Successfully");

    await insertAdmin();
  } catch (error) {
    console.error("❌ Error connecting to DB:", error);
    process.exit(1); 
  }
};

export default connectDB;
