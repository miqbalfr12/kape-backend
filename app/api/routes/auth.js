const express = require("express");
const {register, signIn, resetPassword} = require("../controllers/auth");
const router = express.Router();

router.post("/register", register);
router.post("/signin", signIn);
router.post("/reset", resetPassword);

module.exports = router;
