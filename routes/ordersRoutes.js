const express = require("express");
const router = express.Router();
const OrderModel = require("../models/orderModel");

// GET /orders → display orders
router.get("/orders/new", async (req, res) => {
  try {
    const products = await ProductModel.find();
    const customers = await CustomerModel.find();
    res.render("orders", { products, customers });
  } catch (err) {
    console.error(err);
    res.render("orders", { products: [], customers: [] });
  }
});

// POST /orders → add a new order
router.post("/orders", async (req, res) => {
  try {
    const order = new OrderModel(req.body);
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save order" });
  }
});

module.exports = router;
