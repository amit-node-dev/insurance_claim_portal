const dotenv = require("dotenv");

// Load the appropriate .env file
dotenv.config();

module.exports = {
  development: {
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE || "insurance_portal",
    host: process.env.MYSQLHOST || "localhost",
    dialect: process.env.MYSQLDIALECT || "mysql",
  },
  test: {
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE || "insurance_portal",
    host: process.env.MYSQLHOST || "localhost",
    dialect: process.env.MYSQLDIALECT || "mysql",
  },
  production: {
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE || "insurance_portal",
    host: process.env.MYSQLHOST || "localhost",
    dialect: process.env.MYSQLDIALECT || "mysql",
  },
};
