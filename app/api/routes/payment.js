const express = require("express");
const router = express.Router();
const os = require("os");
const {isLoginUser} = require("../../middleware/auth");
const {getPayments, createPayment} = require("../controllers/payment");
const multer = require("multer");

router.get("/", isLoginUser, getPayments);
router.post(
 "/",
 multer({dest: os.tmpdir()}).single("gambar"),
 isLoginUser,
 createPayment
);

module.exports = router;
