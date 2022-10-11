require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const apicache = require("apicache");
const app = express();
const passportSetup = require("./config/passport.setup");
const cookieSession = require("cookie-session");
const passport = require("passport");
// const limiter = require("./helper/rateLimiter");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const adminRoutes = require("./routes/admin.routes")
const walletRoutes = require("./routes/wallet.routes")
const transactionRoutes = require("./routes/transaction.routes")
const port = process.env.PORT || 6262;
connectDB();
// let cache = apicache.middleware;
// if (process.env.NODE_ENV === "development") {
// }
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(limiter);
// app.use(cache("10 minutes"));
app.set("view engine", "ejs");

app.use(
  cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.cookieKey],
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.render("home");
});
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/admin", adminRoutes);
app.use("/wallets", walletRoutes);
app.use("/transaction", transactionRoutes);

app.get('/deposit',  (req, res)=> {
  res.render('deposit');
})
app.get('/save',  (req, res)=> {
  res.render('save');
})
app.get('/createwallet',  (req, res)=> {
  res.render('create');
})
app.all("*", (req, res) => {
  return res.status(404).json({ message: "Oops page not found" });
});
app.listen(port, () => {
  console.log(`listening on port http://localhost:${port}`);
});
