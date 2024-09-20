const express = require("express");
const router = express.Router();
const {isLoginUser} = require("../../middleware/auth");
const {getActivity, getLaporan} = require("../controllers/activity");

router.get("/:tahun?/:bulan?/:tanggal?", isLoginUser, getActivity);
router.get("/laporan/:tahun?/:bulan?/:tanggal?", isLoginUser, getLaporan);

module.exports = router;
