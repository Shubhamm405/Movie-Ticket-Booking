const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    movie: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    selectedSeats: {
      type: [String],
      default: [],
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
