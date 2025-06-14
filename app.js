const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const db = require('./models');

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
}));

// Parse requests of content-type - application/json
app.use(express.json());

// Parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

db.sequelize.sync()
  .then(() => {
    console.log("Database synced successfully.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// --- ROUTES ---
const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const claimRoutes = require('./routes/claimRoutes');

// Public routes (no auth needed)
app.use('/api/v1/public', publicRoutes);

// Auth routes (login/register)
app.use('/api/v1/auth', authRoutes);

// Protected routes
app.use('/api/v1/hospitals', hospitalRoutes);
app.use('/api/v1/claims', claimRoutes);

// Simple route for testing
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Insurance Claim Portal API.",
    data: null,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
    data: null,
  });
});

// Set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});