const dotenv = require("dotenv");
const { Sequelize } = require("sequelize");

// Load the appropriate .env file
dotenv.config();

const infoLogger = {
  info: (msg) => console.log(msg),
};

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    dialect: process.env.MYSQLDIALECT,
    logging: (msg) => infoLogger.info("Query ::: " + msg),
    logQueryParameters: true,
    replication: {
      read: [
        {
          host: process.env.MYSQLHOST,
          username: process.env.MYSQLUSER,
          password: process.env.MYSQLPASSWORD,
          port: parseInt(process.env.MYSQLPORT, 10),
        },
      ],
      write: {
        host: process.env.MYSQLHOST,
        username: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        port: parseInt(process.env.MYSQLPORT, 10),
      },
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
