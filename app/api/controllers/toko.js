const fs = require("fs");
const path = require("path");
const config = require("../../../config");

const {Toko, User, Item, Image} = require("../../../models");
const {register} = require("./auth");
require("dotenv").config();

const imgDir = config.imagePath;

module.exports = {
 getToko: async (req, res) => {
  const dataToko = await Toko.findOne({
   where: {user_id: req.user.user_id},
   include: [
    {
     model: User,
     as: "pemilik", // Mengambil data pemilik toko
    },
    {
     model: User,
     as: "pengelola", // Mengambil data pengelola yang bekerja di toko ini
    },
   ],
  });
  if (dataToko) res.status(200).json(dataToko);
  else res.status(404).json({message: "Toko not found"});
 },

 createToko: async (req, res) => {
  try {
   const payload = req.body;

   const dataToko = await Toko.findOne({where: {user_id: req.user.user_id}});

   if (dataToko) {
    return res.status(422).json({message: "User already have toko", dataToko});
   } else {
    let getToko;
    do {
     charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
     toko_id = payload.name.charAt(0);
     for (var i = 0, n = charset.length; i < 8; ++i) {
      toko_id += charset.charAt(Math.floor(Math.random() * n));
     }

     getToko = await Toko.findOne({where: {toko_id}});
    } while (getToko !== null);

    const dataToko = await Toko.create({
     ...payload,
     toko_id,
     user_id: req.user.user_id,
     created_by: req.user.user_id,
     updated_by: req.user.user_id,
    });

    req.user.toko_id = toko_id;
    await req.user.save();

    res.status(201).json({message: "Toko created successfully", dataToko});
   }
  } catch (error) {
   res.status(500).json({
    message: error.message || `Internal server error!`,
   });
  }
 },

 getKasir: async (req, res) => {
  const dataKasir = await User.findAll({
   where: {toko_id: req.user.toko_id, role: "kasir"},
  });
  if (dataKasir) res.status(200).json(dataKasir);
  else res.status(404).json({message: "Kasir not found"});
 },

 createKasir: async (req, res) => {
  try {
   const dataToko = await Toko.findOne({where: {user_id: req.user.user_id}});
   if (dataToko === null) {
    return res.status(404).json({message: "User does not have toko"});
   } else {
    req.body.created_by = req.user.user_id;
    req.body.updated_by = req.user.user_id;
    req.body.role = "kasir";
    req.body.toko_id = dataToko.toko_id;

    await register(req, res);
   }
  } catch (error) {
   res.status(500).json({
    message: error.message || `Internal server error!`,
   });
  }
 },

 getItems: async (req, res) => {
  if (!req.user.toko_id) {
   return res.status(404).json({message: "User does not have toko"});
  }

  try {
   // Mengambil semua item yang dimiliki oleh toko tertentu
   const dataItem = await Item.findAll({
    where: {toko_id: req.user.toko_id},
    include: [
     {
      model: Toko,
      as: "toko",
      attributes: ["name"],
     },
     {
      model: Image,
      as: "gambar",
      attributes: ["filename"],
     },
    ],
   });

   const dataItemJson = JSON.parse(JSON.stringify(dataItem));

   dataItemJson.map((d, i) => {
    d.toko = d.toko.name;
    d.gambar = d.gambar.map(
     (a) => `${process.env.BASE_URL}/images/${a.filename}`
    )[0];
    return dataItemJson;
   });

   // Jika item ditemukan, kembalikan data beserta gambar-gambarnya
   if (dataItemJson.length > 0) {
    return res.status(200).json(dataItemJson);
   } else {
    return res.status(404).json([]); // Jika tidak ada item ditemukan
   }
  } catch (error) {
   return res
    .status(500)
    .json({message: error.message || "Internal server error!"});
  }
 },

 getItem: async (req, res) => {
  if (!req.user.toko_id) {
   return res.status(404).json({message: "User does not have toko"});
  }

  try {
   const dataItem = await Item.findOne({
    where: {toko_id: req.user.toko_id, item_id: req.params.item_id},
    include: [
     {
      model: Toko,
      as: "toko",
      attributes: ["name"],
     },
     {
      model: Image,
      as: "gambar",
      attributes: ["filename"],
     },
    ],
   });
   const dataItemJson = JSON.parse(JSON.stringify(dataItem));
   dataItemJson.toko = dataItemJson.toko.name;
   dataItemJson.gambar = dataItemJson.gambar.map(
    (a) => `${process.env.BASE_URL}/images/${a.filename}`
   );

   if (dataItemJson) return res.status(200).json(dataItemJson);
   else return res.status(404).json({message: "Item not found"});
  } catch (error) {
   return res
    .status(500)
    .json({message: error.message || "Internal server error!"});
  }
 },

 createItem: async (req, res) => {
  try {
   let getItem;
   do {
    charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    item_id = req.body.name.charAt(0);
    for (var i = 0, n = charset.length; i < 8; ++i) {
     item_id += charset.charAt(Math.floor(Math.random() * n));
    }
    req.body.item_id = item_id;

    getItem = await Item.findOne({where: {item_id}});
   } while (getItem !== null);

   req.body.created_by = req.user.user_id;
   req.body.updated_by = req.user.user_id;
   req.body.toko_id = req.user.toko_id;
   const dataItem = await Item.create(req.body);
   return res
    .status(201)
    .json({message: "Item created successfully", dataItem});
  } catch (error) {
   res.status(500).json({
    message: error.message || `Internal server error!`,
   });
  }
 },

 getItemImage: async (req, res) => {
  const dataImage = await Image.findAll({where: {item_id: req.params.item_id}});
  if (dataImage) return res.status(200).json(dataImage);
  else return res.status(404).json(req.params.item_id);
 },

 createItemImage: async (req, res) => {
  if (!fs.existsSync(imgDir)) {
   fs.mkdirSync(imgDir);
  }
  try {
   const imageData = await Promise.all(
    req.files.map(async (file) => {
     if (file.fieldname !== "image") return;

     const image_id = Date.now();

     const newFileName = `${image_id}${path.extname(file.originalname)}`;
     const savePath = path.join(imgDir, newFileName);

     fs.copyFileSync(file.path, savePath);
     fs.unlinkSync(file.path);

     const dataImage = await Image.create({
      image_id: image_id,
      item_id: req.params.item_id,
      filename: newFileName,
      path: savePath,
      created_by: req.user.user_id,
      updated_by: req.user.user_id,
     });

     return dataImage;
    })
   );
   return res.status(201).json(imageData);
  } catch (error) {
   return res
    .status(500)
    .json({message: error.message || `Internal server error!`});
  }
 },
};
