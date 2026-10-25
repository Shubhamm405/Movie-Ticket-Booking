const express = require("express");
const { body, validationResult } = require("express-validator");

const {
  registerUser,
  loginUser,
  getProfile
} = require("../controllers/userController");

const {
  protect,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

// Register with input validation
router.post(
  "/register",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required"),

    body("email")
      .isEmail()
      .withMessage("Please provide a valid email"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long")
  ],
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array()
      });
    }

    next();
  },
  registerUser
);

// Login
router.post("/login", loginUser);

// Protected profile
router.get("/profile", protect, getProfile);

// Admin-only route
router.get(
  "/admin",
  protect,
  authorize("admin"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Admin",
      user: req.user
    });
  }
);

module.exports = router;