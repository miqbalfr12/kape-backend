"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable("toko", {
   toko_id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.STRING,
   },
   user_id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.STRING,
   },
   address: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   name: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   last_open: {
    type: Sequelize.DATE,
   },
   last_open_by: {
    type: Sequelize.STRING,
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
