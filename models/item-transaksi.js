"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
 class ItemTransaksi extends Model {
  static associate(models) {
   // Asosiasi dengan Transaksi
   ItemTransaksi.belongsTo(models.Transaksi, {
    foreignKey: "transaksi_id",
    as: "transaksi",
   });

   // Asosiasi dengan Item
   ItemTransaksi.belongsTo(models.Item, {
    foreignKey: "item_id",
    as: "item",
   });
  }
 }
 ItemTransaksi.init(
  {
   item_transaksi_id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
   },
   transaksi_id: {
    type: DataTypes.STRING,
    references: {
     model: "transaksi",
     key: "transaksi_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
   },
   item_id: {
    type: DataTypes.STRING,
    references: {
     model: "items",
     key: "item_id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
   },
   jumlah: {
    type: DataTypes.INTEGER,
    allowNull: false,
   },
   jumlah_harga: {
    type: DataTypes.INTEGER,
    allowNull: false,
   },
   harga: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
   modelName: "ItemTransaksi",
   tableName: "item_transaksi",
   timestamps: false,
  }
 );
 return ItemTransaksi;
};
