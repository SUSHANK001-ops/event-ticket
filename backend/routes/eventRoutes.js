const express = require("express");
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByCategory,
  getUpcomingEvents,
  searchEvents,
} = require("../controllers/eventController");

const { protect, authorize } = require("../middlewares/auth");

const router = express.Router();

// Public routes
router.get("/", getEvents);
router.get("/upcoming", getUpcomingEvents);
router.get("/search", searchEvents);
router.get("/category/:category", getEventsByCategory);
router.get("/:id", getEvent);

// Protected routes (Admin only)
router.post("/", protect, authorize("admin"), createEvent);
router.put("/:id", protect, authorize("admin"), updateEvent);
router.delete("/:id", protect, authorize("admin"), deleteEvent);

module.exports = router;
