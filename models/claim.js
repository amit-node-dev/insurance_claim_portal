const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("Claim", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    claimNumber: { type: DataTypes.STRING, unique: true },
    policyNumber: { type: DataTypes.STRING },
    patientName: { type: DataTypes.STRING, allowNull: false },
    admissionDate: { type: DataTypes.DATE, allowNull: false },
    dischargeDate: { type: DataTypes.DATE },
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
    status: {
      type: DataTypes.ENUM(
        "Admitted",
        "Discharged",
        "File Submitted",
        "In Review",
        "Settled"
      ),
      defaultValue: "Admitted",
    },
    documents: { type: DataTypes.JSON },
    settlementDetails: { type: DataTypes.JSON },
  });
};
