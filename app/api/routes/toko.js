const express = require("express");
const router = express.Router();
const os = require("os");
const {isLoginUser} = require("../../middleware/auth");
const {
 getToko,
 createToko,
 updateToko,
 getItems,
 getItem,
 createItem,
 deleteItem,
 editItem,
} = require("../controllers/toko");
const multer = require("multer");

router.get("/", isLoginUser, getToko);
router.post("/", isLoginUser, createToko);
router.put("/", isLoginUser, updateToko);
router.get("/:toko_id", getToko);

router.get("/item", isLoginUser, getItems);
router.post(
 "/item",
 multer({dest: os.tmpdir(), limits: {fileSize: 100 * 1024 * 1024}}).array(
  "gambar"
 ),
 isLoginUser,
 createItem
);
router.get("/item/:item_id", isLoginUser, getItem);
router.delete("/item/:item_id", isLoginUser, deleteItem);
router.put(
 "/item/:item_id",
 multer({dest: os.tmpdir()}).fields([{name: "gambar"}, {name: "delete-image"}]),
 isLoginUser,
 editItem
);

module.exports = router;
