const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    genre: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    seatsAvailable: {
      type: Number,
      required: true,
      default: 50,
    },
    poster: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 8.5,
    },
    price: {
      type: Number,
      default: 12,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Movie", movieSchema);
