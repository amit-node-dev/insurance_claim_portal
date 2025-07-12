const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Claim = sequelize.define(
    "Claim",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      claimNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Claim number is required" },
        },
      },
      policyNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [0, 100],
            msg: "Policy number must be less than 100 characters",
          },
        },
      },
      patientName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Patient name is required" },
          len: {
            args: [1, 255],
            msg: "Patient name must be between 1 and 255 characters",
          },
        },
      },
      admissionDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          isDate: { msg: "Invalid admission date" },
        },
      },
      dischargeDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: { msg: "Invalid discharge date" },
        },
      },
      hospitalId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Hospitals",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      tpaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "TPAs",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      creatorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      status: {
        type: DataTypes.ENUM(
          "Admitted",
          "Discharged",
          "File Submitted",
          "In Review",
          "Settled"
        ),
        allowNull: false,
        defaultValue: "Admitted",
      },
      documents: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      settlementDetails: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "Claims",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["claimNumber"],
        },
      ],
    }
  );

  return Claim;
};
