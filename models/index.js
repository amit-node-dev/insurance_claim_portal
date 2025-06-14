'use strict';

const { Sequelize } = require("sequelize");
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    dialect: process.env.MYSQLDAILET,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.User = require("./user.js")(sequelize, Sequelize);
db.Hospital = require("./hospital.js")(sequelize, Sequelize);
db.Claim = require("./claim.js")(sequelize, Sequelize);
db.TPA = require("./tpa.js")(sequelize, Sequelize);

// Define Associations

// A Claim belongs to one Hospital
db.Claim.belongsTo(db.Hospital, { foreignKey: "hospitalId" });
db.Hospital.hasMany(db.Claim, { foreignKey: "hospitalId" });

// A Claim is created by a Staff/Admin user
db.Claim.belongsTo(db.User, { as: "createdBy", foreignKey: "creatorId" });
db.User.hasMany(db.Claim, { foreignKey: "creatorId" });

// A Claim is associated with a TPA
db.Claim.belongsTo(db.TPA, { foreignKey: "tpaId" });
db.TPA.hasMany(db.Claim, { foreignKey: "tpaId" });

module.exports = db;
