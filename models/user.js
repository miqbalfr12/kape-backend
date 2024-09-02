"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
 class User extends Model {
  static associate(models) {
   // Asosiasi dengan Toko (pemilik toko)
   // menunjukkan bahwa seorang pengguna dapat memiliki satu toko (pemilik toko).
   User.hasOne(models.Toko, {
    foreignKey: "user_id",
    as: "pemilik",
   });

   // Asosiasi dengan Toko (kasir atau pengelola)
   // menunjukkan bahwa seorang pengguna dapat bekerja di satu toko (kasir atau pengelola).
   User.belongsTo(models.Toko, {
    foreignKey: "toko_id",
    as: "pengelola",
   });
  }
 }
 User.init(
  {
   user_id: {
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
   },
   nik: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   fullname: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   email: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   profile_photo: {
    type: DataTypes.STRING,
   },
   birth_date: {
    type: DataTypes.DATE,
   },
   phone_number: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   password: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   role: {
    type: DataTypes.ENUM("pemilik", "kasir", "admin"),
    defaultValue: "pemilik",
   },
   status: {
    type: DataTypes.ENUM("not-verified", "verified", "deleted"),
    defaultValue: "not-verified",
   },
   last_signin: {
    type: DataTypes.DATE,
   },
   last_activity: {
    type: DataTypes.DATE,
   },
   last_reset: {
    type: DataTypes.DATE,
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
   modelName: "User",
   tableName: "users",
   timestamps: false,
  }
 );
 return User;
};
