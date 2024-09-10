const fs = require("fs");
const path = require("path");
const config = require("../../../config");

const {Image} = require("image-js");
const {default: jsQR} = require("jsqr");

const {Toko, PaymentMethod} = require("../../../models");
require("dotenv").config();

const imgDir = config.imagePath;

module.exports = {
 getPayments: async (req, res, next) => {
  if (!req.user.toko_id) {
   return res.status(404).json({message: "User does not have toko"});
  }

  try {
   // Mengambil semua item yang dimiliki oleh toko tertentu
   const dataPayment = await PaymentMethod.findAll({
    where: {toko_id: req.user.toko_id},
    include: [
     {
      model: Toko,
      as: "toko",
      attributes: ["name"],
     },
    ],
   });
   console.log(dataPayment);

   const dataPaymentJson = JSON.parse(JSON.stringify(dataPayment));
   if (dataPayment.length == 0)
    return res.status(404).json({message: "Toko belum ada payment method"});

   return res.status(200).json(dataPaymentJson);
  } catch (error) {
   return res
    .status(500)
    .json({message: error.message || "Internal server error!"});
  }
 },

 createPayment: async (req, res, next) => {
  if (!fs.existsSync(imgDir)) {
   fs.mkdirSync(imgDir, {recursive: true});
  }

  try {
   let getPayment;
   let payment_method_id;
   do {
    charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    payment_method_id = req.user.toko_id.charAt(0);
    for (var i = 0, n = charset.length; i < 8; ++i) {
     payment_method_id += charset.charAt(Math.floor(Math.random() * n));
    }
    req.body.payment_method_id = payment_method_id;

    getPayment = await PaymentMethod.findOne({where: {payment_method_id}});
   } while (getPayment !== null);

   req.body.toko_id = req.user.toko_id;
   req.body.toko_id = req.user.toko_id;

   const image_id = Date.now();

   const newFileName = `${image_id}${path.extname(req.file.originalname)}`;
   const savePath = path.join(imgDir, newFileName);

   fs.copyFileSync(req.file.path, savePath);
   fs.unlinkSync(req.file.path);

   fs.readFile(savePath, (err, data) => {
    if (err) {
     return res.status(500).json({message: "Error reading the image file"});
    }

    Image.load(data).then(async (image) => {
     const imageData = {
      data: new Uint8ClampedArray(image.data),
      width: image.width,
      height: image.height,
     };

     try {
      const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
      if (qrCode) {
       req.body.key = qrCode.data;
       req.body.created_by = req.user.user_id;
       req.body.updated_by = req.user.user_id;
       const dataPayment = await PaymentMethod.create(req.body);

       return res.status(201).json({
        message: "Payment method created",
        dataPayment,
       });
      }
     } catch (error) {
      console.log(error);
      return res.status(500).json({message: "Error processing the image file"});
     }
    });
   });
  } catch (error) {
   res.status(500).json({
    message: error.message || `Internal server error!`,
   });
   next(error);
   return;
  }
 },
};
