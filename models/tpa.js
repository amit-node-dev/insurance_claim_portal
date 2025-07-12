const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TPA = sequelize.define(
    "TPA",
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
        validate: {
          notEmpty: { msg: "TPA name is required" },
          len: {
            args: [1, 255],
            msg: "TPA name must be between 1 and 255 characters",
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
    },
    {
      tableName: "TPAs",
      timestamps: true,
      indexes: [
        {
          fields: ["name"],
        },
      ],
    }
  );

  return TPA;
};
