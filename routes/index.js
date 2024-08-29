var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
 res.render("index", {
  title: "REID Team",
  content: "Backend Kerja Praktek Reid Team",
 });
});

module.exports = router;
