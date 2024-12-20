const fs = require("fs");
const path = require("path");
const config = require("../../../config");

const {
 Toko,
 User,
 Item,
 Image,
 PaymentMethod,
 Transaksi,
 Pengeluaran,
} = require("../../../models");

const cleanCategory = require("../../../helper/clean-category");
const {where} = require("sequelize");

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
    where: {deleted_by: null},
    required: false,
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
  if (req?.user) {
   includeOptions.push({
    model: PaymentMethod,
    as: "payment_methods",
   });
   includeOptions.push({
    model: Transaksi,
    as: "transaksi",
   });
   includeOptions.push({
    model: Pengeluaran,
    as: "pengeluaran",
   });
  }

  const dataToko = await Toko.findOne({
   where: {
    [req.user?.role === "pemilik" ? "user_id" : "toko_id"]:
     req.user?.role === "pemilik"
      ? req.user?.user_id
      : req.params?.toko_id || req.user?.toko_id,
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
   d.toko = dataToko.name;
   d.gambar = d.gambar.map(
    (a) => `${process.env.BASE_URL}/images/${a.filename}`
   )[0];
  });

  const dataItemJson = JSON.parse(JSON.stringify(dataTokoJson.items));

  const dataType = [...new Set(dataItemJson.map((d) => d.type))];

  const dataTypeKategori = dataType.reduce((acc, key) => {
   acc[key] = [];
   return acc;
  }, {});

  const dataByTypeKategori = dataType.reduce((acc, t) => {
   const categorizedItems = dataItemJson
    .filter((a) => a.type === t)
    .reduce((catAcc, item) => {
     const cleanedCategory = cleanCategory(item.kategori);

     console.log(t, cleanedCategory);
     if (!dataTypeKategori[t].includes(cleanedCategory))
      dataTypeKategori[t].push(cleanedCategory);

     if (!catAcc[cleanedCategory]) {
      catAcc[cleanedCategory] = [];
     }

     catAcc[cleanedCategory].push(item);
     return catAcc;
    }, {});

   acc[t] = categorizedItems;
   return acc;
  }, {});

  if (req?.user) {
   dataTokoJson.kategori = dataTypeKategori;
   dataTokoJson.balance =
    dataTokoJson.transaksi
     .filter((a) => a.status === "completed")
     .map((a) => a.total_harga)
     .reduce((a, b) => a + b, 0) -
    dataTokoJson.pengeluaran
     .map((a) => a.total_harga)
     .reduce((a, b) => a + b, 0);
   dataTokoJson.transaksi = dataTokoJson.transaksi.length;
   dataTokoJson.pengeluaran = dataTokoJson.pengeluaran.length;
  }

  dataTokoJson.items = dataByTypeKategori;

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

 updateToko: async (req, res, next) => {
  const dataToko = await Toko.findOne({
   where: {
    [req.user?.role === "pemilik" ? "user_id" : "toko_id"]:
     req.user?.role === "pemilik"
      ? req.user?.user_id
      : req.params?.toko_id || req.user?.toko_id,
   },
  });

  if (!dataToko) {
   return res.status(404).json({message: "Toko not found"});
  }

  const payload = req.body;

  dataToko.set(payload);
  dataToko.updated_by = req.user.user_id;
  const dataTokoNew = await dataToko.save();

  return res.status(200).json(dataTokoNew);
 },

 getItems: async (req, res, next) => {
  if (!req.user.toko_id) {
   return res.status(404).json({message: "User does not have toko"});
  }

  try {
   // Mengambil semua item yang dimiliki oleh toko tertentu
   const dataItem = await Item.findAll({
    where: {toko_id: req.user.toko_id, deleted_by: null},
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

   if (!dataItem) {
    return res.status(404).json({message: "Item not found"});
   }

   const dataItemJson = JSON.parse(JSON.stringify(dataItem));

   if (dataItemJson.length == 0) return res.status(404).json({});

   dataItemJson.map((d, i) => {
    d.toko = d.toko.name;
    d.gambar = d.gambar.map(
     (a) => `${process.env.BASE_URL}/images/${a.filename}`
    )[0];
    return dataItemJson;
   });

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
    where: {
     toko_id: req.user.toko_id,
     item_id: req.params.item_id,
     deleted_by: null,
    },
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
   if (!dataItem) {
    return res.status(404).json({message: "Item not found"});
   }

   const dataItemJson = JSON.parse(JSON.stringify(dataItem));
   dataItemJson.toko = dataItemJson.toko.name;
   dataItemJson.gambar = dataItemJson.gambar.map(
    (a) => `${process.env.BASE_URL}/images/${a.filename}`
   );

   res.status(200).json(dataItemJson);
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

   if (!req.files) {
    return res.status(422).json({message: "No images file uploaded"});
   }

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

 deleteItem: async (req, res, next) => {
  if (!req.user.toko_id) {
   return res.status(404).json({message: "User does not have toko"});
  }
  try {
   const dataItem = await Item.findOne({
    where: {toko_id: req.user.toko_id, item_id: req.params.item_id},
   });

   dataItem.deleted_at = new Date();
   dataItem.deleted_by = req.user.user_id;

   await dataItem.save();
   if (dataItem) return res.status(204).json(dataItem);
   else return res.status(404).json({message: "Item not found"});
  } catch (error) {
   return res
    .status(500)
    .json({message: error.message || "Internal server error!"});
  }
 },

 editItem: async (req, res, next) => {
  if (!fs.existsSync(imgDir)) {
   fs.mkdirSync(imgDir, {recursive: true});
  }

  if (!req.user.toko_id) {
   return res.status(404).json({message: "User does not have toko"});
  }

  try {
   const dataItem = await Item.findOne({
    where: {toko_id: req.user.toko_id, item_id: req.params.item_id},
    include: [
     {
      model: Image,
      as: "gambar",
      attributes: ["filename"],
     },
    ],
   });
   if (!dataItem) {
    return res.status(404).json({message: "Item not found"});
   }

   const payload = {
    ...req.body,
    updated_at: new Date(),
    updated_by: req.user.user_id,
   };

   for (const [key, value] of Object.entries(payload)) {
    if (value) {
     dataItem[key] = value;
    }
   }

   const listDataGambar = dataItem.gambar;

   if (req.files.gambar) {
    const listFilename = listDataGambar.map((item) => item.filename);
    console.log(listFilename);
    for (const [index, file] of req.files.gambar.entries()) {
     console.log(file.originalname);
     console.log(listFilename.includes(file.originalname));
     if (listFilename.includes(file.originalname)) {
      console.log("edit image " + file.originalname);
      const filename = file.originalname;
      const image_id = filename.split(".")[0];
      const newFileName = `${image_id}${path.extname(file.originalname)}`;
      const savePath = path.join(imgDir, newFileName);
      fs.copyFileSync(file.path, savePath);
      fs.unlinkSync(file.path);
      const imageUp = await Image.update(
       {
        filename: newFileName,
        path: savePath,
        updated_by: req.user.user_id,
        updated_at: new Date(),
       },
       {
        where: {
         image_id: image_id,
        },
       }
      );
      console.log(imageUp);
     } else {
      console.log("create");
      const image_id = Date.now() + index;
      const newFileName = `${image_id}${path.extname(file.originalname)}`;
      const savePath = path.join(imgDir, newFileName);
      fs.copyFileSync(file.path, savePath);
      fs.unlinkSync(file.path);

      await Image.create({
       image_id: image_id,
       item_id: req.params.item_id,
       filename: newFileName,
       path: savePath,
       created_by: req.user.user_id,
       updated_by: req.user.user_id,
      });
     }
    }
   }

   if (payload?.["delete-image"]) {
    (Array.isArray(payload["delete-image"])
     ? payload["delete-image"]
     : [payload["delete-image"]]
    ).forEach(async (url) => {
     const filename = url.split("/").pop();
     listDataGambar.map((item, index) => {
      if (item.filename === filename) {
       const deteleImageId = filename.split(".")[0];
       Image.destroy({
        where: {
         image_id: deteleImageId,
        },
       });
       console.log("deleted image: ", item.filename);
      }
     });
    });
   }

   await dataItem.save();
   const dataSegar = await Item.findOne({
    where: {toko_id: req.user.toko_id, item_id: req.params.item_id},
    include: [
     {
      model: Image,
      as: "gambar",
      attributes: ["filename"],
     },
     {
      model: Toko,
      as: "toko",
      attributes: ["name"],
     },
    ],
   });
   const dataItemJson = dataSegar.toJSON();
   dataItemJson.toko = dataItemJson.toko.name;
   dataItemJson.gambar = dataItemJson.gambar.map(
    (a) => `${process.env.BASE_URL}/images/${a.filename}`
   );

   return res.status(200).json(dataItemJson);
  } catch (error) {
   return res
    .status(500)
    .json({message: error.message || "Internal server error!"});
  }
 },
};
