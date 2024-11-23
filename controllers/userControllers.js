const asyncHandler = require("../middlewares/asyncHandler");
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const createToken = require("../utils/createToken");

// Create or sign up user
const createUser = asyncHandler(async (req, res, next) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please fill all inputs");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).send("This email already exists");
    return;
  }

  const salt = await bcrypt.genSalt(11);
  const securePassword = await bcrypt.hash(password, salt);

  // Only allow admin to assign a role other than "buyer"
  const userRole = req.user && req.user.role === "admin" ? role : "buyer";

  const newUser = new User({
    username,
    email,
    password: securePassword,
    role: userRole,
  });

  try {
    await newUser.save();
    createToken(res, newUser._id);
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err) {
    console.error("Error saving user:", err.message);
    res.status(400).json({ message: "Invalid data", error: err.message });
  }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    res.status(401).send("Invalid email or password");
    return;
  }

  const isPassword = await bcrypt.compare(password, existingUser.password);
  if (!isPassword) {
    res.status(401).send("Invalid email or password");
    return;
  }

  createToken(res, existingUser._id);
  res.status(200).json({
    _id: existingUser._id,
    username: existingUser.username,
    email: existingUser.email,
    role: existingUser.role,
  });
});

// Log out current user
const logOutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logout successfully" });
});

// Get all users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// Get current user profile
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Update current user's profile
const updateCurrentProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(11);
      const securePassword = await bcrypt.hash(req.body.password, salt);
      user.password = securePassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Delete user by admin
const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === "admin") {
      res.status(400);
      throw new Error("Cannot delete admin user");
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Get user by ID
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// Update user by admin (including role management)
const updateUserRoleByAdmin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.role === "admin") {
      res.status(400);
      throw new Error("Cannot modify admin role");
    }

    const { role } = req.body;
    if (role && ["buyer", "seller", "admin"].includes(role)) {
      user.role = role;
    } else {
      res.status(400);
      throw new Error("Invalid role");
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  createUser,
  loginUser,
  logOutCurrentUser,
  getAllUsers,
  getCurrentUser,
  updateCurrentProfile,
  deleteUserById,
  getUserById,
  updateUserRoleByAdmin,
};
