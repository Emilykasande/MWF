const express = require("express");
const router = express.Router();
const Sales = require("../models/salesModel");
const Stock = require("../models/stockModel");

router.get("/analytic", async (req, res) => {
  try {
    // --- Sales Trends ---
    const sales = await Sales.find().sort({ date: 1 }).lean();
    const salesData = sales.map((s) =>
      s.quantity && s.price ? s.quantity * s.price : 0
    );
    const salesLabels = sales.map((s) =>
      s.date ? new Date(s.date).toLocaleDateString("en-GB") : ""
    );

    // --- Popular Products ---
    const productAgg = await Sales.aggregate([
      { $group: { _id: "$product", totalSold: { $sum: "$quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);
    const popularProducts = productAgg.map((p) => p.totalSold);
    const productLabels = productAgg.map((p) => p._id);

    // --- Top Customers ---
    const customerAgg = await Sales.aggregate([
      {
        $group: {
          _id: "$customername",
          totalPurchases: { $sum: { $multiply: ["$quantity", "$price"] } },
        },
      },
      { $sort: { totalPurchases: -1 } },
      { $limit: 5 },
    ]);
    const customerData = customerAgg.map((c) => c.totalPurchases);
    const customerLabels = customerAgg.map((c) => c._id);

    // --- Inventory Levels ---
    const stockItems = await Stock.find().lean();
    const inventoryLabels = stockItems.map((s) => s.product);
    const inventoryData = stockItems.map((s) => s.quantity);

    res.render("analytic", {
      data: {
        salesData,
        salesLabels,
        popularProducts,
        productLabels,
        customerData,
        customerLabels,
        inventoryData,
        inventoryLabels,
      },
      user: req.user || null,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).send("Error loading analytics data");
  }
});

module.exports = router;
