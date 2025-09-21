const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

// Load models
const User = require("./models/User");
const Event = require("./models/Event");
const Booking = require("./models/Booking");

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Read JSON files
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/data/users.json`, "utf-8")
);

const events = JSON.parse(
  fs.readFileSync(`${__dirname}/data/events.json`, "utf-8")
);

// Import into DB
const importData = async () => {
  try {
    await User.create(users);
    await Event.create(events);

    console.log("Data Imported...".green.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Event.deleteMany();
    await Booking.deleteMany();

    console.log("Data Destroyed...".red.inverse);
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
