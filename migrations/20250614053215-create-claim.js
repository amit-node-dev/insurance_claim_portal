"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Claims",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
          comment: "Unique identifier for the claim",
        },
        claimNumber: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: { msg: "Claim number is required" },
          },
          comment: "Unique claim number (auto-generated in model)",
        },
        policyNumber: {
          type: Sequelize.STRING(100),
          allowNull: true,
          validate: {
            len: {
              args: [0, 100],
              msg: "Policy number must be less than 100 characters",
            },
          },
          comment: "Insurance policy number",
        },
        patientName: {
          type: Sequelize.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: { msg: "Patient name is required" },
            len: {
              args: [1, 255],
              msg: "Patient name must be between 1 and 255 characters",
            },
          },
          comment: "Name of the patient",
        },
        admissionDate: {
          type: Sequelize.DATE,
          allowNull: false,
          validate: {
            isDate: { msg: "Invalid admission date" },
          },
          comment: "Date of patient admission",
        },
        dischargeDate: {
          type: Sequelize.DATE,
          allowNull: true,
          validate: {
            isDate: { msg: "Invalid discharge date" },
          },
          comment: "Date of patient discharge",
        },
        hospitalId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Hospitals",
            key: "id",
          },
          onDelete: "RESTRICT",
          comment: "Foreign key referencing Hospitals table",
        },
        tpaId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "TPAs",
            key: "id",
          },
          onDelete: "RESTRICT",
          comment: "Foreign key referencing TPAs table",
        },
        creatorId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Users",
            key: "id",
          },
          onDelete: "RESTRICT",
          comment: "Foreign key referencing Users table (creator)",
        },
        status: {
          type: Sequelize.ENUM(
            "Admitted",
            "Discharged",
            "File Submitted",
            "In Review",
            "Settled"
          ),
          allowNull: false,
          defaultValue: "Admitted",
          comment: "Current status of the claim",
        },
        documents: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: "Claim-related documents",
        },
        settlementDetails: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: "Details of claim settlement",
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          comment: "Record creation timestamp",
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          comment: "Record update timestamp",
        },
      },
      {
        indexes: [
          {
            unique: true,
            fields: ["claimNumber"],
            name: "idx_claims_claimNumber",
          },
        ],
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Claims");
  },
};
