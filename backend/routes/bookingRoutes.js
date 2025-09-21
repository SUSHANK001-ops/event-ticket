const express = require("express");
const {
  createCheckoutSession,
  confirmPayment,
  getMyBookings,
  getBooking,
  cancelBooking,
  getEventAttendees,
  checkInAttendee,
  stripeWebhook,
} = require("../controllers/bookingController");

const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

// Stripe webhook (must be before express.json() middleware)
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// Protected routes
router.post("/create-checkout-session", protect, createCheckoutSession);
router.post("/confirm-payment", protect, confirmPayment);
router.get("/my-bookings", protect, getMyBookings);
router.get("/:id", protect, getBooking);
router.put("/:id/cancel", protect, cancelBooking);

// Admin routes
router.get(
  "/event/:eventId/attendees",
  protect,
  authorize("admin"),
  getEventAttendees
);
router.put("/:id/checkin", protect, authorize("admin"), checkInAttendee);

module.exports = router;
