const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

module.exports = {
 rootPath: path.resolve(__dirname, ".."),
 imagePath: path.resolve(__dirname, "..", "public", "images"),
 profilePhotoPath: path.resolve(__dirname, "..", "public", "images", "pp"),
 jwtKey: process.env.SECRET,
};
