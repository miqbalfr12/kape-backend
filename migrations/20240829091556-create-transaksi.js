"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable("transaksi", {
   transaksi_id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.STRING,
   },
   user_id: {
    type: Sequelize.STRING,
    references: {
     model: "users",
     key: "user_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
   },
   toko_id: {
    type: Sequelize.STRING,
    references: {
     model: "toko",
     key: "toko_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
   },
   pelanggan: {
    type: Sequelize.STRING,
   },
   total_harga: {
    type: Sequelize.INTEGER,
    allowNull: false,
   },
   payment_method: {
    type: Sequelize.ENUM("cash", "qris"),
    defaultValue: "cash",
   },
   qr: {
    type: Sequelize.TEXT,
   },
   status: {
    type: Sequelize.ENUM("pending", "completed", "canceled"),
    defaultValue: "pending",
   },
   transaksi_at: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn("now"),
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
  await queryInterface.dropTable("transaksi");
 },
};
