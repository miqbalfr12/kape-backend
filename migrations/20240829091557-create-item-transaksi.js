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
   jumlah: {
    type: Sequelize.INTEGER,
    allowNull: false,
   },
   harga: {
    type: Sequelize.INTEGER,
    allowNull: false,
   },
   jumlah_harga: {
    type: Sequelize.INTEGER,
    allowNull: false,
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
  await queryInterface.dropTable("item_transaksi");
 },
};
