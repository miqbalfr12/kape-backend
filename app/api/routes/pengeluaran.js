const express = require("express");
const router = express.Router();
const {isLoginUser} = require("../../middleware/auth");
const {
 createPengeluaran,
 getPengeluaran,
} = require("../controllers/pengeluaran");

router.post("/", isLoginUser, createPengeluaran);
router.get("/:tahun?/:bulan?/:tanggal?", isLoginUser, getPengeluaran);

module.exports = router;
