"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable("pengeluaran", {
   pengeluaran_id: {
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
    onDelete: "CASCADE",
   },
   untuk: {
    type: Sequelize.STRING,
    allowNull: false,
   },
   keterangan: {
    type: Sequelize.STRING,
    allowNull: false,
   },
   total_harga: {
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
  await queryInterface.dropTable("pengeluaran");
 },
};
