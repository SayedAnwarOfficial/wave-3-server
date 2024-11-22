const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");
const User = require("../models/userSchema");
const {
  registerUser,
  loginUser,
  logoutUser,
  getProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
  promoteToSeller,
} = require("../controllers/userControllers");

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected Routes
router.post("/logout", logoutUser);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

// Admin Routes
router.get("/users", verifyToken, verifyAdmin(User), getAllUsers);
router.delete("/user/:userId", verifyToken, verifyAdmin(User), deleteUser); // Delete user by admin
router.put(
  "/users/:id/promote",
  verifyToken,
  verifyAdmin(User),
  promoteToSeller
); // Promote user to seller by admin

module.exports = router;
