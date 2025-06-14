"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Claims", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      claimNumber: {
        type: Sequelize.STRING,
        unique: true,
      },
      policyNumber: {
        type: Sequelize.STRING,
      },
      patientName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      admissionDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      dischargeDate: {
        type: Sequelize.DATE,
      },
      hospitalId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Hospitals',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      tpaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'TPAs',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      status: {
        type: Sequelize.ENUM(
          "Admitted",
          "Discharged",
          "File Submitted",
          "In Review",
          "Settled"
        ),
        defaultValue: "Admitted",
      },
      documents: {
        type: Sequelize.JSON,
      },
      settlementDetails: {
        type: Sequelize.JSON,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Claims");
  },
};
