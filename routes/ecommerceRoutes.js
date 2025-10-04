const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  ensureAuthenticated,
  blockStaffFromEcommerce,
} = require("../middleware/auth");

const Product = require("../models/productsModel");
const Order = require("../models/orderModel");

// --- Multer setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// --- Ecommerce homepage (PUBLIC) ---
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("ecommerce", {
      products,
      user: req.session ? req.session.user : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// --- Add product form ---
router.get("/product/add", ensureAuthenticated, (req, res) => {
  if (req.session.user.position !== "sales Agent" && req.session.user.position !== "manager")
    return res.status(403).send("Access denied");

  res.render("addProduct", { user: req.session.user, title: "Add New Product" });
});

// --- Handle adding new product ---
router.post(
  "/product/add",
  ensureAuthenticated,
  upload.single("image"),
  async (req, res) => {
    if (req.session.user.position !== "sales Agent" && req.session.user.position !== "manager")
      return res.status(403).send("Access denied");

    try {
      if (!req.file) return res.status(400).send("No file uploaded.");
      const newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        img: "/uploads/" + req.file.filename,
      });
      await newProduct.save();
      res.redirect("/ecommerce");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error saving product");
    }
  }
);

// --- Admin upload form ---
router.get("/admin/upload", ensureAuthenticated, (req, res) => {
  if (req.session.user.position !== "sales Agent")
    return res.status(403).send("Access denied");

  res.render("adminUpload", { title: "Upload New Product" });
});

// --- Handle product upload ---
router.post(
  "/admin/upload",
  ensureAuthenticated,
  upload.single("image"),
  async (req, res) => {
    if (req.session.user.position !== "sales Agent")
      return res.status(403).send("Access denied");

    try {
      if (!req.file) return res.status(400).send("No file uploaded.");
      const newProduct = new Product({
        name: req.body.name,
        price: req.body.price,
        img: "/uploads/" + req.file.filename,
      });
      await newProduct.save();
      res.redirect("/ecommerce");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error saving product");
    }
  }
);

// --- Edit product ---
router.get("/product/edit/:id", ensureAuthenticated, async (req, res) => {
  if (req.session.user.position !== "sales Agent")
    return res.status(403).send("Access denied");

  const product = await Product.findById(req.params.id).lean();
  if (!product) return res.status(404).send("Product not found");

  res.render("editProduct", { product, user: req.session.user });
});

router.post(
  "/product/edit/:id",
  ensureAuthenticated,
  upload.single("image"),
  async (req, res) => {
    if (req.session.user.position !== "sales Agent")
      return res.status(403).send("Access denied");

    const updateData = { name: req.body.name, price: req.body.price };
    if (req.file) updateData.img = "/uploads/" + req.file.filename;

    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.redirect("/ecommerce");
  }
);

// --- Delete product ---
router.post("/product/delete/:id", ensureAuthenticated, async (req, res) => {
  if (req.session.user.position !== "sales Agent")
    return res.status(403).send("Access denied");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).send("Product not found");

  const filePath = path.join(__dirname, "..", product.img);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  await Product.findByIdAndDelete(req.params.id);
  res.redirect("/ecommerce");
});

// --- Checkout ---
router.post("/checkout", async (req, res) => {
  try {
    const { customerName, phoneNumber, address, items, total } = req.body;

    console.log("Checkout request received:", {
      customerName,
      phoneNumber,
      address,
      itemsCount: items?.length,
      total
    });

    if (!customerName || !phoneNumber || !address || !Array.isArray(items) || items.length === 0) {
      console.error("Validation failed:", { customerName: !!customerName, phoneNumber: !!phoneNumber, address: !!address, items: items?.length });
      return res
        .status(400)
        .json({ success: false, message: "All customer details and items are required" });
    }

    const order = new Order({
      customerName,
      phoneNumber,
      address,
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        price: Number(i.price),
        quantity: Number(i.quantity),
      })),
      total:
        Number(total) || items.reduce((s, i) => s + i.price * i.quantity, 0),
    });

    console.log("Order object created:", order);

    const saved = await order.save();
    console.log("Order saved successfully:", saved._id);

    res.json({
      success: true,
      message: "Order placed successfully!",
      orderId: saved._id
    });
  } catch (err) {
    console.error("Checkout error:", err);
    console.error("Error details:", {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ success: false, message: "Server error while placing order. Please try again." });
  }
});

router.get("/shop", blockStaffFromEcommerce, (req, res) => {
  res.render("shop");
});

// Public products page
router.get("/products", blockStaffFromEcommerce, (req, res) => {
  res.render("products");
});

// NOTE: Staff may still access; if you want to redirect STAFF to dashboard, re-enable blockStaffFromEcommerce here.

module.exports = router;
