"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable("users", {
   user_id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.STRING,
   },
   toko_id: {
    type: Sequelize.STRING,
    references: {
     model: "toko",
     key: "toko_id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
   },
   nik: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   fullname: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   email: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   profile_photo: {
    type: Sequelize.STRING,
   },
   birth_date: {
    type: Sequelize.DATE,
   },
   phone_number: {
    type: Sequelize.STRING,
   },
   password: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   role: {
    type: Sequelize.ENUM("pemilik", "kasir", "admin"),
    defaultValue: "pemilik",
   },
   status: {
    type: Sequelize.ENUM("not-verified", "verified", "deleted"),
    defaultValue: "not-verified",
   },
   last_signin: {
    type: Sequelize.DATE,
   },
   last_reset: {
    type: Sequelize.DATE,
   },
   created_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.fn("now"),
   },
   created_by: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   updated_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.fn("now"),
   },
   updated_by: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   deleted_at: {
    type: Sequelize.DATE,
   },
   deleted_by: {
    type: Sequelize.STRING,
   },
  });
 },
 async down(queryInterface, Sequelize) {
  await queryInterface.dropTable("users");
 },
};
