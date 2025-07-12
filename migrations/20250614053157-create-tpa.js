"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "TPAs",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
          comment: "Unique identifier for the TPA",
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          validate: {
            notEmpty: { msg: "TPA name is required" },
            len: {
              args: [1, 255],
              msg: "TPA name must be between 1 and 255 characters",
            },
          },
          comment: "TPA name",
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
          comment: "TPA address",
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          validate: {
            isEmail: { msg: "Invalid email format" },
            notEmpty: { msg: "Email is required" },
          },
          comment: "TPA contact email",
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
            fields: ["name"],
            name: "idx_tpas_name",
          },
        ],
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("TPAs");
  },
};
