"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
 class Toko extends Model {
  static associate(models) {
   // Asosiasi dengan User (pemilik toko)
   // menunjukkan bahwa setiap toko dimiliki oleh seorang pengguna.
   Toko.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "pemilik",
   });

   // Asosiasi dengan User (kasir atau pengelola)
   // menunjukkan bahwa setiap toko dapat memiliki banyak pengguna (kasir).
   Toko.hasMany(models.User, {
    foreignKey: "toko_id",
    as: "pengelola",
   });
  }
 }
 Toko.init(
  {
   toko_id: {
    allowNull: false,
    type: DataTypes.STRING,
    primaryKey: true,
   },
   user_id: {
    allowNull: false,
    type: DataTypes.STRING,
    references: {
     model: "users",
     key: "user_id",
    },
    primaryKey: true,
   },
   address: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   name: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   last_open: {
    type: DataTypes.DATE,
   },
   last_open_by: {
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
   deleted_at: {
    type: DataTypes.DATE,
   },
   deleted_by: {
    type: DataTypes.STRING,
   },
  },
  {
   sequelize,
   modelName: "Toko",
   tableName: "toko",
   timestamps: false,
  }
 );
 return Toko;
};
