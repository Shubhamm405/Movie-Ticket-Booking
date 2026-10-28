const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Message = require("../models/Message");
const jwt = require("jsonwebtoken");

// Helper to get authenticated user from Bearer token
function getAuthUserId(req) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token && process.env.JWT_SECRET) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
      }
    }
  } catch (err) {
    // Invalid/expired token
  }
  return null;
}

// 1. Get list of all users available for chat
router.get("/users", async (req, res) => {
  try {
    const currentUserId = getAuthUserId(req) || req.query.currentUserId;

    const query = currentUserId ? { _id: { $ne: currentUserId } } : {};
    const users = await User.find(query).select("_id name email role createdAt");

    return res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching chat users:", error.message);
    return res.status(500).json({ message: "Could not fetch users for chat" });
  }
});

// 2. Get chat history between current user and another user
router.get("/messages/:otherUserId", async (req, res) => {
  try {
    const currentUserId = getAuthUserId(req) || req.query.userId;
    const { otherUserId } = req.params;

    if (!currentUserId || !otherUserId) {
      return res.status(400).json({ message: "Both user IDs are required to load chat." });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    return res.status(500).json({ message: "Could not fetch message history" });
  }
});

// 3. Send message via HTTP fallback
router.post("/messages", async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    const { senderId, senderName, receiverId, receiverName, text } = req.body;

    const finalSenderId = authUserId || senderId;

    if (!finalSenderId || !receiverId || !text || !text.trim()) {
      return res.status(400).json({ message: "Sender, receiver, and text are required." });
    }

    const newMessage = await Message.create({
      sender: finalSenderId,
      senderName: senderName || "User",
      receiver: receiverId,
      receiverName: receiverName || "User",
      text: text.trim(),
    });

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error.message);
    return res.status(500).json({ message: "Failed to send message" });
  }
});

module.exports = router;
