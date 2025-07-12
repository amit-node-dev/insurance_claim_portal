"use strict";

const Sequelize = require("sequelize");
const sequelize = require("../core/sequelize/sequelize-config");

const User = require("./user")(sequelize);
const Hospital = require("./hospital")(sequelize);
const Claim = require("./claim")(sequelize);
const TPA = require("./tpa")(sequelize);

const db = {
  User,
  Hospital,
  Claim,
  TPA,
  sequelize,
  Sequelize,
};

// A Claim belongs to one Hospital
Claim.belongsTo(Hospital, { as: "hospital", foreignKey: "hospitalId" });
Hospital.hasMany(Claim, { as: "hospital", foreignKey: "hospitalId" });

// A Claim is created by a Staff/Admin user
Claim.belongsTo(User, { as: "createdBy", foreignKey: "creatorId" });
User.hasMany(Claim, { as: "createdBy", foreignKey: "creatorId" });

// A Claim is associated with a TPA
Claim.belongsTo(TPA, { as: "tpa", foreignKey: "tpaId" });
TPA.hasMany(Claim, { as: "tpa", foreignKey: "tpaId" });

module.exports = db;
