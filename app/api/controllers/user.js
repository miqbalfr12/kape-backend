const fs = require("fs");
const path = require("path");
const config = require("../../../config");

require("dotenv").config();

const {User} = require("../../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const imgDir = config.profilePhotoPath;

const salt = 10;

module.exports = {
 getAllUsers: async (req, res) => {
  const UserData = await User.findAll();
  res.status(200).json(UserData);
 },
 getProfile: (req, res) => {
  const user = req.user;

  res.status(200).json(user);
 },

 updateProfile: async (req, res, next) => {
  const user = req.user;
  const payload = req.body;
  console.log(payload);

  try {
   if (user) {
    const passwordMatch = await new Promise((resolve, reject) => {
     bcrypt.compare(
      payload.oldPassword || "",
      user.password,
      (error, response) => {
       if (error) return reject(error);
       resolve(response);
      }
     );
    });

    if (!passwordMatch) {
     return res.status(403).json({
      message: "Password yang anda masukkan salah!",
     });
    }

    if (req.file) {
     if (!fs.existsSync(imgDir)) {
      fs.mkdirSync(imgDir, {recursive: true});
      console.log("Directory created successfully");
     }

     const newFileName = `${user.user_id}-${new Date().getTime()}${path.extname(
      req.file.originalname
     )}`;
     const savePath = path.join(imgDir, newFileName);
     if (user.profile_photo) {
      const oldFile = path.join(imgDir, user.profile_photo.split("/").pop());
      try {
       if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile);
        console.log("File lama berhasil dihapus.");
       }
      } catch (err) {
       console.error("Terjadi kesalahan saat menghapus file lama:", err);
      }
     }
     fs.copyFileSync(req.file.path, savePath);
     fs.unlinkSync(req.file.path);
     payload.profile_photo = `${process.env.BASE_URL}/images/pp/${newFileName}`;
    }

    delete payload.oldPassword;

    if (payload.newPassword) {
     console.log("newPassword");
     try {
      const hash = await new Promise((resolve, reject) => {
       bcrypt.hash(payload.newPassword, salt, (err, hash) => {
        if (err) return reject(err);
        resolve(hash);
       });
      });
      payload.password = hash;
      delete payload.newPassword;
     } catch (error) {
      console.error("Error hashing password:", error);
      return res.status(500).json({message: "Failed to hash password"});
     }
    }

    const newData = {
     update_at: new Date(),
     update_by: user.user_id,
     ...payload,
    };

    console.log(newData);
    const updateData = await User.update(newData, {
     where: {
      user_id: user.user_id,
     },
    });
    console.log(updateData);

    if (updateData)
     return res.status(200).json({
      message: "Profile updated successfully",
      oldData: user,
      newData,
     });
    else return res.status(500).json({message: "Failed to update profile"});
   }
   return res.status(404).json({
    message: "User not found",
   });
  } catch (error) {
   console.log(error);
   res.status(500).json({
    message: error.message || `Internal server error!`,
    error: error,
   });
  }
 },
};
