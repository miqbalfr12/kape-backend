"use strict";
const {Model} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
 class Image extends Model {
  static associate(models) {
   Image.belongsTo(models.Item, {
    foreignKey: "item_id",
    as: "item",
   });
  }
 }
 Image.init(
  {
   image_id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
   },
   item_id: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   filename: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   path: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   created_at: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: sequelize.fn("now"),
   },
   created_by: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   updated_at: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: sequelize.fn("now"),
   },
   updated_by: {
    allowNull: false,
    type: DataTypes.STRING,
   },
  },
  {
   sequelize,
   modelName: "Image",
   tableName: "images",
   timestamps: false,
  }
 );
 return Image;
};
