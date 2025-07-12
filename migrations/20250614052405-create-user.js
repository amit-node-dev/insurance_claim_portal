"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "Users",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
          comment: "Unique identifier for the user",
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: { msg: "Invalid email format" },
            notEmpty: { msg: "Email is required" },
          },
          comment: "User's email address, must be unique",
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
          validate: {
            len: {
              args: [6, 255],
              msg: "Password must be between 6 and 255 characters",
            },
          },
          comment: "Hashed user password",
        },
        role: {
          type: Sequelize.ENUM("Super Admin", "Admin", "Staff", "Hospital"),
          allowNull: false,
          validate: {
            isIn: {
              args: [["Super Admin", "Admin", "Staff", "Hospital"]],
              msg: "Invalid role",
            },
          },
          comment: "User's role in the system",
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
            fields: ["email"],
            name: "idx_users_email",
          },
        ],
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
