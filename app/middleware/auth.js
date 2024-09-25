const config = require("../../config");
const jwt = require("jsonwebtoken");

const {User, Logger} = require("../../models");

const isLoginUser = async (req, res, next) => {
 try {
  const token = req.headers.authorization
   ? req.headers.authorization.replace("Bearer ", "")
   : null;

  const data = jwt.verify(token, config.jwtKey);

  console.log(data);
  //   const exp = data.iat + 60 * 60 * 12; // 12 jam
  const exp = data.iat + 60; // 1 menit
  const currentTime = Math.floor(Date.now() / 1000);
  const timeLeft = exp - currentTime;
  console.log({iat: data.iat, exp, currentTime, timeLeft});

  if (timeLeft < 0) {
   return res.status(401).json({
    error: "Token expired",
   });
  }

  const user = await User.findOne({
   where: {
    user_id: data.user.user_id,
   },
  });

  if (user) {
   let getLogs;
   do {
    charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    log_id = user.fullname.charAt(0);
    for (var i = 0, n = charset.length; i < 8; ++i) {
     log_id += charset.charAt(Math.floor(Math.random() * n));
    }

    getLogs = await Logger.findOne({where: {log_id}});
   } while (getLogs !== null);

   await Logger.create({
    log_id,
    user_id: user.user_id,
    method: req.method,
    url: req.originalUrl,
    body: JSON.stringify(req.body),
    params: JSON.stringify(req.params),
    query: JSON.stringify(req.query),
    headers: JSON.stringify(req.headers),
    cookies: JSON.stringify(req.cookies),
    files: JSON.stringify(req.files),
    ip_address: req.ip,
   });

   user.last_activity = new Date();
   await user.save();

   req.user = user;
   req.token = token;
   next();
  } else {
   throw new Error();
  }
 } catch (error) {
  return res.status(401).json({
   error: "Not authorized to access this resources",
  });
 }
};

module.exports = {
 isLoginUser,
};
