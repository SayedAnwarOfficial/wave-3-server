const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register a new user
const registerUser = async (req, res, userCollection) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).send({ message: "All fields are required" });
    }

    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return res.status(409).send({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { name, email, password: hashedPassword, role: "user" };

    await userCollection.insertOne(newUser);
    res.status(201).send({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error registering user", error });
  }
};

// Login a user
const loginUser = async (req, res, userCollection) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "Email and password are required" });
    }

    const user = await userCollection.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.send({ message: "Login successful", token });
  } catch (error) {
    res.status(500).send({ message: "Error logging in", error });
  }
};

// Logout a user
const logoutUser = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    })
    .send({ success: true, message: "Logged out successfully" });
};

// user profile
const getUserProfile = async (req, res, userCollection) => {
  try {
    const email = req.user.email;

    const user = await userCollection.findOne(
      { email },
      { projection: { password: 0 } } // Exclude password
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(user);
  } catch (error) {
    res.status(500).send({ message: "Error fetching user profile", error });
  }
};

// Update a user's profile
const updateUser = async (req, res, userCollection) => {
  try {
    const { name, password } = req.body;
    const email = req.user.email;

    const updatedData = {};
    if (name) updatedData.name = name;
    if (password) updatedData.password = await bcrypt.hash(password, 10);

    const result = await userCollection.updateOne(
      { email },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error updating user", error });
  }
};

// Delete a user (Admin only)
const deleteUser = async (req, res, userCollection) => {
  try {
    const { email } = req.params;

    const result = await userCollection.deleteOne({ email });

    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).send({ message: "Error deleting user", error });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res, userCollection) => {
  try {
    const users = await userCollection
      .find({}, { projection: { password: 0 } })
      .toArray();
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: "Error fetching users", error });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserProfile,
};
