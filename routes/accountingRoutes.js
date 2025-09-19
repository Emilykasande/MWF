// routes/accountingRoutes.js
const express = require("express");
const router = express.Router();
const Accounting = require("../models/accountingModel");

// GET dashboard
router.get("/accounting", async (req, res) => {
  try {
    const latest = await Accounting.find().sort({ createdAt: -1 }).limit(1);
    res.render("accounting", { data: latest[0] || {} });
  } catch (err) {
    console.error(err);
    res.render("accounting", { data: {} });
  }
});

// POST new financial data
router.post("/accounting", async (req, res) => {
  try {
    const { cashFlow, ...rest } = req.body;
    const cashArray = cashFlow ? cashFlow.split(",").map(Number) : [];
    await Accounting.create({ ...rest, cashFlow: cashArray });
    res.redirect("/accounting");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving data");
  }
});


router.post("/checkout", async (req, res) => {
  try {
    const { items, total } = req.body; // expect JSON from frontend

    const order = new Order({ items, total });
    await order.save();

    res.json({ success: true, message: "Order saved!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
