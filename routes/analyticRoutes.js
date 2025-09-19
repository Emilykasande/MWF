const express = require("express");
const router = express.Router();
const Sales = require("../models/salesModel");

router.get("/analytic", async (req, res) => {
  try {
    // --- Sales Trends ---
    const sales = await Sales.find().sort({ date: 1 }).lean();
    const salesData = sales.map((s) => s.payment || s.quantity * s.price);
    const salesLabels = sales.map((s) => new Date(s.date).toLocaleDateString());

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
        $group: { _id: "$customername", totalPurchases: { $sum: "$payment" } },
      },
      { $sort: { totalPurchases: -1 } },
      { $limit: 5 },
    ]);
    const customerData = customerAgg.map((c) => c.totalPurchases);
    const customerLabels = customerAgg.map((c) => c._id);

    res.render("analytic", {
      data: {
        salesData,
        salesLabels,
        popularProducts,
        productLabels,
        customerData,
        customerLabels,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading analytics data");
  }
});

module.exports = router;
