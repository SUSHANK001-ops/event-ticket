const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const colors = require("colors");

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require("./config/db");
connectDB();

const app = express();

// Import routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Import middleware
const errorHandler = require("./middlewares/error");

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

app.use("/api/", limiter);

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production" ? [process.env.CLIENT_URL] : true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());

// Set static folder for file uploads
app.use(express.static(path.join(__dirname, "public")));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`.cyan);
    next();
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Event Ticket API Server",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      events: "/api/events",
      bookings: "/api/bookings",
      admin: "/api/admin",
      health: "/health",
    },
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// Handle 404 errors
app.all("*", (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`.red);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

module.exports = app;
