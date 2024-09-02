const express = require("express");
const router = express.Router();
const os = require("os");
const {isLoginUser} = require("../../middleware/auth");
const {
 getToko,
 createToko,
 getItems,
 getItem,
 createItem,
} = require("../controllers/toko");
const multer = require("multer");

router.get("/", isLoginUser, getToko);
router.post("/", isLoginUser, createToko);
router.get("/:toko_id", getToko);

router.get("/item", isLoginUser, getItems);
router.post(
 "/item",
 multer({dest: os.tmpdir()}).array("gambar"),
 isLoginUser,
 createItem
);
router.get("/item/:item_id", isLoginUser, getItem);

module.exports = router;
