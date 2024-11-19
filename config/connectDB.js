const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("MongoDB connected successfully for wave-3-assignment");
  } catch (e) {
    console.error("Db connected failed", e.message);
    process.exit(1);
  }
};

module.exports = connectDB;
