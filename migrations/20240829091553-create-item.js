"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
 up: async (queryInterface, Sequelize) => {
  await queryInterface.createTable("items", {
   item_id: {
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
   name: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   deskripsi: {
    allowNull: false,
    type: Sequelize.TEXT,
   },
   kategori: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   harga: {
    type: Sequelize.INTEGER,
   },
   diskon: {
    type: Sequelize.INTEGER,
   },
   type: {
    allowNull: false,
    type: Sequelize.ENUM("produk", "jasa"),
   },
   status: {
    allowNull: false,
    type: Sequelize.ENUM("visible", "not-visible"),
    defaultValue: "visible",
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

 down: async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("items");
 },
};
