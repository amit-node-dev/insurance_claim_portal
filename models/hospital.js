const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Hospital", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    address: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, validate: { isEmail: true } },
    mobile: { type: DataTypes.STRING },
    reference: { type: DataTypes.JSON },
  });
};
