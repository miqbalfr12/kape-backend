"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.addColumn("users", "toko_id", {
   type: Sequelize.STRING,
   references: {
    model: "toko",
    key: "toko_id",
   },
   onUpdate: "CASCADE",
   onDelete: "SET NULL",
  });
 },
 async down(queryInterface, Sequelize) {
  await queryInterface.removeColumn("users", "toko_id");
 },
};
