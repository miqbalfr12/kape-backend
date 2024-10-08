const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const indexRouter = require("./routes/index");
// API
const authRouter = require("./app/api/routes/auth");
const userRouter = require("./app/api/routes/user");
const usersRouter = require("./app/api/routes/users");
const tokoRouter = require("./app/api/routes/toko");
const kasirRouter = require("./app/api/routes/kasir");
const itemRouter = require("./app/api/routes/item");
const transaksiRouter = require("./app/api/routes/transaksi");
const qrController = require("./app/api/controllers/qr");
const paymentRouter = require("./app/api/routes/payment");
const activityRouter = require("./app/api/routes/activity");
const pengeluaranRouter = require("./app/api/routes/pengeluaran");

const app = express();
const URL = "/api/v1.0.0";
app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json({limit: "100mb"}));
app.use(express.urlencoded({limit: "100mb", extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/qr", qrController);

// API
app.use(`${URL}/auth`, authRouter);
app.use(`${URL}/user`, userRouter);
app.use(`${URL}/users`, usersRouter);
app.use(`${URL}/toko`, tokoRouter);
app.use(`${URL}/kasir`, kasirRouter);
app.use(`${URL}/item`, itemRouter);
app.use(`${URL}/transaksi`, transaksiRouter);
app.use(`${URL}/payment`, paymentRouter);
app.use(`${URL}/activity`, activityRouter);
app.use(`${URL}/pengeluaran`, pengeluaranRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
 next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
 // set locals, only providing error in development
 res.locals.message = err.message;
 res.locals.error = req.app.get("env") === "development" ? err : {};

 // render the error page
 res.status(err.status || 500);
 res.render("error");
});

//boniw
const port = process.env.PORT || 3000;
app.listen(port, () => {
 console.log(`Server is running on port ${port}`);
});
//end
module.exports = app;
