const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const products = require("../models/productsModel");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // images saved to /public/uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Render form
router.get("/admin/upload", (req, res) => {
  res.render("adminUpload", { title: "Upload New Product" });
});

// Handle form submission
router.post("/admin/upload", upload.single("image"), async (req, res) => {
  try {
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      img: "/uploads/" + req.file.filename, // store relative path
    });

    await newProduct.save();
    res.redirect("/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving product");
  }
});

module.exports = router;
