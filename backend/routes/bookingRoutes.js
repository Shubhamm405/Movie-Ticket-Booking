const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Booking = require("../models/Booking");

// Helper to extract user from optional Bearer token
function getAuthUser(req) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token && process.env.JWT_SECRET) {
        return jwt.verify(token, process.env.JWT_SECRET);
      }
    }
  } catch (err) {
    // Token invalid/expired - continue as unauthenticated
  }
  return null;
}

// Create a booking
router.post("/", async (req, res) => {
  try {
    const {
      movie,
      date,
      time,
      seats,
      userId,
      userEmail,
      userName,
      selectedSeats,
      totalPrice,
    } = req.body;

    const seatCount = Number(seats);

    if (!movie || !date || !time || !Number.isInteger(seatCount) || seatCount < 1 || seatCount > 10) {
      return res.status(400).json({
        message: "Valid movie, date, time, and seats (1-10) are required.",
      });
    }

    const authUser = getAuthUser(req);
    const finalUserId = userId || (authUser ? authUser.id : null);
    const finalUserEmail = userEmail || (authUser ? authUser.email : null);
    const finalUserName = userName || (authUser ? authUser.name : "CineBook User");

    const booking = await Booking.create({
      movie,
      date,
      time,
      seats: seatCount,
      userId: finalUserId,
      userEmail: finalUserEmail,
      userName: finalUserName,
      selectedSeats: Array.isArray(selectedSeats) ? selectedSeats : [],
      totalPrice: Number(totalPrice) || seatCount * 250,
    });

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking creation failed:", error.message);
    return res.status(500).json({
      message: "Could not create booking",
      error: error.message,
    });
  }
});

// Get occupied seats for a movie show
router.get("/occupied", async (req, res) => {
  try {
    const { movie, date, time } = req.query;

    if (!movie || !date || !time) {
      return res.status(400).json({
        message: "Movie, date, and time are required to check occupied seats.",
      });
    }

    const bookings = await Booking.find({ movie, date, time });
    const occupiedSeats = bookings.flatMap((b) => b.selectedSeats || []);

    return res.status(200).json({
      movie,
      date,
      time,
      occupiedSeats,
    });
  } catch (error) {
    console.error("Fetching occupied seats failed:", error.message);
    return res.status(500).json({
      message: "Could not fetch occupied seats",
    });
  }
});

// Get bookings (optionally filtered by user email or userId)
router.get("/", async (req, res) => {
  try {
    const { email, userId } = req.query;
    const filter = {};

    if (userId) {
      filter.userId = userId;
    } else if (email) {
      filter.userEmail = email.toLowerCase();
    }

    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(bookings);
  } catch (error) {
    console.error("Fetching bookings failed:", error.message);
    return res.status(500).json({
      message: "Could not fetch bookings",
    });
  }
});

// Cancel / Delete a booking
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking cancellation failed:", error.message);
    return res.status(500).json({
      message: "Could not cancel booking",
    });
  }
});

module.exports = router;
