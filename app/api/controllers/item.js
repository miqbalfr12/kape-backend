const {Toko, User, Item, Image} = require("../../../models");
require("dotenv").config();

module.exports = {
 getItem: async (req, res) => {
  try {
   const dataItem = await Item.findAll({
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
    delete d.created_at;
    delete d.created_by;
    delete d.updated_at;
    delete d.updated_by;
    delete d.deleted_at;
    delete d.deleted_by;
    delete d.status;
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

   res.status(200).json(dataByTypeKategori);
  } catch (error) {
   res.status(500).json({
    message: error.message || `Internal server error!`,
   });
  }
 },
};
