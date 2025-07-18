"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Hospitals",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
          comment: "Unique identifier for the hospital",
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
            notEmpty: { msg: "Hospital name is required" },
            len: {
              args: [1, 255],
              msg: "Hospital name must be between 1 and 255 characters",
            },
          },
          comment: "Hospital name, must be unique",
        },
        address: {
          type: Sequelize.STRING(500),
          allowNull: true,
          validate: {
            len: {
              args: [0, 500],
              msg: "Address must be less than 500 characters",
            },
          },
          comment: "Hospital address",
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          validate: {
            isEmail: { msg: "Invalid email format" },
            notEmpty: { msg: "Email is required" },
          },
          comment: "Hospital contact email",
        },
        mobile: {
          type: Sequelize.STRING(20),
          allowNull: true,
          validate: {
            len: {
              args: [0, 20],
              msg: "Mobile number must be less than 20 characters",
            },
          },
          comment: "Hospital contact mobile number",
        },
        reference: {
          type: Sequelize.JSON,
          allowNull: true,
          comment: "Additional hospital reference data",
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
            fields: ["name"],
            name: "idx_hospitals_name",
          },
        ],
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Hospitals");
  },
};
