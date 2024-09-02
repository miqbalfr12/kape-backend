"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
 class PaymentMethod extends Model {
  static associate(models) {
   PaymentMethod.belongsTo(models.Toko, {
    foreignKey: "toko_id",
    as: "toko",
   });
  }
 }
 PaymentMethod.init(
  {
   payment_method_id: {
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
   jenis: {
    type: DataTypes.ENUM("cash", "dana", "gopay"),
    allowNull: false,
   },
   is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
   },
   key: {
    allowNull: false,
    type: DataTypes.TEXT,
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
   modelName: "PaymentMethod",
   tableName: "payment_methods",
   timestamps: false,
  }
 );
 return PaymentMethod;
};
