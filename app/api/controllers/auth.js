const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const bcrypt = require("bcrypt");
const config = require("../../../config");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

const {User} = require("../../../models");

dotenv.config();

const salt = 10;

module.exports = {
 register: async (req, res, next) => {
  try {
   let payload = req.body;
   console.log(payload);

   const checkNIK = await User.findOne({where: {nik: payload.nik}});

   if (checkNIK === null) {
    const checkEmail = await User.findOne({where: {email: payload.email}});

    if (checkEmail === null) {
     let getUser;
     do {
      charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      user_id = payload.fullname.charAt(0);
      for (var i = 0, n = charset.length; i < 8; ++i) {
       user_id += charset.charAt(Math.floor(Math.random() * n));
      }

      getUser = await User.findOne({where: {user_id}});
     } while (getUser !== null);

     var length = 15;
     charset =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
     password = "";
     for (var i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
     }

     let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
       user: process.env.EMAIL,
       pass: process.env.PASSWORD,
      },
      tls: {
       rejectUnauthorized: false,
      },
     });

     let MailGenerator = new Mailgen({
      theme: {
       path: path.resolve("assets/theme.html"),
      },
      product: {
       username: payload.fullname,
       password: password,
       title: "Daftar akun Anda telah berhasil!",
       paragraph: [
        "Dengan hormat, kami ingin menginformasikan bahwa pendaftaran akun Anda telah berhasil",
        "Silakan masuk dengan menggunakan password di bawah ini.",
       ],
       name: "REID Team",
       link: "https://reidteam.web.id",
      },
     });

     let response = {
      product: {
       name: "REID Team",
       link: "https://reidteam.web.id",
       logo: "https://reidteam.web.id/reidteam.svg",
       logoHeight: "80px",
      },
      body: {
       name: payload.fullname,
       intro:
        "Selamat datang di REID Team! Daftar akun Anda telah berhasil. Silakan masuk dengan menggunakan password di bawah ini.",
       dictionary: {
        Password: password,
       },
       action: {
        instructions: "Klik tombol di bawah untuk melanjutkan ke proses masuk.",
        button: {
         color: "#1E90FF",
         text: "Masuk Sekarang",
         link: "https://reidteam.web.id",
        },
       },
       signature: "Hormat Kami",
      },
     };

     let mail = MailGenerator.generate(response);

     let message = {
      from: process.env.EMAIL_FROM,
      to: payload.email,
      subject: "Daftar Akun Berhasil, Silahkan Lihat Password!",
      html: mail,
     };

     bcrypt.hash(password, salt, async (err, hash) => {
      if (err) throw error;

      payload = {
       ...payload,
       user_id,
       password: hash,
       created_by: payload.created_by || user_id,
       updated_by: payload.updated_by || user_id,
      };

      await User.create(payload);

      transporter
       .sendMail(message)
       .then((info) => {
        return res.status(201).json({
         message: "Daftar berhasil, Email pendaftaran telah terkirim.",
         password,
        });
       })
       .catch((error) => {
        return res.status(500).json({error});
       });
     });
    } else {
     return res.status(422).json({
      message: "Email yang digunakan sudah terdaftar!",
     });
    }
   } else {
    return res.status(422).json({
     message: "NIK sudah digunakan sebelumnya!",
    });
   }
  } catch (err) {
   console.log(err);
   if (err && err.name === "ValidationError") {
    return res.status(422).json({
     error: 1,
     message: err.message,
     fields: err.errors,
    });
   }
   next(err);
  }
 },

 signIn: async (req, res) => {
  try {
   const {email, password} = req.body;

   const getUser = await User.findOne({where: {email}});

   if (getUser !== null) {
    bcrypt.compare(password, getUser.password, async (error, response) => {
     if (response) {
      const token = jwt.sign(
       {
        user: {
         user_id: getUser.user_id,
         nik: getUser.nik,
         fullname: getUser.fullname,
         email: getUser.email,
         birth_date: getUser.birth_date,
         phone_number: getUser.phone_number,
        },
       },
       config.jwtKey
      );

      await User.update(
       {last_signin: new Date(), status: "verified", update_at: new Date()},
       {
        where: {
         user_id: getUser.user_id,
        },
       }
      );

      res.status(200).json({
       data: {
        token,
       },
      });
     } else {
      res.status(403).json({
       message: "Password yang anda masukkan salah!",
      });
     }
    });
   } else {
    res.status(403).json({
     message: "email yang anda masukkan belum terdaftar.",
    });
   }
  } catch (error) {
   res.status(500).json({
    message: error.message || `Internal server error!`,
   });
  }
 },

 resetPassword: async (req, res) => {
  try {
   const {email} = req.body;
   const getUser = await User.findOne({where: {email}});
   if (getUser !== null) {
    if (getUser.last_reset) {
     const lastReset = new Date(getUser.last_reset);
     const currentDate = new Date();

     const timeDifference = currentDate - lastReset;
     const minutesDifference = timeDifference / (1000 * 60);
     const hoursDifference = timeDifference / (1000 * 60 * 60);
     if (hoursDifference < 1) {
      res.status(403).json({
       message: `Reset password hanya dapat dilakukan sekali dalam 1 jam! Silahkan coba kembali dalam ${(
        60 - minutesDifference
       ).toFixed(0)} menit lagi!`,
      });
      return;
     }
    }

    var length = 15;
    charset =
     "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    password = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
     password += charset.charAt(Math.floor(Math.random() * n));
    }

    let transporter = nodemailer.createTransport({
     host: process.env.EMAIL_HOST,
     port: process.env.EMAIL_PORT,
     secure: true,
     auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
     },
     tls: {
      rejectUnauthorized: false,
     },
    });

    let MailGenerator = new Mailgen({
     theme: {
      path: path.resolve("assets/theme.html"),
     },
     product: {
      username: getUser.fullname,
      password: password,
      title: "Password Akun Anda berhasil direset!",
      paragraph: [
       "Dengan hormat, kami ingin menginformasikan bahwa Reset password akun Anda telah berhasil.",
       "Silakan masuk dengan menggunakan password baru di bawah ini.",
      ],
      name: "REID Team",
      link: "https://reidteam.web.id",
     },
    });

    let response = {
     product: {
      name: "REID Team",
      link: "https://reidteam.web.id",
      logo: "https://reidteam.web.id/reidteam.svg",
      logoHeight: "80px",
     },
     body: {
      name: getUser.fullname,
      intro:
       "Dengan hormat, kami ingin menginformasikan bahwa Reset password akun Anda telah berhasil. Silakan masuk dengan menggunakan password baru di bawah ini.",
      dictionary: {
       Password: password,
      },
      action: {
       instructions: "Klik tombol di bawah untuk melanjutkan ke proses masuk.",
       button: {
        color: "#1E90FF",
        text: "Masuk Sekarang",
        link: "https://reidteam.web.id",
       },
      },
      signature: "Hormat Kami",
     },
    };

    let mail = MailGenerator.generate(response);

    let message = {
     from: process.env.EMAIL_FROM,
     to: email,
     subject:
      "Password Akun Anda berhasil direset, Silahkan Lihat Password Baru!",
     html: mail,
    };

    bcrypt.hash(password, salt, async (err, hash) => {
     if (err) throw error;

     getUser.password = hash;
     getUser.updated_at = new Date();
     getUser.last_reset = new Date();
     getUser.updated_by = "Reset Password";
     await getUser.save();

     transporter
      .sendMail(message)
      .then((info) => {
       return res.status(201).json({
        message:
         "Password Akun Anda berhasil direset, Password baru telah terkirim lewat email.",
        password,
       });
      })
      .catch((error) => {
       return res.status(500).json({error});
      });
    });
   } else {
    res.status(403).json({
     message: "email yang anda masukkan belum terdaftar.",
    });
   }
  } catch (error) {
   res.status(500).json({
    message: error.message || `Internal server error!`,
   });
  }
 },
};
