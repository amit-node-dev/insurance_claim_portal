const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Hospital = sequelize.define(
    "Hospital",
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
        unique: true,
        validate: {
          notEmpty: { msg: "Hospital name is required" },
          len: {
            args: [1, 255],
            msg: "Hospital name must be between 1 and 255 characters",
          },
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 500],
            msg: "Address must be less than 500 characters",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: { msg: "Invalid email format" },
          notEmpty: { msg: "Email is required" },
        },
      },
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 20],
            msg: "Mobile number must be less than 20 characters",
          },
        },
      },
      reference: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "Hospitals",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["name"],
        },
      ],
    }
  );

  return Hospital;
};
