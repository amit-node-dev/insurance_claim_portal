const jwt = require("jsonwebtoken");
const authConfig = require("../config/authConfig.json");
const db = require("../models");
const User = db.User;

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, authConfig.secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
    }
    req.userId = decoded.id;
    next();
  });
};

const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.userId);
      if (!user || !roles.includes(user.role)) {
        return res.status(403).send({ message: "Require appropriate role!" });
      }
      // Attach user role to request for controller logic if needed
      req.userRole = user.role;
      next();
    } catch (error) {
      res.status(500).send({ message: "Authorization check failed." });
    }
  };
};

const authMiddleware = {
  verifyToken,
  authorize,
};

module.exports = authMiddleware;
