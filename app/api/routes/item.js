const express = require("express");
const router = express.Router();
const {isLoginUser} = require("../../middleware/auth");
const {getItems, getItem} = require("../controllers/item");

router.get("/", getItems);
router.get("/:item_id", getItem);

module.exports = router;
