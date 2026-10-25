const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    genre: {
      type: String,
      required: true
    },

    duration: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    seatsAvailable: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Movie", movieSchema);