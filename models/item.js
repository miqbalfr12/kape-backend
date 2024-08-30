"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
 class Item extends Model {
  static associate(models) {
   // 1 Toko memiliki banyak Item
   Item.belongsTo(models.Toko, {
    foreignKey: "toko_id",
    as: "toko",
   });

   // 1 Item memiliki banyak Image
   Item.hasMany(models.Image, {
    foreignKey: "item_id",
    as: "images",
   });
  }
 }
 Item.init(
  {
   item_id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
   },
   toko_id: {
    type: DataTypes.STRING,
   },
   name: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   deskhripsi: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   kategori: {
    allowNull: false,
    type: DataTypes.TEXT,
   },
   harga: {
    type: DataTypes.INTEGER,
   },
   diskon: {
    type: DataTypes.INTEGER,
   },
   type: {
    allowNull: false,
    type: DataTypes.ENUM("produk", "jasa"),
   },
   status: {
    allowNull: false,
    type: DataTypes.ENUM("visible", "not-visible"),
    defaultValue: "visible",
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
   deleted_at: {
    type: DataTypes.DATE,
   },
   deleted_by: {
    type: DataTypes.STRING,
   },
  },
  {
   sequelize,
   modelName: "Item",
   tableName: "items",
   timestamps: false,
  }
 );
 return Item;
};
