const express = require("express");
const {
  createUser,
  loginUser,
  logOutCurrentUser,
  getAllUsers,
  getCurrentUser,
  updateCurrentProfile,
  deleteUserById,
  getUserById,
  updateUserRoleByAdmin,
} = require("../controllers/userControllers.js");
const {
  authenticate,
  authorizedAdmin,
  authorizedSeller,
  authorizedBuyer,
} = require("../middlewares/authMiddlewares.js");

const router = express.Router();

// Create user or get all users (Admin only)
router
  .route("/")
  .post(createUser)
  .get(authenticate, authorizedAdmin, getAllUsers);

// User authentication routes
router.route("/auth").post(loginUser);
router.route("/logout").post(logOutCurrentUser);

// Profile routes
router
  .route("/profile")
  .get(authenticate, getCurrentUser)
  .put(authenticate, updateCurrentProfile);

// Admin routes (Role management, delete users)
router
  .route("/:id")
  .delete(authenticate, authorizedAdmin, deleteUserById)
  .get(authenticate, authorizedAdmin, getUserById)
  .put(authenticate, authorizedAdmin, updateUserRoleByAdmin);

module.exports = router;
