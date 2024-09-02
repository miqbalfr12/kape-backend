const {Toko, User} = require("../../../models");
const {register} = require("./auth");
require("dotenv").config();

module.exports = {
 getKasir: async (req, res, next) => {
  const dataKasir = await User.findAll({
   where: {toko_id: req.user.toko_id, role: "kasir"},
  });
  if (dataKasir) res.status(200).json(dataKasir);
  else res.status(404).json({message: "Kasir not found"});
 },

 createKasir: async (req, res, next) => {
  try {
   const dataToko = await Toko.findOne({where: {user_id: req.user.user_id}});
   if (dataToko === null) {
    return res.status(404).json({message: "User does not have toko"});
   } else {
    req.body.created_by = req.user.user_id;
    req.body.updated_by = req.user.user_id;
    req.body.role = "kasir";
    req.body.toko_id = dataToko.toko_id;

    await register(req, res, next);
   }
  } catch (error) {
   res.status(500).json({
    message: error.message || `Internal server error!`,
   });
  }
 },
};
