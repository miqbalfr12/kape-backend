const express = require("express");
const router = express.Router();
const os = require("os");
const {isLoginUser} = require("../../middleware/auth");
const {getProfile, updateProfile} = require("../controllers/user");
const multer = require("multer");

router.get("/profile", isLoginUser, getProfile);
router.put(
 "/",
 multer({dest: os.tmpdir()}).single("gambar"),
 isLoginUser,
 updateProfile
);

module.exports = router;
