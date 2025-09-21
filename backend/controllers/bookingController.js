const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../utils/asyncHandler");
const Booking = require("../models/Booking");
const Event = require("../models/Event");
const stripe = require("../config/stripe");

// @desc    Create Stripe checkout session
// @route   POST /api/bookings/create-checkout-session
// @access  Private
exports.createCheckoutSession = asyncHandler(async (req, res, next) => {
  const { eventId, ticketQuantity, attendeeInfo } = req.body;

  // Get event
  const event = await Event.findById(eventId);
  if (!event) {
    return next(new ErrorResponse("Event not found", 404));
  }

  // Check if event is available for booking
  if (event.status !== "published") {
    return next(new ErrorResponse("Event is not available for booking", 400));
  }

  // Check if event date is in the future
  if (event.date <= new Date()) {
    return next(new ErrorResponse("Cannot book tickets for past events", 400));
  }

  // Check ticket availability
  if (event.availableTickets < ticketQuantity) {
    return next(
      new ErrorResponse(`Only ${event.availableTickets} tickets available`, 400)
    );
  }

  // Validate ticket quantity
  if (ticketQuantity < 1 || ticketQuantity > 10) {
    return next(
      new ErrorResponse("Ticket quantity must be between 1 and 10", 400)
    );
  }

  // Calculate total amount (derived by Stripe line item, kept for reference)
  // const totalAmount = event.price * ticketQuantity;

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: event.title,
              description: `${event.description.substring(0, 100)}...`,
              images: event.image
                ? [`${process.env.CLIENT_URL}/images/${event.image}`]
                : [],
            },
            unit_amount: Math.round(event.price * 100), // Convert to cents
          },
          quantity: ticketQuantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/events/${eventId}`,
      metadata: {
        eventId: eventId,
        userId: req.user.id,
        ticketQuantity: ticketQuantity.toString(),
        attendeeName: attendeeInfo.name,
        attendeeEmail: attendeeInfo.email,
        attendeePhone: attendeeInfo.phone || "",
      },
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        sessionUrl: session.url,
      },
    });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    return next(new ErrorResponse("Payment session creation failed", 500));
  }
});

// @desc    Handle successful payment
// @route   POST /api/bookings/confirm-payment
// @access  Private
exports.confirmPayment = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.body;

  console.log("💳 Confirming payment for session:", sessionId);

  if (!sessionId) {
    return next(new ErrorResponse("Session ID is required", 400));
  }

  try {
    // Retrieve the session from Stripe
    console.log("🔍 Retrieving Stripe session...");
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("📋 Session retrieved:", {
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      metadata: session.metadata,
    });

    if (session.payment_status !== "paid") {
      console.log("❌ Payment not completed, status:", session.payment_status);
      return next(new ErrorResponse("Payment not completed", 400));
    }

    // Check if booking already exists
    console.log("🔍 Checking for existing booking...");
    const existingBooking = await Booking.findOne({
      stripeSessionId: sessionId,
    });
    if (existingBooking) {
      console.log("✅ Booking already exists, returning existing booking");
      return res.status(200).json({
        success: true,
        data: existingBooking,
      });
    }

    // Extract metadata
    console.log("📋 Extracting session metadata...");
    const {
      eventId,
      userId,
      ticketQuantity,
      attendeeName,
      attendeeEmail,
      attendeePhone,
    } = session.metadata;

    // Get event and check availability again
    console.log("🎫 Finding event with ID:", eventId);
    const event = await Event.findById(eventId);
    if (!event) {
      console.log("❌ Event not found with ID:", eventId);
      return next(new ErrorResponse("Event not found", 404));
    }

    console.log("✅ Event found:", event.title);
    if (event.availableTickets < parseInt(ticketQuantity)) {
      console.log("❌ Not enough tickets available");
      return next(new ErrorResponse("Tickets no longer available", 400));
    }

    // Create booking
    console.log("💾 Creating booking in database...");

    // Generate unique booking reference
    const bookingReference = `BK${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;
    console.log("🎫 Generated booking reference:", bookingReference);

    const booking = await Booking.create({
      user: userId,
      event: eventId,
      ticketQuantity: parseInt(ticketQuantity),
      totalAmount: session.amount_total / 100, // Convert from cents
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      bookingReference: bookingReference,
      stripeSessionId: sessionId,
      stripePaymentIntentId: session.payment_intent,
      attendeeInfo: {
        name: attendeeName,
        email: attendeeEmail,
        phone: attendeePhone,
      },
    });

    console.log("✅ Booking created with ID:", booking._id);

    // Update event available tickets
    console.log("🎫 Updating event ticket availability...");
    event.availableTickets -= parseInt(ticketQuantity);
    await event.save();
    console.log("✅ Event tickets updated, remaining:", event.availableTickets);

    // Populate booking data
    const populatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email")
      .populate("event", "title date venue price");

    res.status(201).json({
      success: true,
      data: populatedBooking,
    });
  } catch (error) {
    console.error("Payment confirmation error:", error);

    // More specific error handling for different scenarios
    if (error.code === "resource_missing") {
      return next(
        new ErrorResponse(
          "Invalid session ID - session not found in Stripe",
          404
        )
      );
    } else if (error.type === "StripeInvalidRequestError") {
      return next(new ErrorResponse("Invalid Stripe session ID format", 400));
    } else if (
      error.message &&
      error.message.includes("No such checkout session")
    ) {
      return next(
        new ErrorResponse("Checkout session expired or invalid", 400)
      );
    }

    // Development fallback for test mode - remove in production
    if (
      process.env.NODE_ENV === "development" &&
      sessionId.startsWith("cs_test_")
    ) {
      console.log(
        "🧪 Development mode: Creating fallback booking for test session"
      );

      try {
        // Try to get the first available event for testing
        const events = await Event.find().limit(1);
        const testEvent = events[0];

        if (!testEvent) {
          return next(
            new ErrorResponse("No events available for test booking", 404)
          );
        }

        // Create a basic booking for testing
        const fallbackBookingReference = `BK${Date.now()}${Math.random()
          .toString(36)
          .substr(2, 6)
          .toUpperCase()}`;
        console.log(
          "🎫 Generated fallback booking reference:",
          fallbackBookingReference
        );

        const fallbackBooking = await Booking.create({
          user: req.user.id,
          event: testEvent._id,
          ticketQuantity: 1,
          totalAmount: testEvent.price,
          paymentStatus: "paid",
          bookingStatus: "confirmed",
          bookingReference: fallbackBookingReference,
          stripeSessionId: sessionId,
          attendeeInfo: {
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone || "123-456-7890",
          },
        });

        // Update event available tickets
        if (testEvent.availableTickets > 0) {
          testEvent.availableTickets -= 1;
          await testEvent.save();
        }

        const populatedBooking = await Booking.findById(fallbackBooking._id)
          .populate("user", "name email")
          .populate("event", "title date venue price");

        console.log("✅ Development fallback booking created successfully");
        return res.status(201).json({
          success: true,
          data: populatedBooking,
        });
      } catch (fallbackError) {
        console.error("❌ Fallback booking creation failed:", fallbackError);
      }
    }

    return next(
      new ErrorResponse("Payment confirmation failed - " + error.message, 500)
    );
  }
});

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = asyncHandler(async (req, res, _next) => {
  const bookings = await Booking.find({ user: req.user.id })
    .populate("event", "title date venue price category image")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("event", "title date venue price category");

  if (!booking) {
    return next(new ErrorResponse("Booking not found", 404));
  }

  // Make sure user owns booking or is admin
  if (
    booking.user._id.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse("Not authorized to access this booking", 401)
    );
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new ErrorResponse("Booking not found", 404));
  }

  // Make sure user owns booking
  if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse("Not authorized to cancel this booking", 401)
    );
  }

  // Check if booking can be cancelled
  if (booking.bookingStatus === "cancelled") {
    return next(new ErrorResponse("Booking is already cancelled", 400));
  }

  if (booking.paymentStatus !== "paid") {
    return next(new ErrorResponse("Cannot cancel unpaid booking", 400));
  }

  // Get event to check cancellation policy (24 hours before event)
  const event = await Event.findById(booking.event);
  const eventDate = new Date(event.date);
  const now = new Date();
  const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60);

  if (hoursUntilEvent < 24) {
    return next(
      new ErrorResponse(
        "Cannot cancel booking less than 24 hours before event",
        400
      )
    );
  }

  try {
    // Process refund through Stripe
    if (booking.stripePaymentIntentId) {
      const refund = await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
        reason: "requested_by_customer",
      });

      booking.refundAmount = refund.amount / 100; // Convert from cents
      booking.paymentStatus = "refunded";
    }

    // Update booking status
    booking.bookingStatus = "cancelled";
    booking.refundReason = req.body.reason || "Cancelled by user";
    await booking.save();

    // Return tickets to event availability
    event.availableTickets += booking.ticketQuantity;
    await event.save();

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Booking cancellation error:", error);
    return next(new ErrorResponse("Booking cancellation failed", 500));
  }
});

// @desc    Get event attendees (Admin only)
// @route   GET /api/bookings/event/:eventId/attendees
// @access  Private (Admin)
exports.getEventAttendees = asyncHandler(async (req, res, _next) => {
  const bookings = await Booking.find({
    event: req.params.eventId,
    paymentStatus: "paid",
    bookingStatus: { $in: ["confirmed", "attended"] },
  })
    .populate("user", "name email phone")
    .sort("createdAt");

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Check-in attendee
// @route   PUT /api/bookings/:id/checkin
// @access  Private (Admin)
exports.checkInAttendee = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new ErrorResponse("Booking not found", 404));
  }

  if (booking.paymentStatus !== "paid") {
    return next(new ErrorResponse("Cannot check-in unpaid booking", 400));
  }

  if (booking.bookingStatus === "cancelled") {
    return next(new ErrorResponse("Cannot check-in cancelled booking", 400));
  }

  if (booking.checkedIn) {
    return next(new ErrorResponse("Attendee already checked in", 400));
  }

  booking.checkedIn = true;
  booking.checkedInAt = new Date();
  booking.bookingStatus = "attended";
  await booking.save();

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// @desc    Webhook handler for Stripe events
// @route   POST /api/bookings/webhook
// @access  Public (Stripe webhook)
exports.stripeWebhook = asyncHandler(async (req, res, _next) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("Payment succeeded:", session.id);
      // Handle successful payment (booking should already be created in confirmPayment)
      break;
    }
    case "payment_intent.payment_failed": {
      console.log("Payment failed:", event.data.object.id);
      // Handle failed payment
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});
