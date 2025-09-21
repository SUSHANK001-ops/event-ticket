const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Booking must belong to a user"],
    },
    event: {
      type: mongoose.Schema.ObjectId,
      ref: "Event",
      required: [true, "Booking must be for an event"],
    },
    ticketQuantity: {
      type: Number,
      required: [true, "Please specify number of tickets"],
      min: [1, "Ticket quantity must be at least 1"],
      max: [10, "Cannot book more than 10 tickets at once"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Please add total amount"],
      min: [0, "Total amount cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "cash"],
      default: "stripe",
    },
    stripePaymentIntentId: {
      type: String,
      sparse: true,
    },
    stripeSessionId: {
      type: String,
      sparse: true,
    },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "cancelled", "attended", "no-show"],
      default: "confirmed",
    },
    bookingReference: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `BK${timestamp}${random}`.toUpperCase();
      },
    },
    attendeeInfo: {
      name: {
        type: String,
        required: [true, "Please provide attendee name"],
      },
      email: {
        type: String,
        required: [true, "Please provide attendee email"],
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          "Please add a valid email",
        ],
      },
      phone: {
        type: String,
        match: [/^\+?[1-9]\d{1,14}$/, "Please add a valid phone number"],
      },
    },
    specialRequests: {
      type: String,
      maxlength: [200, "Special requests cannot be more than 200 characters"],
    },
    qrCode: {
      type: String, // Will store QR code data for ticket verification
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    checkedInAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
      maxlength: [300, "Refund reason cannot be more than 300 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for calculating per ticket price
bookingSchema.virtual("pricePerTicket").get(function () {
  return this.totalAmount / this.ticketQuantity;
});

// Virtual for checking if booking is active
bookingSchema.virtual("isActive").get(function () {
  return this.bookingStatus === "confirmed" && this.paymentStatus === "paid";
});

// Ensure booking reference exists before validation (in case default isn't applied)
bookingSchema.pre("validate", function (next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.bookingReference = `BK${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Index for better query performance
bookingSchema.index({ user: 1, event: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ paymentStatus: 1, bookingStatus: 1 });
bookingSchema.index({ createdAt: -1 });

// Populate user and event data when querying
bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email phone",
  }).populate({
    path: "event",
    select: "title date venue price category",
  });
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
