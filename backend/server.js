const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Setup Socket.IO for live real-time chat between users
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Import models & routes
const Message = require("./models/Message");
const userRoutes = require("./routes/userRoutes");
const movieRoutes = require("./routes/movieRoutes");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const chatRoutes = require("./routes/chatRoutes");

// Security middleware
app.use(helmet());
app.use(cors());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: "Too many requests. Please try again later.",
    },
  })
);

// Parse JSON request bodies
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to CineBook API with Live Chat",
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// User routes
app.use("/api/users", userRoutes);

// Movie routes
app.use("/api/movies", movieRoutes);

// Booking routes
app.use("/api/bookings", bookingRoutes);

// Chat routes
app.use("/api/chat", chatRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  res.status(err.status || 500).json({
    message: err.status ? err.message : "Internal server error",
  });
});

// Socket.IO real-time event handling
io.on("connection", (socket) => {
  // Join a personal user room
  socket.on("join_user", (userId) => {
    if (userId) {
      socket.join(String(userId));
    }
  });

  // Handle direct message between two users
  socket.on("send_message", async (data, callback) => {
    try {
      const { senderId, senderName, receiverId, receiverName, text } = data;
      if (!senderId || !receiverId || !text || !text.trim()) return;

      // Save message to MongoDB
      const message = await Message.create({
        sender: senderId,
        senderName: senderName || "User",
        receiver: receiverId,
        receiverName: receiverName || "User",
        text: text.trim(),
      });

      // Deliver instantly to both receiver and sender rooms
      io.to(String(receiverId)).emit("new_message", message);
      io.to(String(senderId)).emit("new_message", message);

      if (typeof callback === "function") {
        callback({ success: true, message });
      }
    } catch (err) {
      console.error("Socket message error:", err.message);
      if (typeof callback === "function") {
        callback({ success: false, error: err.message });
      }
    }
  });

  // Typing indicators
  socket.on("typing", ({ senderId, senderName, receiverId }) => {
    if (receiverId) {
      io.to(String(receiverId)).emit("user_typing", { senderId, senderName });
    }
  });

  socket.on("stop_typing", ({ senderId, receiverId }) => {
    if (receiverId) {
      io.to(String(receiverId)).emit("user_stop_typing", { senderId });
    }
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    server.listen(PORT, () => {
      console.log(`CineBook server with Live Chat running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
