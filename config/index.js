const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

module.exports = {
 rootPath: path.resolve(__dirname, ".."),
 imagePath: path.resolve(__dirname, "..", "public", "images"),
 jwtKey: process.env.SECRET,
};
