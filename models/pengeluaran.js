"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
 class Pengeluaran extends Model {
  static associate(models) {
   Pengeluaran.belongsTo(models.Toko, {
    foreignKey: "toko_id",
    as: "toko",
   });
  }
 }
 Pengeluaran.init(
  {
   pengeluaran_id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
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
   untuk: {
    type: DataTypes.STRING,
    allowNull: false,
   },
   keterangan: {
    type: DataTypes.STRING,
    allowNull: false,
   },
   total_harga: {
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
   updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.fn("now"),
   },
   updated_by: {
    type: DataTypes.STRING,
   },
  },
  {
   sequelize,
   modelName: "Pengeluaran",
   tableName: "pengeluaran",
   timestamps: false,
  }
 );
 return Pengeluaran;
};
