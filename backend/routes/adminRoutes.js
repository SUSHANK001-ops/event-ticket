const express = require("express");
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const {
  getEventAttendees,
  checkInAttendee,
} = require("../controllers/bookingController");

const { protect, authorize } = require("../middlewares/auth");
const User = require("../models/User");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalEvents = await Event.countDocuments();
  const totalBookings = await Booking.countDocuments({ paymentStatus: "paid" });
  const totalRevenue = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
  ]);

  // Recent bookings
  const recentBookings = await Booking.find({ paymentStatus: "paid" })
    .populate("user", "name email")
    .populate("event", "title date")
    .sort("-createdAt")
    .limit(5);

  // Popular events
  const popularEvents = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    {
      $group: {
        _id: "$event",
        totalBookings: { $sum: 1 },
        totalTickets: { $sum: "$ticketQuantity" },
      },
    },
    { $sort: { totalTickets: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "events",
        localField: "_id",
        foreignField: "_id",
        as: "eventDetails",
      },
    },
    { $unwind: "$eventDetails" },
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentBookings,
      popularEvents,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-password").sort("-createdAt");

  res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAllBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find()
    .populate("user", "name email")
    .populate("event", "title date venue")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true, runValidators: true }
  ).select("-password");

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Dashboard and analytics routes
router.get("/dashboard", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/bookings", getAllBookings);
router.put("/users/:id/status", updateUserStatus);

// Event management routes
router.get("/events", getEvents);
router.post("/events", createEvent);
router.get("/events/:id", getEvent);
router.put("/events/:id", updateEvent);
router.delete("/events/:id", deleteEvent);

// Booking management routes
router.get("/events/:eventId/attendees", getEventAttendees);
router.put("/bookings/:id/checkin", checkInAttendee);

module.exports = router;
