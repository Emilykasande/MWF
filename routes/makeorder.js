const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");

router.get("/makeorder", async (req, res) => {
  try {
    const orders = await Order.find();
    res.render("orders", { orders }); // 👈 render Pug template
  } catch (err) {
    res.status(500).send("Error fetching orders");
  }
});

router.post("/makeorder", async (req, res) => {
  try {
    const newOrder = new Order({
      customerName: req.body.customerName,
      customerEmail: req.body.customerEmail,
      productSku: req.body.productSku,
      productQty: req.body.productQty,
    });
    await newOrder.save();
    res.redirect("/orders"); 
  } catch (err) {
    res.status(500).send("Error saving order");
  }
});

module.exports = router;
