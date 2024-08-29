const express = require("express");
const router = express.Router();
const {isLoginUser} = require("../../middleware/auth");
const {getToko, createToko, createKasir} = require("../controllers/toko");

router.get("/", isLoginUser, getToko);
router.post("/create", isLoginUser, createToko);
router.post("/create/kasir", isLoginUser, createKasir);

module.exports = router;
