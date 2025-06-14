const dotenv = require("dotenv");

// Load the appropriate .env file
dotenv.config();

module.exports = {
  development: {
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    host: process.env.MYSQLHOST || "localhost",
    dialect: process.env.MYSQLDAILET || "mysql",
  },
  test: {
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    host: process.env.MYSQLHOST || "localhost",
    dialect: process.env.MYSQLDAILET || "mysql",
  },
  production: {
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    host: process.env.MYSQLHOST || "localhost",
    dialect: process.env.MYSQLDAILET || "mysql",
  },
};
