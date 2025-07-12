const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const db = require("./models");

const PORT = process.env.PORT || 8080;

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : ["http://localhost:3000"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "x-access-token"],
  })
);

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
const publicRoutes = require("./routes/publicRoutes");
const authRoutes = require("./routes/authRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const claimRoutes = require("./routes/claimRoutes");
const tpaRoutes = require("./routes/tpaRoutes");

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Insurance Claim Portal API.",
    data: null,
  });
});

// Public routes (no auth needed)
app.use("/public", publicRoutes);

// Auth routes (login/register)
app.use("/auth", authRoutes);

// Protected routes
app.use("/hospitals", hospitalRoutes);
app.use("/claims", claimRoutes);
app.use("/tpas", tpaRoutes);

// In app.js, before starting the server
db.sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established successfully.");
    return db.sequelize.sync();
  })
  .then(() => {
    console.log("Database synced successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err.message);
    process.exit(1);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof Sequelize.ValidationError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      data: err.errors.map((e) => e.message),
    });
  }
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
    data: null,
  });
});