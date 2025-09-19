// 1. Dependencies
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");


require("dotenv").config();

const UserModel = require("./models/userModel");
const SalesModel = require("./models/salesModel");
const stockModel= require("./models/stockModel");
const OrderModel = require("./models/orderModel");
const AccountingModel = require("./models/accountingModel");
const productModel = require("./models/productModel");
// const AnalyticsModel = require("./models/analyticsModel");


// Import routes
const authRoutes = require("./routes/authRoutes");
const registerRoutes = require("./routes/registerRoutes");
const stockRoutes = require("./routes/stockRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const accountingRoutes = require("./routes/accountingRoutes");
const ecommerceRoutes = require("./routes/ecommerceRoutes");
const analyticRoutes = require("./routes/analyticRoutes");
const loginRoutes = require("./routes/loginRoutes");
const salesRoutes = require("./routes/salesRoutes");
// const editRoutes = require("./routes/editRoutes");



// 2. App instance
const app = express();
const port = 3001;

// 3. Configurations
//setting up mogodb connections
mongoose.connect(process.env.MONGODB_URL, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});
mongoose.connection
  .once("open", () => console.log("Mongoose connection open"))
  .on("error", (err) => console.log(`Connection error: ${err.message}`));


// 4. Middleware

app.use(express.static(path.join(__dirname, "/")));
// app.use('/uploads', express.static('__dirname + '/uploads');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // one day
  })
);

//  passport configs
app.use(passport.initialize());
app.use(passport.session());

//authenticate with passport local strategy.
passport.use(UserModel.createStrategy());
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

mongoose.connection
  .on("open", () => {
    console.log("Mongoose connection open");
  })
  .on("error", (err) => {
    console.log(`Connection error: ${err.message}`);
  });

// setting view engine to pug.
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 5. Routes
// app.use("/", salesRoutes);
app.use("/", authRoutes);
app.use("/", ordersRoutes);
app.use("/", registerRoutes);
app.use("/", stockRoutes);
app.use("/", accountingRoutes);
app.use("/ecommerce", ecommerceRoutes);
app.use("/", analyticRoutes);
app.use(loginRoutes);
app.use("/", salesRoutes);
// app.use("/", editRoutes);



app.use((req, res) => {
  res.status(404).send("Oops! Route not found.");
});

// 7. Start server
app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
