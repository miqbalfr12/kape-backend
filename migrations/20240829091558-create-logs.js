"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable("logs", {
   log_id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.STRING,
   },
   created_at: {
    allowNull: false,
    type: Sequelize.DATE,
    defaultValue: Sequelize.fn("now"),
   },
   user_id: {
    type: Sequelize.STRING,
   },
   method: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   url: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   body: {
    type: Sequelize.TEXT,
   },
   params: {
    type: Sequelize.TEXT,
   },
   query: {
    type: Sequelize.TEXT,
   },
   headers: {
    type: Sequelize.TEXT,
   },
   cookies: {
    type: Sequelize.TEXT,
   },
   files: {
    type: Sequelize.TEXT,
   },
   ip_address: {
    type: Sequelize.STRING,
    allowNull: false,
   },
  });
 },
 async down(queryInterface, Sequelize) {
  await queryInterface.dropTable("logs");
 },
};
