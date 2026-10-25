
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// Create a booking
router.post("/", async (req, res) => {
  try {
    const { movie, date, time, seats } = req.body;

    if (!movie || !date || !time || !Number.isInteger(seats) || seats < 1 || seats > 10) {
      return res.status(400).json({
        message: "Valid movie, date, time, and seats (1-10) are required.",
      });
    }

    const booking = await Booking.create({
      movie,
      date,
      time,
      seats,
    });

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking creation failed:", error.message);
    return res.status(500).json({
      message: "Could not create booking",
    });
  }
});

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Fetching bookings failed:", error.message);
    return res.status(500).json({
      message: "Could not fetch bookings",
    });
  }
});

module.exports = router;
