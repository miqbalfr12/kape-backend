"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
 async up(queryInterface, Sequelize) {
  await queryInterface.createTable("payment_methods", {
   payment_method_id: {
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
   jenis: {
    type: Sequelize.ENUM("cash", "dana", "gopay"),
    allowNull: false,
   },
   is_active: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
   },
   key: {
    allowNull: false,
    type: Sequelize.TEXT,
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
  await queryInterface.dropTable("payment_methods");
 },
};
