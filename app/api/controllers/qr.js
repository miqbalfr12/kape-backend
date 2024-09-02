var express = require("express");
var router = express.Router();
const QRCode = require("qrcode");

const {Transaksi} = require("../../../models");

router.get("/:transaksi_id", async function (req, res, next) {
 const {transaksi_id} = req.params;
 try {
  const dataTransaksi = await Transaksi.findOne({where: {transaksi_id}});
  if (!dataTransaksi)
   return res.status(404).json({message: "QR code not found"});
  console.log({qr: dataTransaksi.qr, transaksi_id});

  const qrCode = await QRCode.toDataURL(dataTransaksi.qr);

  res.setHeader("Content-Type", "image/png");

  const base64Image = qrCode.split(";base64,").pop();
  const imgBuffer = Buffer.from(base64Image, "base64");

  res.send(imgBuffer);
 } catch (err) {
  res.status(500).send("Error generating QR code");
 }
});

module.exports = router;
