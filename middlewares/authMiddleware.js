"use strict";

const jwt = require("jsonwebtoken");
const db = require("../models");
const User = db.User;

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyToken = (req, res, next) => {
  // Extract token from headers
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  // Handle Bearer prefix
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trim();
  }

  // Validate token presence
  if (!token) {
    return res.status(403).json({
      success: false,
      message:
        "No token provided in headers (x-access-token or Authorization).",
      data: null,
    });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message:
          err.name === "TokenExpiredError"
            ? "Token has expired."
            : "Invalid token.",
        data: null,
      });
    }

    // Attach user ID to request
    req.userId = decoded.id;
    req.userEmail = decoded.email; 
    next();
  });
};

/**
 * Middleware to authorize based on user roles
 * @param {...string} roles - Allowed roles for the route
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Fetch user by ID from token
      const user = await User.findByPk(req.userId, {
        attributes: ["id", "email", "role"],
      });

      // Check if user exists and has the required role
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
          data: null,
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Requires one of the following roles: ${roles.join(
            ", "
          )}.`,
          data: null,
        });
      }

      // Attach user role to request for controller logic
      req.userRole = user.role;
      req.userEmail = user.email; 
      next();
    } catch (error) {
      console.error("Authorization error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Authorization check failed.",
        data: null,
      });
    }
  };
};

module.exports = {
  verifyToken,
  authorize,
};
