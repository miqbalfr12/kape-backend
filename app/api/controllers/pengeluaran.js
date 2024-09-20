const {
 Item,
 Transaksi,
 ItemTransaksi,
 PaymentMethod,
 Pengeluaran,
 User,
} = require("../../../models");
require("dotenv").config();

module.exports = {
 createPengeluaran: async (req, res) => {
  try {
   if (req.user.toko_id === null) {
    return res.status(404).json({message: "User does not have toko"});
   }

   const data = Array.isArray(req.body) ? req.body : [req.body];
   const processedData = await Promise.all(
    data.map(async (item) => {
     let getPengeluaran;
     let pengeluaran_id;
     do {
      charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      pengeluaran_id = req.user.fullname.charAt(0);
      for (var i = 0, n = charset.length; i < 8; ++i) {
       pengeluaran_id += charset.charAt(Math.floor(Math.random() * n));
      }
      item.pengeluaran_id = pengeluaran_id;

      getPengeluaran = await Pengeluaran.findOne({where: {pengeluaran_id}});
     } while (getPengeluaran !== null);

     item.pengeluaran_id = `${req.user.toko_id}-${Math.floor(
      Math.random() * 1000
     )}`;
     item.toko_id = req.user.toko_id;
     item.created_by = req.user.user_id;
     item.updated_by = req.user.user_id;
     item.deleted_by = req.user.user_id;

     return item;
    })
   );

   const dataPengeluaran = await Pengeluaran.bulkCreate(processedData);

   return res.status(200).json({
    message: "Pengeluaran created",
    data,
    dataPengeluaran,
    user: req.user,
   });
  } catch (error) {
   return res.status(500).json({message: error.message});
  }
 },
 getPengeluaran: async (req, res) => {
  const {tahun, bulan, tanggal} = req.params;
  console.log(tahun, bulan, tanggal);
  try {
   if (req.user.toko_id === null) {
    return res.status(404).json({message: "User does not have toko"});
   }

   const data = await Pengeluaran.findAll({
    where: {toko_id: req.user.toko_id},
   });

   const filteredData = data.filter((item) => {
    const createdAt = new Date(item.created_at);

    // Jika tahun diberikan, filter berdasarkan tahun
    if (tahun && createdAt.getFullYear() !== parseInt(tahun)) {
     return false;
    }

    // Jika bulan diberikan, filter berdasarkan bulan (ingat: bulan di JS dimulai dari 0)
    if (bulan && createdAt.getMonth() + 1 !== parseInt(bulan)) {
     return false;
    }

    // Jika tanggal diberikan, filter berdasarkan tanggal
    if (tanggal && createdAt.getDate() !== parseInt(tanggal)) {
     return false;
    }

    return true;
   });

   const total_pengeluaran = filteredData.reduce(
    (total, item) => total + item.total_harga,
    0
   );

   return res.status(200).json({total_pengeluaran, data: filteredData});
  } catch (error) {
   return res
    .status(500)
    .json({message: error.message || "Internal server error!"});
  }
 },
};
