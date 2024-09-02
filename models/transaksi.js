"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
 class Transaksi extends Model {
  static associate(models) {
   Transaksi.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
   });

   Transaksi.belongsTo(models.Toko, {
    foreignKey: "toko_id",
    as: "toko",
   });

   Transaksi.hasMany(models.ItemTransaksi, {
    foreignKey: "transaksi_id",
    as: "items",
   });
  }
 }
 Transaksi.init(
  {
   transaksi_id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
   },
   user_id: {
    type: DataTypes.STRING,
    references: {
     model: "users",
     key: "user_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
   },
   toko_id: {
    type: DataTypes.STRING,
    references: {
     model: "toko",
     key: "toko_id",
    },
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
   },
   pelanggan: {
    type: DataTypes.STRING,
   },
   total_harga: {
    type: DataTypes.INTEGER,
    allowNull: false,
   },
   payment_method: {
    type: DataTypes.ENUM("cash", "qris"),
    defaultValue: "cash",
   },
   qr: {
    type: DataTypes.TEXT,
   },
   status: {
    type: DataTypes.ENUM("pending", "completed", "canceled"),
    defaultValue: "pending",
   },
   transaksi_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: sequelize.fn("now"),
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
   modelName: "Transaksi",
   tableName: "transaksi",
   timestamps: false,
  }
 );
 return Transaksi;
};
