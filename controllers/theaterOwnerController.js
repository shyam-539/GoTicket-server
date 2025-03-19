import { TheaterOwner } from "../models/Theater.js";
import { notifyAdmin } from "../utils/notify.js";
import generateProfilePic from "../utils/profilePicGenerator.js";
import { generateToken } from "../utils/generateToken.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import sendEmail from "../utils/mailSender.js";
import { Movie } from "../models/Movie.js";
import { Show } from "../models/Shows.js";
import { Booking } from "../models/Booking.js";

// Signup
export const ownerSignup = async (req, res) => {
  try {
    // Get Data from body
    const {
      name,
      email,
      phone,
      location,
      password,
      profilePic,
      seatConfiguration,
    } = req.body;

    // Validation
    if (
      !name ||
      !email ||
      !phone ||
      !location ||
      !password ||
      !seatConfiguration ||
      seatConfiguration.length === 0
    ) {
      return res
        .status(400)
        .json({
          message: "All fields are required, including seat configuration.",
        });
    }

    // Check if owner already exists
    const existOwner = await TheaterOwner.findOne({ email });
    if (existOwner) {
      return res.status(400).json({ message: "Owner already exists" });
    }

    // Provide default profile picture
    const profilePicUrl = profilePic || generateProfilePic(name);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate seat configuration
    const validSeatTypes = ["Silver", "Gold", "Platinum"];

    const generateSeatStructure = (seatType, row, seat) => {
      let seatRows = [];
      const seatTypes = {
        Silver: ["I", "H", "G"],
        Gold: ["F", "E", "D"],
        Platinum: ["C", "B", "A"],
      };  
      const selectedRows = seatTypes[seatType];
      for (let i = 0; i < row; i++) {
        let rowLabel = selectedRows[i] // Convert to A, B, C...
        let seats = [];
        for (let j = 1; j <= seat; j++) {
          seats.push({
            seatLabel: `${rowLabel}${j}`, // Format like A1, A2, B1...
            isBooked: false,
          });
        }
        seatRows.push({ rowLabel, seats }); // Corrected seat instead of col
      }
      return seatRows;
    };

    // Process seat configurations
    const validatedSeats = seatConfiguration.map((item) => {
      if (
        !validSeatTypes.includes(item.seatType) ||
        item.totalSeats <= 0 ||
        item.price <= 0 ||
        item.row <= 0 || // Ensure rows and seats per row are provided
        item.seat <= 0
      ) {
        throw new Error("Invalid seat configuration.");
      }

      return {
        seatType: item.seatType,
        totalSeats: item.totalSeats,
        price: item.price,
        rows: generateSeatStructure(item.seatType, item.row, item.seat), // Fixed incorrect field
      };
    });

    // Save to DB
    const newTheaterOwner = new TheaterOwner({
      name,
      email,
      phone,
      location,
      password: hashedPassword,
      profilePic: profilePicUrl,
      isVerified: false,
      role: "theaterOwner",
      seatConfiguration: validatedSeats, // Store structured seat details
    });

    await newTheaterOwner.save();

    // Notify admin about the new theater owner request
    notifyAdmin(newTheaterOwner);

    // Generate Token
    const token = generateToken(newTheaterOwner._id, newTheaterOwner.role);
    res.cookie("token", token, { httpOnly: true, secure: true });

    // Send data to frontend Without password
    const ownerWithoutPassword = newTheaterOwner.toObject();
    delete ownerWithoutPassword.password;

    res
      .status(200)
      .json({ data: ownerWithoutPassword, message: "Owner Signup Successful" });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// Login
export const ownerLogin = async (req, res) => {
  try {
    //Get data from body
    const { email, password } = req.body;
    //Check User exist
    const userExist = await TheaterOwner.findOne({ email });
    if (!userExist) {
      res.status(400).json({ message: "User not exist" });
    }
    //password check
    const passwordMatch = await bcrypt.compare(password, userExist.password);
    if (!passwordMatch) {
      res.status(400).json({ message: "Invalid Credentials" });
    }
    //Check user profile is Verified
    if (!userExist.isVerified) {
      return res.status(400).json({ message: "User account is not Verifed" });
    }
    //Check user profile is Active
    if(!userExist.isActive){
      return res.status(400).json({ message: "User account is not Active" });
    }
    //Generate Token
    const token = generateToken(userExist._id, userExist.role);
    res.cookie("token", token, { httpOnly: true, secure: true });
    //Send data to frontend without password
    const ownerWithoutPassword = userExist.toObject();
    delete ownerWithoutPassword.password;
    res
      .status(200)
      .json({ data: ownerWithoutPassword, message: "Owner Signup Success" });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

// Logout
export const ownerLogout = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie("token", { httpOnly: true, secure: true });

    // Send success response
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res
      .status(error.statuscode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// Get Profile
export const OwnerProfile = async (req, res) => {
  try {
    res.status(200).json({data:req.user, message: "User fetched successfully" });
  } catch (error) {
    res
      .status(error.statuscode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// Edit Profile
export const ownerProfileEdit = async (req, res) => {
  try {
    //Get User Id from cookie
    const userId = req.user.id
    //Get data to be edited
    const {name,phone,location,acType,profilePic}=req.body
    //Edit the data and save to DB
    const updateData = await TheaterOwner.findByIdAndUpdate(
      userId,
      {
        name,
        phone,
        location,
        acType,
        profilePic,
      },
      { new: true }
    ).select("-password");
    if(!updateData){
         return res.status(404).json({ message: "User not found" });
    }
     res.status(200).json({
       data: updateData,
       message: "Profile updated successfully",
     });
  } catch (error) {
    res
      .status(error.statuscode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// Deactivate Account
export const ownerProfileDeactivate = async (req,res)=>{
  try {
    //Get Id from Cookie
    const userid = req.user.id;
    //Get the user using id
    const user = await TheaterOwner.findById(userid);
    //check user Available
    if(!user){
       return res.status(404).json({ message: "User not found" });
    }
    // Deactivate user (set  isActive: false)
    user.isActive=false
    await user.save()
   
    res.status(200).json({
      message: "User account deactivated successfully",
      data: user.toObject(),
    });
  } catch (error) {
     res
       .status(error.statuscode || 500)
       .json({ message: error.message || "Internal Server Error" });
  }
}

// Change Password
export const ownerPasswordChange = async (req,res)=>{
    try {
        // Get details from the body
        const { oldPassword, newPassword } = req.body;
        //Find user by id
        const userId = req.user.id;
        const user = await TheaterOwner.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        // Check old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Old password is incorrect" });
        }
        //Hash new password
        user.password = await bcrypt.hash(newPassword, 10);      
        // Save user with updated password
        await user.save();
        res.status(200).json({ message: "Password changed successfully" });
      } catch (error) {
        res.status(500).json({ message: error.message || "Internal Server Error" });
      }
}

// Forgot Password
export const ownerForgotPassword = async (req, res) => {
  try {
    //Get email from frontend
    const { email } = req.body;
    //Check Owner found in DB
    const owner = await TheaterOwner.findOne({ email });
    if (!owner) {
      return res.status(404).json({ message: "Theater Owner not found" });
    }

    // Generate a new password (auto-reset)
    const newPassword = crypto.randomBytes(4).toString("hex"); // Example: "1a2b3c4d"

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    owner.password = await bcrypt.hash(newPassword, salt);

    await owner.save();

    // Send email with the new password
    const subject = "Password Reset Successful";
    const message = `Your new password is: ${newPassword}. Please login and change your password immediately.`;

    await sendEmail(owner.email, subject, message);

    res
      .status(200)
      .json({ message: "A new password has been sent to your email" });
  } catch (error) {
        res
          .status(500)
          .json({ message: error.message || "Internal Server Error" });
  }
}

// Get Movies
export const getMovie = async (req, res) => {
  try {
    //Get user Id from the Request
    const ownerId = req.user.id;
    // Find all movies where the theaterOwnerId matches
    const movies = await Movie.find({ createdBy:ownerId });
    // Check if movies exist
    if (!movies || movies.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No movies found for this theater owner",
      });
    }
    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
} 

// Get Shows
export const getShows = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find all shows created by this theater owner
    const shows = await Show.find({ createdBy: ownerId }).populate("movieId", "title duration genre");

    if (shows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shows found for this theater owner",
      });
    }

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Bookings
export const getBookings = async (req, res) => {
  try {
    // Ensure the user is a theater owner
    if (req.user.role !== "theaterOwner") {
      return res.status(403).json({
        success: false,
        message: "Access Denied! Only theater owners can view bookings.",
      });
    }

    // Find all shows created by this theater owner
    const shows = await Show.find({ theaterId: req.user._id });

    // Extract the IDs of the shows
    const showIds = shows.map((show) => show._id);

    // Find all bookings for the shows owned by the theater owner
    const bookings = await Booking.find({ showId: { $in: showIds } })
      .populate("userId", "name email") // Fetch user details
      .populate("showId", "movieId date timeSlots") // Fetch movie and show details
      .populate({
        path: "showId",
        populate: {
          path: "movieId",
          select: "title duration genre",
        },
      });

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully!",
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};