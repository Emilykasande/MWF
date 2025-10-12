// 1. Dependencies
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require ("passport")
const dotenv = require("dotenv");


dotenv.config();

// Models
const UserModel = require("./models/userModel");
const SalesModel = require("./models/salesModel");
const stockModel = require("./models/stockModel");
const OrderModel = require("./models/orderModel");
const AccountingModel = require("./models/accountingModel");
const productsModel = require("./models/productsModel");

// Routes
const authRoutes = require("./routes/authRoutes");
const registerRoutes = require("./routes/registerRoutes");
const stockRoutes = require("./routes/stockRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const accountingRoutes = require("./routes/accountingRoutes");
const ecommerceRoutes = require("./routes/ecommerceRoutes");
const analyticRoutes = require("./routes/analyticRoutes");
const loginRoutes = require("./routes/loginRoutes");
const salesRoutes = require("./routes/salesRoutes");
const addsaleRoutes = require("./routes/addsaleRoutes");
const indexRoutes = require("./routes/indexRoutes");
const staffRoutes = require("./routes/staffRoutes");
const suppliersRoutes = require("./routes/suppliersRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const productsRoutes = require("./routes/productsRoutes");
const stockreportRoutes = require("./routes/stockreportRoutes");
const salesreportRoutes = require("./routes/salesreportRoutes");
const agentstockRoutes = require("./routes/agentstockRoutes");


// 2. App instance
const app = express();
const port = 3001;

// 3. MongoDB connection
mongoose.connect(process.env.MONGODB_URL, {});
mongoose.connection
  .once("open", () => console.log(" Mongoose connection open"))
  .on("error", (err) => console.log(`Connection error: ${err.message}`));

// 4. Middleware
app.use(express.static(path.join(__dirname, "/"))); // public assets
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve uploaded images
app.use(express.urlencoded({ extended: true })); // form data
app.use(express.json()); // JSON data

app.use(
  expressSession({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL }),
    cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// middleware to protect routes
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login"); // redirect guests to login
  }
  next();
}

// Global middleware to set cache control headers for all routes
app.use((req, res, next) => {
  // Set cache control headers to prevent caching of sensitive pages
  if (req.session.user) {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  next();
});

// 5. View engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// 6. Routes (keeping all your existing routes)
app.use("/", authRoutes);
app.use("/", ordersRoutes);
app.use("/", registerRoutes);
app.use("/", stockRoutes);
app.use("/", accountingRoutes);
app.use("/ecommerce", ecommerceRoutes);
app.use("/", analyticRoutes);
app.use(loginRoutes);
app.use("/", salesRoutes);
app.use("/", addsaleRoutes);
app.use("/", indexRoutes);
app.use("/", staffRoutes);
app.use("/", dashboardRoutes);
app.use("/", productsRoutes);
app.use("/", stockreportRoutes);
app.use("/", salesreportRoutes);
app.use("/", agentstockRoutes);
app.use("/", suppliersRoutes); // Move suppliers routes last to avoid conflicts

// Root route - redirect to index page
app.get("/", (req, res) => {
  res.redirect("/index");
});


// 404 handler
app.use((req, res) => {
  res.status(404).send("Oops! Route not found.");
});

// 7. Start server
app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
