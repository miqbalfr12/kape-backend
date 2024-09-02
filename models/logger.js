"use strict";
const {Model} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
 class Logger extends Model {
  static associate(models) {
   // Associations can be defined here if needed
  }
 }

 Logger.init(
  {
   log_id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
   },
   user_id: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   method: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   url: {
    allowNull: false,
    type: DataTypes.STRING,
   },
   body: {
    type: DataTypes.TEXT, // Stores req.body
   },
   params: {
    type: DataTypes.TEXT, // Stores req.params
   },
   query: {
    type: DataTypes.TEXT, // Stores req.query
   },
   headers: {
    type: DataTypes.TEXT, // Stores req.headers
   },
   cookies: {
    type: DataTypes.TEXT, // Stores req.cookies
   },
   files: {
    type: DataTypes.TEXT, // Stores req.files
   },
   ip_address: {
    allowNull: false,
    type: DataTypes.STRING, // Stores req.ip
   },
   created_at: {
    allowNull: false,
    type: DataTypes.DATE,
    defaultValue: sequelize.fn("now"),
   },
  },
  {
   sequelize,
   modelName: "Logger",
   tableName: "logs",
   timestamps: false,
  }
 );

 return Logger;
};
