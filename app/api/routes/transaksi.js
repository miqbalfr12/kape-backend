const express = require("express");
const router = express.Router();
const {isLoginUser} = require("../../middleware/auth");
const {
 createTransaksi,
 getTransaksi,
 getTransaksiDetail,
 actionTransaksi,
} = require("../controllers/transaksi");

router.get("/", isLoginUser, getTransaksi);
router.get("/:transaksi_id", isLoginUser, getTransaksiDetail);
router.post("/", isLoginUser, createTransaksi);
router.post("/actions/:transaksi_id", isLoginUser, actionTransaksi);

module.exports = router;
