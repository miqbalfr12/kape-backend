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

const html = (title, nama, info, password, email) => {
 return `<head> <script src='https://cdn.tailwindcss.com'></script> <style> @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap'); @layer base { body { font-family: 'Montserrat', sans-serif; } } p { color: rgb(75 85 99); } </style></head><body> <div class='w-[20.99cm] h-[29.6cm] max-w-[20.99cm] max-h-[29.6cm] p-0 m-0 flex flex-col'> <div class='w-full text-black mt-4 p-8 px-12 bg-gray-300 flex justify-end items-end'> <a href='https://reidteam.web.id'> <img class='w-[130px]' src='https://i.imgur.com/pEI52Mm.png' /> </a> </div> <div class='m-6 mt-8 grow'> <h1 class='text-4xl font-bold text-gray-800 py-2'> ${title} </h1> <hr class='my-6 w-2/4 border border-8 border-gray-300 bg-gray-300' /> <h2 class='text-xl font-semibold text-gray-600'> Hi! ${nama} </h2> <p>Salam hangat dari Tim REID,</p> <br /> <p> Dengan hormat, kami ingin menginformasikan bahwa ${info} </p> <br /> <p>Silakan masuk dengan menggunakan ${
  password ? "password" : "email"
 } di bawah ini.</p> <br /> <h3 class='text-lg font-semibold text-gray-600'>${
  password ? "Password" : "Email"
 }:</h3> <p>${
  password ? password : email
 }</p> <br /> <p>Terima kasih atas perhatian dan dukungannya.</p> <br /> <p>Salam hangat,</p> <p>REID Team</p> </div> <img class='w-full' src='https://i.imgur.com/xXBMhzi.png' /> <div class='bg-black w-full text-white text-center'> Copyright © 2024 <a href='https://reidteam.web.id'>REID Team</a> </div> </div></body>`;
};

module.exports = {
 register: async (req, res, next) => {
  try {
   let payload = req.body;

   const checkNIK = await User.findOne({where: {nik: payload.nik}});

   if (payload) {
    if (payload.email === null || payload.email === "" || !payload.email) {
     return res.status(422).json({
      message: "Email harus diisi!",
     });
    }

    if (payload.password === null || payload.password === "") {
     return res.status(422).json({
      message: "Password harus diisi!",
     });
    }

    if (payload.phone_number === null || payload.phone_number === "") {
     return res.status(422).json({
      message: "Nomor telepon harus diisi!",
     });
    }
   }

   if (checkNIK && payload.role === "kasir") {
    if (checkNIK.email !== payload.email)
     return res.status(422).json({
      message:
       "Email akun yang anda tunjuk Tidak sesuai dengan NIK yang terdaftar!",
     });

    if (checkNIK.toko_id) {
     return res.status(422).json({
      message: "Akun yang anda tunjuk sudah mengelola toko!",
     });
    }

    const userReq = req.user;

    checkNIK.toko_id = payload.toko_id;
    checkNIK.role = payload.role;
    checkNIK.updated_by = userReq.user_id;
    const dataUser = await checkNIK.save();

    return res.status(201).json({
     message: "Akun yang anda tunjuk telah diset menjadi kasir toko anda!",
     dataUser,
    });
   }

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

     let password = "";
     if (
      payload.password === null ||
      payload.password === "" ||
      !payload.password
     ) {
      var length = 15;
      charset =
       "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
      for (var i = 0, n = charset.length; i < length; ++i) {
       password += charset.charAt(Math.floor(Math.random() * n));
      }
      payload.password = password;
     }

     const mailProduk = {
      username: payload.fullname,
      title: "Daftar akun Anda telah berhasil!",
      name: "REID Team",
      link: "https://reidteam.web.id",
     };

     if (password) {
      mailProduk.password = password;
      mailProduk.paragraph = [
       "Dengan hormat, kami ingin menginformasikan bahwa pendaftaran akun Anda telah berhasil",
       "Silakan masuk dengan menggunakan Password di bawah ini.",
      ];
     } else {
      mailProduk.email = payload.email;
      mailProduk.paragraph = [
       "Dengan hormat, kami ingin menginformasikan bahwa pendaftaran akun Anda telah berhasil",
       "Silakan masuk dengan menggunakan Email di bawah ini.",
      ];
     }

     let MailGenerator = new Mailgen({
      theme: {
       path: path.resolve("assets/theme.html"),
      },
      product: mailProduk,
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
        "Selamat datang di REID Team! Daftar akun Anda telah berhasil. Silakan masuk dengan menggunakan Email di bawah ini.",
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
      subject: password
       ? "Daftar Akun Berhasil, Silahkan Lihat Password!"
       : "Daftar Akun Berhasil!",
      html: mail,
     };

     bcrypt.hash(payload.password, salt, async (err, hash) => {
      if (err) throw err;

      payload = {
       ...payload,
       user_id,
       password: hash,
       created_by: payload.created_by || user_id,
       updated_by: payload.updated_by || user_id,
      };

      try {
       const dataUser = await User.create(payload);
       fetch("https://whatsapp.reidteam.web.id/send-html-pdf", {
        method: "POST",
        headers: {
         "Content-Type": "application/json",
        },
        body: JSON.stringify({
         message: "Pendaftaran Akun Berhasil!",
         number: payload.phone_number,
         type: "@c.us",
         html: html(
          "Pendaftaran Akun Berhasil!",
          payload.fullname,
          "pendaftaran akun Anda telah berhasil",
          password || false,
          password ? payload.password : payload.email
         ),
         title: "Pendaftaran-Akun",
        }),
       }).catch((err) => console.log(err));

       transporter
        .sendMail(message)
        .then((info) => {
         return res.status(201).json({
          message: "Daftar berhasil, Email pendaftaran telah terkirim.",
          password: password ? password : payload.password,
          dataUser,
         });
        })
        .catch((error) => {
         return res.status(500).json({error, message: error.message});
        });
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
     });
    } else {
     if (payload.role === "kasir")
      return res.status(422).json({
       message: "Email sudah terdaftar untuk NIK yang berbeda!",
      });
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
   res.status(500).json({
    error: 1,
    message: err.message,
    fields: err.errors,
   });
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
        user: getUser,
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
      res.status(425).json({
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

     fetch("https://whatsapp.reidteam.web.id/send-html-pdf", {
      method: "POST",
      headers: {
       "Content-Type": "application/json",
      },
      body: JSON.stringify({
       message:
        "Reset Password Akun Berhasil!\n\nSilahkan buka PDF untuk melihat Password Baru.",
       number: getUser.phone_number,
       type: "@c.us",
       html: html(
        "Reset Password Berhasil",
        getUser.fullname,
        "reset Password akun Anda telah berhasil",
        password
       ),
       title: "Reset-Password",
      }),
     }).catch((err) => console.log(err));

     transporter
      .sendMail(message)
      .then((info) => {
       return res.status(202).json({
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
    res.status(404).json({
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
