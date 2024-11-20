const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/connectDB");
const authRoutes = require("./routes/authRoutes");

require("dotenv").config();

const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [process.env.CLIENT_URL],
  methods: "GET, POST, PUT, DELETE, PATCH",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Welcome to the page");
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
