const cleanCategory = require("../../../helper/clean-category");
const {Toko, Item, Image} = require("../../../models");
require("dotenv").config();

module.exports = {
 getItems: async (req, res) => {
  try {
   const dataItem = await Item.findAll({
    where: {
     status: "visible", // Kondisi untuk hanya mengambil item dengan status "visible"
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
    attributes: {
     exclude: [
      "status",
      "created_at",
      "created_by",
      "updated_at",
      "updated_by",
      "deleted_at",
      "deleted_by",
     ],
    },
   });
   const dataItemJson = JSON.parse(JSON.stringify(dataItem));

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

   res.status(200).json(dataByTypeKategori);
  } catch (error) {
   res.status(500).json({
    message: error.message || `Internal server error!`,
   });
  }
 },

 getItem: async (req, res) => {
  try {
   const dataItem = await Item.findOne({
    where: {item_id: req.params.item_id},
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
};
