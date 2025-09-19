// routes/ecommerceRoutes.js
const express = require("express");
const router = express.Router();

const Product = require("../models/productModel");
const Order = require("../models/orderModel"); // your Order model

// GET /ecommerce -> render products page
router.get("/", async (req, res) => {
  try {
    const products = await Product.find({}).lean();
    res.render("ecommerce", { products });
  } catch (err) {
    console.error("Failed to load products:", err);
    res.render("ecommerce", { products: [] });
  }
});

// POST /ecommerce/checkout -> accept order JSON and save
router.post("/checkout", async (req, res) => {
  try {
    const { customerName, items, total } = req.body;

    if (!customerName || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "customerName and at least one item are required",
      });
    }

    // Save order (productId stored as string instead of ObjectId)
    const order = new Order({
      customerName,
      items: items.map((i) => ({
        productId: String(i.productId), // store raw string like "6"
        name: i.name,
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
      })),
      total:
        Number(total) ||
        items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0),
    });

    const saved = await order.save();
    console.log("Order saved:", saved);
    res.json({ success: true, orderId: saved._id });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
