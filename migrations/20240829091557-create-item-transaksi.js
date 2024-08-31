"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable("item_transaksi", {
   item_transaksi_id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.STRING,
   },
   transaksi_id: {
    type: Sequelize.STRING,
    references: {
     model: "transaksi",
     key: "transaksi_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
   },
   item_id: {
    type: Sequelize.STRING,
    references: {
     model: "items",
     key: "item_id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
   },
   quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
   },
   price: {
    type: Sequelize.INTEGER,
    allowNull: false,
   },
  });
 },
 async down(queryInterface, Sequelize) {
  await queryInterface.dropTable("item_transaksi");
 },
};
