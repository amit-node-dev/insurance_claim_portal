"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class TPA extends Model {
    static associate(models) {
      // define association here
    }
  }
  TPA.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        validate: { isEmail: true },
      },
    },
    {
      sequelize,
      modelName: "TPA",
    }
  );
  return TPA;
};
