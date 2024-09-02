const express = require("express");
const router = express.Router();
const {isLoginUser} = require("../../middleware/auth");
const {getKasir, createKasir} = require("../controllers/kasir");

router.get("/", isLoginUser, getKasir);
router.post("/", isLoginUser, createKasir);

module.exports = router;
