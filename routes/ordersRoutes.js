// routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");

// Fetch all orders and render orders.pug
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ date: -1 }).lean();
    res.render("orders", { orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("Server Error");
  }
});

// Legacy order placement route - keeping for backward compatibility but not recommended
router.post("/place-order", async (req, res) => {
  try {
    const { customerName, phoneNumber, address, items, total } = req.body;

    console.log("Legacy place-order request:", {
      customerName,
      phoneNumber,
      address,
      itemsCount: items?.length,
      total
    });

    if (!customerName || !phoneNumber || !address || !items || !total) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newOrder = new Order({
      customerName,
      phoneNumber,
      address,
      items,
      total,
    });

    await newOrder.save();
    res.json({ success: true, message: "Order placed successfully!" });
  } catch (err) {
    console.error("Legacy place-order error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Delete an order by ID
router.delete("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update order status to delivered
router.put("/orders/:id/deliver", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: 'delivered' }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order marked as delivered" });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
