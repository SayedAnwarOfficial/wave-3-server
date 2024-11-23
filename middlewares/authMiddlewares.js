const jwt = require("jsonwebtoken");
const User = require("../models/userSchema.js");
const asyncHandler = require("./asyncHandler.js");

// Middleware to authenticate the user by verifying the JWT token
const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (err) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// Check for buyer role
const authorizedBuyer = (req, res, next) => {
  if (req.user && req.user.role === "buyer") {
    next();
  } else {
    res.status(401).send("Not authorized as a buyer");
  }
};

// Check for seller role
const authorizedSeller = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    next();
  } else {
    res.status(401).send("Not authorized as a seller");
  }
};

// Check for admin role
const authorizedAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(401).send("Not authorized as an admin");
  }
};

module.exports = {
  authenticate,
  authorizedBuyer,
  authorizedSeller,
  authorizedAdmin,
};
