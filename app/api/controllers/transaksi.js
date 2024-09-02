const {Item, Transaksi, ItemTransaksi} = require("../../../models");
require("dotenv").config();

module.exports = {
 createTransaksi: async (req, res, next) => {
  try {
   const payload = req.body;
   const list_item_id = payload.list_item.map((a) => a.item_id);
   const dataItem = await Item.findAll({where: {item_id: list_item_id}});
   const dataItemJson = JSON.parse(JSON.stringify(dataItem));

   let getTransaksi;
   do {
    charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    transaksi_id = req.user.toko_id.charAt(0);
    for (var i = 0, n = charset.length; i < 8; ++i) {
     transaksi_id += charset.charAt(Math.floor(Math.random() * n));
    }

    getTransaksi = await Transaksi.findOne({where: {transaksi_id}});
   } while (getTransaksi !== null);

   const list_item_transaksi = await Promise.all(
    payload.list_item.map(async (a) => {
     const harga = dataItemJson.find((b) => b.item_id === a.item_id).harga;

     const item_transaksi = {
      transaksi_id,
      item_id: a.item_id,
      jumlah: a.jumlah,
      harga,
      jumlah_harga: a.jumlah * harga,
      created_by: req.user.user_id,
      updated_by: req.user.user_id,
     };

     return item_transaksi;
    })
   );

   const total_harga = list_item_transaksi.reduce(
    (a, b) => a + b.jumlah_harga,
    0
   );

   const transaksi = {
    transaksi_id,
    user_id: req.user.user_id,
    toko_id: req.user.toko_id,
    transaksi_at: Date.now(),
    pelanggan: payload.pelanggan,
    total_harga,
    payment_method: payload.payment_method,
    qr: transaksi_id,
    created_by: req.user.user_id,
    updated_by: req.user.user_id,
   };

   await Transaksi.create(transaksi).then(async (transaksi) => {
    const item_transaksi = await Promise.all(
     list_item_transaksi.map(async (a, t) => {
      let getItemTransaksi;
      let item_transaksi_id;
      do {
       charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
       item_transaksi_id = req.user.toko_id.charAt(0);
       for (var i = 0, n = charset.length; i < 8; ++i) {
        item_transaksi_id += charset.charAt(Math.floor(Math.random() * n));
       }

       getItemTransaksi = await ItemTransaksi.findOne({
        where: {item_transaksi_id},
       });
      } while (getItemTransaksi !== null);

      const dataItemTransaksi = await ItemTransaksi.create({
       item_transaksi_id,
       ...a,
      });

      return dataItemTransaksi;
     })
    );

    transaksi.qr = `${process.env.BASE_URL}/qr/${transaksi_id}`;

    return res.status(201).json({
     message: "Transaksi created successfully",
     transaksi,
     item_transaksi,
    });
   });
  } catch (error) {
   return res
    .status(500)
    .json({message: error.message || "Internal server error!"});
  }
 },

 getTransaksi: async (req, res) => {
  try {
   const dataTransaksi = await Transaksi.findAll({
    where: {toko_id: req.user.toko_id},
    attributes: {
     exclude: [
      "created_at",
      "created_by",
      "updated_at",
      "updated_by",
      "deleted_at",
      "deleted_by",
     ],
    },
   });
   if (!dataTransaksi) res.status(404).json({message: "Transaksi not found"});
   const dataTransaksiJson = JSON.parse(JSON.stringify(dataTransaksi));
   dataTransaksiJson.map((d, i) => {
    d.qr = `${process.env.BASE_URL}/qr/${d.transaksi_id}`;
   });

   return res.status(200).json(dataTransaksiJson);
  } catch (error) {
   return res
    .status(500)
    .json({message: error.message || "Internal server error!"});
  }
 },

 getTransaksiDetail: async (req, res) => {
  try {
   const attributes = {
    exclude: [
     "created_at",
     "created_by",
     "updated_at",
     "updated_by",
     "deleted_at",
     "deleted_by",
    ],
   };
   const dataTransaksi = await Transaksi.findOne({
    where: {transaksi_id: req.params.transaksi_id},
    include: [
     {
      model: ItemTransaksi,
      as: "items",
      include: [
       {
        model: Item,
        as: "item",
        attributes,
       },
      ],
      attributes,
     },
    ],
    attributes,
   });
   if (!dataTransaksi) res.status(404).json({message: "Transaksi not found"});
   const dataTransaksiJson = JSON.parse(JSON.stringify(dataTransaksi));
   return res.status(200).json(dataTransaksiJson);
  } catch (error) {
   return res
    .status(500)
    .json({message: error.message || "Internal server error!"});
  }
 },
};
