var express = require("express");
var router = express.Router();
const path = require("path");
const QRCode = require("qrcode");
const {createCanvas, loadImage} = require("canvas");

const {Transaksi} = require("../../../models");

router.get("/:transaksi_id", async function (req, res, next) {
 const {transaksi_id} = req.params;
 try {
  const dataTransaksi = await Transaksi.findOne({where: {transaksi_id}});
  if (!dataTransaksi)
   return res.status(404).json({message: "QR code not found"});
  console.log({qr: dataTransaksi.qr, transaksi_id});

  async function create(dataForQRcode, centerImagePath, cwidth) {
   const qrCodeDataURL = await new Promise((resolve, reject) => {
    QRCode.toDataURL(
     dataForQRcode,
     {
      errorCorrectionLevel: "H",
      margin: 1,
      color: {
       dark: "#000000",
       light: "#ffffff",
      },
     },
     (error, url) => {
      if (error) reject(error);
      resolve(url);
     }
    );
   });

   const qrImage = await loadImage(qrCodeDataURL);
   const width = qrImage.width;
   const canvas = createCanvas(width, width);
   const ctx = canvas.getContext("2d");
   ctx.drawImage(qrImage, 0, 0, width, width);
   const img = await loadImage(centerImagePath);
   const centerX = (width - cwidth) / 2;
   const centerY = (width - cwidth) / 2;
   ctx.drawImage(img, centerX, centerY, cwidth, cwidth);
   return canvas.toDataURL("image/png");
  }

  const imagePath = path.join(__dirname, "../../../public/logo.png");
  console.log(imagePath);
  const qrCode = await create(dataTransaksi.qr, imagePath, 100);
  res.setHeader("Content-Type", "image/png");

  const base64Image = qrCode.split(";base64,").pop();
  const imgBuffer = Buffer.from(base64Image, "base64");

  return res.send(imgBuffer);
 } catch (err) {
  console.log(err);
  res.status(500).send(err);
 }
});

module.exports = router;
