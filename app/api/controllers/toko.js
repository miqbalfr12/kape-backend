const fs = require("fs");
const path = require("path");
const config = require("../../../config");

const {Toko, User, Item, Image, PaymentMethod} = require("../../../models");
require("dotenv").config();

const imgDir = config.imagePath;

module.exports = {
 getToko: async (req, res, next) => {
  if (req.params.toko_id === "item") {
   return next(); // Lanjutkan ke rute berikutnya
  }

  const includeOptions = [
   {
    model: User,
    as: "pemilik", // Mengambil data pemilik toko
   },
   {
    model: User,
    as: "pengelola", // Mengambil data pengelola yang bekerja di toko ini
   },
   {
    model: Item,
    as: "items", // Fetching items related to the store
    include: [
     {
      model: Image,
      as: "gambar", // Fetching images related to each item
      attributes: ["filename"], // Fetch only the filename of the images
     },
    ],
   },
  ];

  // Jika user adalah pemilik, tambahkan PaymentMethod ke dalam includeOptions
  if (req.user) {
   includeOptions.push({
    model: PaymentMethod,
    as: "payment_methods",
   });
  }

  const dataToko = await Toko.findOne({
   where: {
    [req?.user?.role === "pemilik" ? "user_id" : "toko_id"]:
     req?.user?.role === "pemilik"
      ? req?.user?.user_id
      : req?.params?.toko_id || req?.user?.toko_id,
   },
   include: includeOptions,
  });

  if (!dataToko)
   return res.status(404).json({
    message: req?.user ? "Anda belum mempunyai toko" : "Toko not found",
   });

  const dataTokoJson = JSON.parse(JSON.stringify(dataToko));
  dataTokoJson.pengelola = dataTokoJson.pengelola.filter(
   (a) => a.role !== "pemilik"
  );
  dataTokoJson.items.map((d, i) => {
   d.gambar = d.gambar.map(
    (a) => `${process.env.BASE_URL}/images/${a.filename}`
   )[0];
  });
  res.status(200).json(dataTokoJson);
 },

 createToko: async (req, res, next) => {
  try {
   const payload = req.body;

   const dataToko = await Toko.findOne({where: {user_id: req.user.user_id}});

   if (req.user?.toko_id) {
    return res.status(422).json({
     message: "Anda sedang mengelola sebuah toko",
    });
   }

   if (dataToko) {
    return res
     .status(422)
     .json({message: "Anda sudah memiliki toko", dataToko});
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

 getItems: async (req, res, next) => {
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

   if (dataItemJson.length == 0) return res.status(404).json({});

   dataItemJson.map((d, i) => {
    d.toko = d.toko.name;
    d.gambar = d.gambar.map(
     (a) => `${process.env.BASE_URL}/images/${a.filename}`
    )[0];
    return dataItemJson;
   });

   function cleanCategory(category) {
    return category
     .toLowerCase() // Convert to lowercase
     .replace(/[-_]/g, " ") // Replace dashes and underscores with spaces
     .replace(/[^\w\s]/g, "") // Remove punctuation
     .trim() // Remove leading and trailing spaces
     .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
   }

   const dataType = [...new Set(dataItemJson.map((d) => d.type))];

   const dataByTypeKategori = dataType.reduce((acc, t) => {
    const categorizedItems = dataItemJson
     .filter((a) => a.type === t)
     .reduce((catAcc, item) => {
      const cleanedCategory = cleanCategory(item.kategori);

      if (!catAcc[cleanedCategory]) {
       catAcc[cleanedCategory] = [];
      }

      catAcc[cleanedCategory].push(item);
      return catAcc;
     }, {});

    acc[t] = categorizedItems;
    return acc;
   }, {});

   return res.status(200).json(dataByTypeKategori);
  } catch (error) {
   return res
    .status(500)
    .json({message: error.message || "Internal server error!"});
  }
 },

 getItem: async (req, res, next) => {
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

 createItem: async (req, res, next) => {
  if (!fs.existsSync(imgDir)) {
   fs.mkdirSync(imgDir, {recursive: true});
  }

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

   const imageData = await Promise.all(
    req.files.map(async (file, i) => {
     if (file.fieldname !== "gambar") return;

     const image_id = Date.now() + i;

     const newFileName = `${image_id}${path.extname(file.originalname)}`;
     const savePath = path.join(imgDir, newFileName);

     fs.copyFileSync(file.path, savePath);
     fs.unlinkSync(file.path);

     const dataImage = await Image.create({
      image_id: image_id,
      item_id,
      filename: newFileName,
      path: savePath,
      created_by: req.user.user_id,
      updated_by: req.user.user_id,
     });

     return `${process.env.BASE_URL}/images/${dataImage.filename}`;
    })
   );
   const dataItemJson = JSON.parse(JSON.stringify(dataItem));
   dataItemJson.gambar = imageData;
   return res.status(201).json(dataItemJson);
  } catch (error) {
   console.log(error);
   res.status(500).json({
    message: error.message || `Internal server error!`,
    error: error,
   });
  }
 },
};
