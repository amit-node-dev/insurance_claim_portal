const dotenv = require("dotenv");

// Load the appropriate .env file
dotenv.config();

module.exports = {
  development: {
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "insurance_portal",
    host: process.env.MYSQL_HOST || "localhost",
    dialect: process.env.MYSQL_DIALECT || "mysql",
  },
  test: {
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "insurance_portal",
    host: process.env.MYSQL_HOST || "localhost",
    dialect: process.env.MYSQL_DIALECT || "mysql",
  },
  production: {
    username: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE || "insurance_portal",
    host: process.env.MYSQL_HOST || "localhost",
    dialect: process.env.MYSQL_DIALECT || "mysql",
  },
};
