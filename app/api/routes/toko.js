const express = require("express");
const router = express.Router();
const os = require("os");
const {isLoginUser} = require("../../middleware/auth");
const {
 getToko,
 createToko,
 getKasir,
 createKasir,
 getItems,
 getItem,
 createItem,
 getItemImage,
 createItemImage,
} = require("../controllers/toko");
const multer = require("multer");

router.get("/", isLoginUser, getToko);
router.post("/", isLoginUser, createToko);
router.get("/kasir", isLoginUser, getKasir);
router.post("/kasir", isLoginUser, createKasir);
router.get("/item", isLoginUser, getItems);
router.post("/item", isLoginUser, createItem);
router.get("/item/:item_id", isLoginUser, getItem);
router.get("/item/:item_id/gambar", isLoginUser, getItemImage);
router.post(
 "/item/:item_id/gambar",
 isLoginUser,
 multer({dest: os.tmpdir()}).array("image"),
 createItemImage
);

module.exports = router;
