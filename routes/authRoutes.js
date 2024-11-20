const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

// Login
router.route("/login").post(userController.loginUser);

// Register
router.route("/register").post(userController.registerUser);

// Logout
router.route("/logout").get(userController.logoutUser);

// Get Profile
router.route("/profile").get(verifyToken, userController.getUserProfile);

// Update Profile
router.route("/profile").patch(verifyToken, userController.updateUser);

// Delete a User (Admin Only)
router
  .route("/users/:id")
  .delete(verifyToken, verifyAdmin, userController.deleteUser);

// Get All Users (Admin Only)
router
  .route("/users")
  .get(verifyToken, verifyAdmin, userController.getAllUsers);

module.exports = router;

// registerUser,
//   loginUser,
//   logoutUser,
//   updateUser,
//   deleteUser,
//   getAllUsers,
//   getUserProfile,
