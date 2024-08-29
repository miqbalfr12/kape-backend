const {Toko, User} = require("../../../models");
const {register} = require("./auth");

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
   console.log(payload);

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
};
