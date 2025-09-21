const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");
const Event = require("../models/Event");

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  query = Event.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Event.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Populate organizer
  query = query.populate({
    path: "organizer",
    select: "name email",
  });

  // Executing query
  const events = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: events.length,
    pagination,
    data: events,
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id).populate({
    path: "organizer",
    select: "name email phone",
  });

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: event,
  });
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin only)
exports.createEvent = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.organizer = req.user.id;

  // Check if event date is in the future
  if (new Date(req.body.date) <= new Date()) {
    return next(new ErrorResponse("Event date must be in the future", 400));
  }

  // Validate time format and logic
  if (req.body.startTime >= req.body.endTime) {
    return next(new ErrorResponse("End time must be after start time", 400));
  }

  const event = await Event.create(req.body);

  res.status(201).json({
    success: true,
    data: event,
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin only)
exports.updateEvent = asyncHandler(async (req, res, next) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is event organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this event`,
        401
      )
    );
  }

  // Check if event date is in the future (if being updated)
  if (req.body.date && new Date(req.body.date) <= new Date()) {
    return next(new ErrorResponse("Event date must be in the future", 400));
  }

  // Validate time format and logic (if being updated)
  if (req.body.startTime || req.body.endTime) {
    const startTime = req.body.startTime || event.startTime;
    const endTime = req.body.endTime || event.endTime;

    if (startTime >= endTime) {
      return next(new ErrorResponse("End time must be after start time", 400));
    }
  }

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: event,
  });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin only)
exports.deleteEvent = asyncHandler(async (req, res, next) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return next(
      new ErrorResponse(`Event not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is event organizer or admin
  if (event.organizer.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this event`,
        401
      )
    );
  }

  // Check if event has bookings
  const Booking = require("../models/Booking");
  const bookings = await Booking.find({
    event: req.params.id,
    paymentStatus: "paid",
  });

  if (bookings.length > 0) {
    return next(
      new ErrorResponse("Cannot delete event with confirmed bookings", 400)
    );
  }

  await event.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get events by category
// @route   GET /api/events/category/:category
// @access  Public
exports.getEventsByCategory = asyncHandler(async (req, res, next) => {
  const events = await Event.find({
    category: req.params.category,
    status: "published",
    date: { $gte: new Date() },
  })
    .populate({
      path: "organizer",
      select: "name email",
    })
    .sort("date");

  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

// @desc    Get upcoming events
// @route   GET /api/events/upcoming
// @access  Public
exports.getUpcomingEvents = asyncHandler(async (req, res, next) => {
  const events = await Event.find({
    status: "published",
    date: { $gte: new Date() },
  })
    .populate({
      path: "organizer",
      select: "name email",
    })
    .sort("date")
    .limit(10);

  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});

// @desc    Search events
// @route   GET /api/events/search
// @access  Public
exports.searchEvents = asyncHandler(async (req, res, next) => {
  const { q, city, category, minPrice, maxPrice, date } = req.query;

  let query = {
    status: "published",
  };

  // Text search
  if (q) {
    query.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $in: [new RegExp(q, "i")] } },
    ];
  }

  // Location filter
  if (city) {
    query["venue.city"] = { $regex: city, $options: "i" };
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }

  // Date filter
  if (date) {
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(searchDate.getDate() + 1);

    query.date = {
      $gte: searchDate,
      $lt: nextDay,
    };
  }

  const events = await Event.find(query)
    .populate({
      path: "organizer",
      select: "name email",
    })
    .sort("date");

  res.status(200).json({
    success: true,
    count: events.length,
    data: events,
  });
});
