const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add an event title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      enum: [
        "Conference",
        "Workshop",
        "Seminar",
        "Concert",
        "Sports",
        "Festival",
        "Exhibition",
        "Networking",
        "Training",
        "Other",
      ],
    },
    date: {
      type: Date,
      required: [true, "Please add an event date"],
    },
    startTime: {
      type: String,
      required: [true, "Please add start time"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please add a valid time format (HH:MM)",
      ],
    },
    endTime: {
      type: String,
      required: [true, "Please add end time"],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Please add a valid time format (HH:MM)",
      ],
    },
    venue: {
      name: {
        type: String,
        required: [true, "Please add venue name"],
      },
      address: {
        type: String,
        required: [true, "Please add venue address"],
      },
      city: {
        type: String,
        required: [true, "Please add city"],
      },
      state: {
        type: String,
        required: [true, "Please add state"],
      },
      zipCode: {
        type: String,
        required: [true, "Please add zip code"],
      },
      capacity: {
        type: Number,
        required: [true, "Please add venue capacity"],
        min: [1, "Capacity must be at least 1"],
      },
    },
    price: {
      type: Number,
      required: [true, "Please add ticket price"],
      min: [0, "Price cannot be negative"],
    },
    availableTickets: {
      type: Number,
      required: [true, "Please add number of available tickets"],
      min: [0, "Available tickets cannot be negative"],
    },
    totalTickets: {
      type: Number,
      required: [true, "Please add total number of tickets"],
      min: [1, "Total tickets must be at least 1"],
    },
    image: {
      type: String,
      default: "default-event.jpg",
    },
    organizer: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "cancelled", "completed"],
      default: "published",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    requirements: {
      type: String,
      maxlength: [500, "Requirements cannot be more than 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
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

// Virtual for sold tickets
eventSchema.virtual("soldTickets").get(function () {
  return this.totalTickets - this.availableTickets;
});

// Virtual for checking if event is sold out
eventSchema.virtual("isSoldOut").get(function () {
  return this.availableTickets === 0;
});

// Virtual for checking if event is upcoming
eventSchema.virtual("isUpcoming").get(function () {
  return this.date > new Date();
});

// Index for better query performance
eventSchema.index({ date: 1, category: 1, status: 1 });
eventSchema.index({ "venue.city": 1, "venue.state": 1 });

// Pre-save middleware to set totalTickets equal to availableTickets if not provided
eventSchema.pre("save", function (next) {
  if (this.isNew && !this.totalTickets) {
    this.totalTickets = this.availableTickets;
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);
