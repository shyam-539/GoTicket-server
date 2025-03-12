import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from "../models/User.js";
import Theater from "../models/Theater.js";
import Movie from "../models/Movie.js";
import Booking from "../models/Booking.js";
import { ApiError } from "../utils/errorHandler.js";
import { asyncHandler } from "../utils/errorHandler.js";

/**
 * Admin Login
 * @route POST /api/admin/login
 * @access Public
 */
export const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // Find the user by email (admin)
    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "Admin user not found");
    }

    // Check if the user is an admin
    if (user.role !== 'admin') {
        throw new ApiError(403, "Access denied. Only admins are allowed");
    }

    // Check if the password matches
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Set token expiration
    );

    // Send the token as response
    res.status(200).json({
        success: true,
        message: "Admin logged in successfully",
        token,
    });
});

/**
 * Get dashboard statistics for admin
 * @route GET /api/admin/dashboard
 * @access Private (Admin only)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments();
    const theaterCount = await Theater.countDocuments();
    const movieCount = await Movie.countDocuments();
    const bookingCount = await Booking.countDocuments();

    // Get pending approvals
    const pendingTheaters = await Theater.countDocuments({ status: "pending" });
    const pendingMovies = await Movie.countDocuments({ status: "pending" });

    // Active users by role
    const usersByRole = await User.aggregate([
        { $match: { accountStatus: "active" } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
        success: true,
        data: {
            counts: { users: userCount, theaters: theaterCount, movies: movieCount, bookings: bookingCount },
            pendingApprovals: { theaters: pendingTheaters, movies: pendingMovies },
            usersByRole: usersByRole.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
        },
    });
});

/**
 * Get all users
 * @route GET /api/admin/users
 * @access Private (Admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users });
});

/**
 * Update user status
 * @route PATCH /api/admin/users/:userId/status
 * @access Private (Admin only)
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "suspended"].includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    user.accountStatus = status;
    await user.save();

    res.status(200).json({ success: true, message: `User status updated to ${status}`, data: user });
});

/**
 * Update user role
 * @route PATCH /api/admin/users/:userId/role
 * @access Private (Admin only)
 */
export const updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "theater-owner", "admin"].includes(role)) {
        throw new ApiError(400, "Invalid role value");
    }

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, message: `User role updated to ${role}`, data: user });
});

/**
 * Get all theaters
 * @route GET /api/admin/theaters
 * @access Private (Admin only)
 */
export const getAllTheaters = asyncHandler(async (req, res) => {
    const theaters = await Theater.find();
    res.status(200).json({ success: true, theaters });
});

/**
 * Update theater status
 * @route PATCH /api/admin/theaters/:theaterId/status
 * @access Private (Admin only)
 */
export const updateTheaterStatus = asyncHandler(async (req, res) => {
    const { theaterId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    const theater = await Theater.findById(theaterId);
    if (!theater) throw new ApiError(404, "Theater not found");

    theater.status = status;
    await theater.save();

    res.status(200).json({
        success: true,
        message: `Theater status updated to ${status}`,
        data: theater
    });
});

/**
 * Get all movies
 * @route GET /api/admin/movies
 * @access Private (Admin only)
 */
export const getAllMovies = asyncHandler(async (req, res) => {
    const movies = await Movie.find();
    res.status(200).json({ success: true, movies });
});

/**
 * Update movie status
 * @route PATCH /api/admin/movies/:movieId/status
 * @access Private (Admin only)
 */
export const updateMovieStatus = asyncHandler(async (req, res) => {
    const { movieId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    const movie = await Movie.findById(movieId);
    if (!movie) throw new ApiError(404, "Movie not found");

    movie.status = status;
    await movie.save();

    res.status(200).json({ success: true, message: `Movie status updated to ${status}`, data: movie });
});

/**
 * Get revenue reports
 * @route GET /api/admin/revenue
 * @access Private (Admin only)
 */
export const getRevenueReports = asyncHandler(async (req, res) => {
    const { startDate, endDate, theaterId } = req.query;

    // Filter bookings by date range
    const dateFilter = {};
    if (startDate) dateFilter.createdAt = { $gte: new Date(startDate) };
    if (endDate) dateFilter.createdAt = { ...dateFilter.createdAt, $lte: new Date(endDate) };

    if (theaterId) dateFilter.theater = theaterId;

    // Calculate total revenue
    const totalRevenue = await Booking.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    // Group revenue by theater
    const revenueByTheater = await Booking.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$theater", total: { $sum: "$totalPrice" } } },
        { $lookup: { from: "theaters", localField: "_id", foreignField: "_id", as: "theaterInfo" } },
        { $unwind: "$theaterInfo" },
        { $project: { theater: "$theaterInfo.name", total: 1 } },
    ]);

    // Revenue by date
    const revenueByDate = await Booking.aggregate([
        { $match: dateFilter },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$totalPrice" } } },
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
            revenueByTheater,
            revenueByDate,
        },
    });
});

/**
 * Export all admin controller functions
 */
export {
    // getDashboardStats,
    // getAllUsers,
    // updateUserStatus,
    // updateUserRole,
    // getAllTheaters,
    // updateTheaterStatus,
    // getAllMovies,
    // updateMovieStatus,
    // getRevenueReports,
};
