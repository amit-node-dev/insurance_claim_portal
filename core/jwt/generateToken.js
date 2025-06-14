const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const authConfig = require("../../config/authConfig.json");

const generateAccessToken = (id, emailId) => {
  return jwt.sign({ id, emailId }, authConfig.secret, {
    expiresIn: authConfig.accessTokenExpiry,
  });
};

const generateRefreshToken = (id, emailId) => {
  return jwt.sign({ id, emailId }, authConfig.refreshTokenSecret, {
    expiresIn: authConfig.refreshTokenExpiry,
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
