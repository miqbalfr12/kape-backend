const {response} = require("express");
const {
 Item,
 Transaksi,
 ItemTransaksi,
 PaymentMethod,
 Toko,
 Pengeluaran,
 User,
} = require("../../../models");
require("dotenv").config();

const activity = async ({toko_id, tahun, bulan, tanggal, needToko}) => {
 try {
  const attributes = {
   exclude: ["updated_at", "updated_by", "deleted_at", "deleted_by"],
  };
  const dataTransaksi = await Transaksi.findAll({
   where: {toko_id: toko_id},
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
   where: {toko_id: toko_id},
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
   (total, item) => total + item.jumlah_harga_item,
   0
  );

  const combinedData = data_pendapatan.concat(data_pengeluaran);

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
     return created_at.getFullYear();
    })
   )
  ).reverse();

  const datasets = [
   {
    data: Array(labels.length).fill(0), // pendapatan tergantung waktu if tanggal diberikan jam, if bulan berikan tanggal, if tahun berikan bulan
    strokeWidth: 2,
   },
   {
    data: Array(labels.length).fill(0),
    strokeWidth: 2,
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
   } else {
    timeLabel = created_at.getFullYear();
   }

   // Cari indeks dari label yang sesuai dengan waktu activity
   const labelIndex = labels.indexOf(timeLabel);

   if (labelIndex !== -1) {
    if (activity.type === "pendapatan") {
     // Menambahkan total_harga_transaksi ke dataset pendapatan
     datasets[0].data[labelIndex] += activity.jumlah_harga_item;
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

  const response = {
   data: {
    total_pendapatan,
    total_pengeluaran,
    data,
    chart,
   },
   statusCode: 200,
  };

  if (needToko) {
   const dataToko = await Toko.findOne({
    where: {
     toko_id: toko_id,
    },
   });
   response.toko = dataToko;
  }
  return response;
 } catch (error) {
  return {
   data: {message: error.message || "Internal server error!"},
   statusCode: 500,
  };
 }
};

module.exports = {
 getActivity: async (req, res, next) => {
  const {tahun, bulan, tanggal} = req.params;
  if (tahun === "laporan") return next();
  const response = await activity({
   toko_id: req.user.toko_id,
   tahun,
   bulan,
   tanggal,
  });
  return res.status(response.statusCode).json(response.data);
 },
 getLaporan: async (req, res) => {
  const {tahun, bulan, tanggal} = req.params;
  const response = await activity({
   toko_id: req.user.toko_id,
   tahun,
   bulan,
   tanggal,
   needToko: true,
  });

  const paginateData = (data) => {
   console.log({data: data.length});
   const pages = [];

   // Ambil halaman pertama dengan 14 data
   const firstPage = data.slice(0, 10);
   pages.push(firstPage);

   // Ambil halaman-halaman berikutnya dengan 20 data
   let remainingData = data.slice(10);

   while (remainingData.length > 0) {
    pages.push(remainingData.slice(0, 15)); // Ambil 15 data per halaman
    remainingData = remainingData.slice(15); // Sisa data untuk halaman berikutnya
   }

   return pages;
  };
  const dataPerHalaman = paginateData(response.data.data);

  const rangkuman = (data) => {
   console.log({dataRangkuman: data.length});
   const ProdukTerjual = data.filter(
    (d) => d.type === "pendapatan" && d.produk_type === "produk"
   ).length;
   const JasaTerjual = data.filter(
    (d) => d.type === "pendapatan" && d.produk_type === "jasa"
   ).length;
   const JumlahPengeluaran = data.filter(
    (d) => d.type === "pengeluaran"
   ).length;
   const TotalPendapatan = data
    .filter((d) => d.type === "pendapatan")
    .reduce((a, b) => a + b.total_harga_transaksi, 0);
   const TotalPengeluaran = data
    .filter((d) => d.type === "pengeluaran")
    .reduce((a, b) => a + b.total_harga, 0);
   return `<table class='w-full'>
    <tr>
     <td class='bg-gray-100 px-4 py-1 text-sm text-center font-bold' colspan='6'>Rangkuman Halaman</td>
    </tr>
    <tr>
     <td class='bg-neutral-50 px-4 py-1 text-sm'>Produk Terjual</td>
     <td class='bg-neutral-50 px-4 py-1 text-sm text-end'>${ProdukTerjual} x</td>
     <td class='bg-white px-4 py-1 text-sm'></td>
     <td class='bg-neutral-50 px-4 py-1 text-sm'>Total Pendapatan</td>
     <td class='bg-neutral-50 px-4 py-1 text-sm'>Rp</td>
     <td class='bg-neutral-50 px-4 py-1 text-sm text-end'>${TotalPendapatan.toLocaleString(
      "id-ID"
     )}</td>
    </tr>
    <tr>
     <td class='bg-white px-4 py-1 text-sm'>Jasa Terjual</td>
     <td class='bg-white px-4 py-1 text-sm text-end'>${JasaTerjual} x</td>
     <td class='bg-white px-4 py-1 text-sm'></td>
     <td class='bg-white px-4 py-1 text-sm'>Total Pengeluaran</td>
     <td class='bg-white px-4 py-1 text-sm'>Rp</td>
     <td class='bg-white px-4 py-1 text-sm text-end'>${TotalPengeluaran.toLocaleString(
      "id-ID"
     )}</td>
    </tr>
    <tr>
     <td class='bg-neutral-50 px-4 py-1 text-sm'>Pengeluaran</td>
     <td class='bg-neutral-50 px-4 py-1 text-sm text-end'>${JumlahPengeluaran} x</td>
     <td class='bg-white px-4 py-1 text-sm'></td>
     <td class='bg-neutral-50 px-4 py-1 text-sm'>Saldo</td>
     <td class='bg-neutral-50 px-4 py-1 text-sm'>Rp</td>
     <td class='bg-neutral-50 px-4 py-1 text-sm text-end'>${(
      TotalPendapatan - TotalPengeluaran
     ).toLocaleString("id-ID")}</td>
    </tr>
   </table>`;
  };
  console.log(response.data.chart);
  const html = `<head>
 <script src='https://cdn.tailwindcss.com'></script>
 <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.6.0/Chart.min.js"></script>
 <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
 <style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
  @layer base {
   body {
    font-family: 'Montserrat', sans-serif;
   }
  }
  p {
   color: rgb(75 85 99);
  }
 </style>
</head>
<body>
<div class='w-[20.99cm] h-[29.7cm] max-w-[20.99cm] max-h-[29.7cm] p-0 m-0 flex flex-col '>
  <div
   class='w-full text-black mt-4 p-8 px-12 bg-gray-300 flex justify-end items-end'>
   <a href='https://reidteam.web.id'>
    <img
     class='w-[130px]'
     src='https://i.imgur.com/pEI52Mm.png' />
   </a>
  </div>
  <div class='m-6 mt-8'>
   <h1 class='text-4xl font-bold text-gray-800 py-2'>STATISTIK LAPORAN KEUANGAN</h1>
   <hr class='my-6 w-2/4 border border-8 border-gray-300 bg-gray-300' />
   <h2 class='text-xl font-semibold text-gray-600'>${response.toko.name}</h2>
   <p>Tanggal: ${tahun || "-"}/${bulan || "-"}/${tanggal || "-"}</p>
  </div>
  <div class='grow mx-6 flex flex-col-reverse justify-end'>
    <div id="myPlot" style="width:100%;height:400px"></div>
    <script>
      const xArray = ["Kategori 1", "Kategori 2", "Kategori 3", "Kategori 4", "Kategori 5"];
      const yArray = [55, 49, 44, 24, 15];

      const data = [{labels:xArray, values:yArray, hole:.4, type:"pie"}];

      Plotly.newPlot("myPlot", data, {},{displayModeBar: false});
    </script>
    <canvas id="myChart" style="width:100%;height:300px"/>
    <script>
        const xValues = [1 , 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
        new Chart("myChart", {
          type: "line",
          data: {
            labels: xValues,
            datasets: [{ 
              label: "Pengeluaran",
              data: [1300, 3800, 2800, 2700, 3000, 1600, 4000, 1700, 2100, 3500, 3200, 2500, 1000, 3300, 2900, 2600, 3700, 2000, 1200, 3100, 1900, 1400, 1800, 2300, 2200, 3900, 1500, 3600, 2400, 3400],
              borderColor: "red",
            }, { 
              label: "Pendapatan",
              data: [1200, 3000, 3700, 2400, 2900, 1400, 2700, 3200, 3400, 2200, 1300, 2500, 2100, 1500, 2300, 1600, 3100, 2800, 4000, 3600, 1700, 3900, 3300, 3800, 1800, 1000, 2600, 3500, 1900, 2000],
              borderColor: "green",
            }]
          },
          options: {
            animation: false,
            legend: {display: true}
          }
        });
      </script>
  </div>
  <div class='mx-6 my-2 text-center'>
   Dicetak pada tanggal: ${new Date().toLocaleString(
    "id-ID"
   )} | Halaman 1 dari ${dataPerHalaman.length + 1}
  </div>
  <div class='bg-black w-full text-white text-center'>Copyright © 2024 <a href='https://reidteam.web.id'>REID Team</a></div>
</div>
 ${dataPerHalaman
  .map((dataHalaman, indexHalaman) => {
   return `<div
  class='w-[20.99cm] h-[29.7cm] max-w-[20.99cm] max-h-[29.7cm] p-0 m-0 flex flex-col border-2'>
  ${
   indexHalaman == 0
    ? `<div
   class='w-full text-black mt-4 p-8 px-12 bg-gray-300 flex justify-end items-end'>
   <a href='https://reidteam.web.id'>
    <img
     class='w-[130px]'
     src='https://i.imgur.com/pEI52Mm.png' />
   </a>
  </div>
  <div class='m-6 mt-8'>
   <h1 class='text-4xl font-bold text-gray-800 py-2'>LAPORAN KEUANGAN</h1>
   <hr class='my-6 w-2/4 border border-8 border-gray-300 bg-gray-300' />
   <h2 class='text-xl font-semibold text-gray-600'>${response.toko.name}</h2>
   <p>Tanggal: ${tahun || "-"}/${bulan || "-"}/${tanggal || "-"}</p>
  </div>`
    : `
  <div class='m-6 mt-8'>

   <h2 class='text-xl font-semibold text-gray-600'>Laporan Keuangan - ${
    response.toko.name
   }</h2>
   <p>Tanggal: ${tahun || "-"}/${bulan || "-"}/${tanggal || "-"}</p>
  </div>`
  }
  <div class='mx-6 pb-2 mt-6 bg-gray-100'>
   <table class='table-auto w-full'>
    <thead>
     <tr clas="table-row">
      <td class='px-4 py-1 text-sm text-center font-bold'>No</td>
      <td class='px-4 py-1 text-sm text-center font-bold'>Tanggal</td>
      <td class='px-4 py-1 text-sm text-center font-bold w-full'>Keterangan</td>
      <td class='px-4 py-1 text-sm text-center font-bold' colspan='2' >Nominal</td>
     </tr>
    </thead>
    <tbody>
     <!-- untuk page 1 maximal 10 dataHalaman -->
     ${dataHalaman
      .map((data, index) => {
       const created_at = new Date(data.created_at);
       const keterangan = `${
        data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase()
       } - ${
        data.type == "pendapatan"
         ? `${
            data.produk_type.charAt(0).toUpperCase() +
            data.produk_type.slice(1).toLowerCase()
           } - ${data.produk_name}`
         : `${data.untuk} - ${data.keterangan}`
       }`;
       let color;
       if (index % 2 === 1) color = "bg-neutral-50";
       else color = "bg-white";
       return `
     <tr>
      <td class='${color} px-4 py-1 text-sm text-center'>${
        indexHalaman === 0 ? index + 1 : index + 11 + (indexHalaman - 1) * 15
       }</td>
      <td class='${color} px-4 py-1 text-sm text-center'>${created_at.toLocaleString(
        "id-ID",
        {
         year: "numeric",
         month: "numeric",
         day: "numeric",
         hour: "numeric",
         minute: "numeric",
         second: undefined, // Tidak perlu menyertakan detik
        }
       )}</td>
       <td class='${color} px-4 py-1 text-sm'>${keterangan.slice(0, 100)} ${
        keterangan.length > 100 ? "..." : ""
       }</td>
      <td class='${color} px-4 py-1 text-sm'>Rp</td>
      <td class='${color} px-4 py-1 text-sm text-end ${
        data.type == "pengeluaran" && "text-red-500"
       }'>${
        data.type == "pendapatan"
         ? data.jumlah_harga_item.toLocaleString("id-ID")
         : `-${data.total_harga.toLocaleString("id-ID")}`
       }</td>
     </tr>`;
      })
      .join("")}
    </tbody>
   </table>
  </div>
  <div class='mx-6 grow mt-6'>
      ${rangkuman(dataHalaman)}
  </div>
  <div class='mx-6 my-2 text-center'>
   Dicetak pada tanggal: ${new Date().toLocaleString("id-ID")} | Halaman ${
    indexHalaman + 2
   } dari ${dataPerHalaman.length + 1}
  </div>
  <div class='bg-black w-full text-white text-center'>
   Copyright © 2024 <a href='https://reidteam.web.id'>REID Team</a>
  </div>
 </div>`;
  })
  .join("")}
</body>
`;

  await fetch("https://whatsapp.reidteam.web.id/send-html-pdf", {
   method: "POST",
   headers: {
    "Content-Type": "application/json",
   },
   body: JSON.stringify({
    message: "Laporan!",
    number: req.user.phone_number,
    type: "@c.us",
    html: html,
    title: "Laporan-Keuangan-Toko",
   }),
  })
   .then((info) => console.log(info))
   .catch((err) => console.log(err));

  return res.status(200).json({
   message: "Success",
  });
 },
};
