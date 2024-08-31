"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
 up: async (queryInterface, Sequelize) => {
  await queryInterface.createTable("images", {
   image_id: {
    allowNull: false,
    primaryKey: true,
    type: Sequelize.STRING,
   },
   item_id: {
    allowNull: false,
    type: Sequelize.STRING,
    references: {
     model: "items",
     key: "item_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
   },
   filename: {
    allowNull: false,
    type: Sequelize.STRING,
   },
   path: {
    allowNull: false,
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
  });
 },

 down: async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("images");
 },
};
