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
 getActivity: async (req, res) => {
  const {tahun, bulan, tanggal} = req.params;
  console.log(tahun, bulan, tanggal);
  try {
   const attributes = {
    exclude: ["updated_at", "updated_by", "deleted_at", "deleted_by"],
   };
   const dataTransaksi = await Transaksi.findAll({
    where: {toko_id: req.user.toko_id},
    include: [
     {
      model: User,
      as: "kasir",
      attributes: {
       exclude: ["updated_at", "updated_by", "deleted_at", "deleted_by"],
      },
     },
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
    attributes: {
     exclude: ["updated_at", "updated_by", "deleted_at", "deleted_by"],
    },
   });

   const dataTransaksiJson = JSON.parse(JSON.stringify(dataTransaksi));

   const filteredDataTransaksi = dataTransaksiJson.filter((item) => {
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

   filteredDataTransaksi.map((d, i) => {
    d.kasir = d.kasir.fullname;
    d.qr = `${process.env.BASE_URL}/qr/${d.transaksi_id}`;
   });

   const data_pendapatan = filteredDataTransaksi.flatMap((trans) =>
    trans.items.map((item) => ({
     transaksi_id: trans.transaksi_id,
     user_id: trans.user_id,
     toko_id: trans.toko_id,
     pelanggan: trans.pelanggan,
     total_harga_transaksi: trans.total_harga,
     payment_method: trans.payment_method,
     qr: trans.qr,
     created_at: trans.created_at,
     created_by: trans.created_by,
     kasir: trans.kasir,
     // Data item
     item_transaksi_id: item.item_transaksi_id,
     item_id: item.item_id,
     jumlah: item.jumlah,
     jumlah_harga_item: item.jumlah_harga,
     harga_item: item.harga,
     // Data produk dari item
     produk_name: item.item.name,
     produk_deskripsi: item.item.deskripsi,
     produk_kategori: item.item.kategori,
     produk_type: item.item.type,
     // Data transaksi
     status_transaksi: trans.status,
     transaksi_at: trans.transaksi_at,
     type: "pendapatan",
    }))
   );

   const dataPengeluaran = await Pengeluaran.findAll({
    where: {toko_id: req.user.toko_id},
   });

   const dataPengeluaranJson = JSON.parse(JSON.stringify(dataPengeluaran));

   const filteredDataPengeluaran = dataPengeluaranJson.filter((item) => {
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

   const data_pengeluaran = filteredDataPengeluaran.map((d) => {
    d.type = "pengeluaran";
    return d;
   });

   const total_pengeluaran = data_pengeluaran.reduce(
    (total, item) => total + item.total_harga,
    0
   );

   const total_pendapatan = data_pendapatan.reduce(
    (total, item) => total + item.total_harga_transaksi,
    0
   );

   const combinedData = data_pendapatan.concat(data_pengeluaran);

   //  const chart = {{
   //     labels: [' 1', ' 2', ' 3', ' 4', ' 5', ' 6'], // change to cost
   //     datasets: [
   //         {
   //             data: [1, 7, 6, 4, 2, 5], // change to time, if tanggal diberikan jam, if bulan berikan tanggal, if tahun berikan bulan
   //             strokeWidth: 2,
   //             color: (opacity = 1) => `rgba(255,0,0,${opacity})`, // optional
   //         },
   //         {
   //             data: [2, 4, 6, 8, 8, 2], // change to time, if tanggal diberikan jam, if bulan berikan tanggal, if tahun berikan bulan
   //             strokeWidth: 2,
   //             color: (opacity = 1) => `rgba(0,0,102, ${opacity})`, // optional
   //         }
   //     ],
   //     legend: ['Pendapatan', 'Pengeluaran'],
   // }}

   const data = combinedData.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
   );

   const labels = Array.from(
    new Set(
     data.map((d) => {
      const created_at = new Date(d.created_at);
      if (tanggal) {
       return `${String(created_at.getHours()).padStart(2, "0")}:${String(
        created_at.getMinutes()
       ).padStart(2, "0")}`;
      }
      if (bulan) {
       return created_at.getDate();
      }
      if (tahun) {
       return created_at.getMonth() + 1;
      }
     })
    )
   );

   const datasets = [
    {
     data: Array(labels.length).fill(0), // pendapatan tergantung waktu if tanggal diberikan jam, if bulan berikan tanggal, if tahun berikan bulan
     strokeWidth: 2,
     color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, //green
    },
    {
     data: Array(labels.length).fill(0),
     strokeWidth: 2,
     color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, // red
    },
   ];

   // Mapping data activity ke datasets berdasarkan labels
   data.forEach((activity) => {
    const created_at = new Date(activity.created_at);
    let timeLabel;

    // Sesuaikan label berdasarkan parameter opsional
    if (tanggal) {
     timeLabel = `${String(created_at.getHours()).padStart(2, "0")}:${String(
      created_at.getMinutes()
     ).padStart(2, "0")}`;
    } else if (bulan) {
     timeLabel = created_at.getDate();
    } else if (tahun) {
     timeLabel = created_at.getMonth() + 1;
    }

    // Cari indeks dari label yang sesuai dengan waktu activity
    const labelIndex = labels.indexOf(timeLabel);

    if (labelIndex !== -1) {
     if (activity.type === "pendapatan") {
      // Menambahkan total_harga_transaksi ke dataset pendapatan
      datasets[0].data[labelIndex] += activity.total_harga_transaksi;
     } else if (activity.type === "pengeluaran") {
      // Menambahkan total_harga ke dataset pengeluaran
      datasets[1].data[labelIndex] += activity.total_harga;
     }
    }
   });

   const chart = {
    labels,
    datasets,
    legend: ["Pendapatan", "Pengeluaran"],
   };

   return res.status(200).json({
    total_pendapatan,
    total_pengeluaran,
    data,
    chart,
   });
  } catch (error) {
   return res
    .status(500)
    .json({message: error.message || "Internal server error!"});
  }
 },
};
