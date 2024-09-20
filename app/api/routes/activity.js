const express = require("express");
const router = express.Router();
const {isLoginUser} = require("../../middleware/auth");
const {getActivity} = require("../controllers/activity");

router.get("/:tahun?/:bulan?/:tanggal?", isLoginUser, getActivity);

module.exports = router;
