const express = require("express");
const router = express.Router();

const SalesModel = require("../models/SalesModel");


router.get("/salesreport", async (req, res) => {
  try {
    const { product, startDate, endDate } = req.query;
    let match = {};

    if (product) {
      match.product = { $regex: product, $options: "i" };
    }

    if (startDate || endDate) {
      match.date = {};
      if (startDate) {
        match.date.$gte = new Date(startDate);
      }
      if (endDate) {
        match.date.$lte = new Date(endDate);
      }
    }

    // Get individual sales records with populated sales agent info
    const sales = await SalesModel.find(match)
      .populate("salesAgent", "fullname")
      .sort({ date: -1 }) // Most recent first
      .lean();

    // Calculate summary statistics
    const summary = {
      totalSales: sales.reduce((sum, sale) => sum + (sale.totalprice || 0), 0),
      totalQuantity: sales.reduce((sum, sale) => sum + (sale.quantity || 0), 0),
      uniqueProducts: [...new Set(sales.map(sale => sale.product))].length,
      totalTransactions: sales.length,
      dateRange: {
        earliest: sales.length > 0 ? sales[sales.length - 1].date : null,
        latest: sales.length > 0 ? sales[0].date : null
      }
    };

    res.render("salesreport", {
      sales,
      summary,
      user: req.user,
      query: req.query
    });
  } catch (err) {
    console.error("Sales report error:", err);
    res.status(500).send("Error loading sales report");
  }
});


router.get("/salesreport/download", async (req, res) => {
  try {
    const sales = await SalesModel.find().populate("salesAgent");

    res.render("salesreport_download", { sales, user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating report");
  }
});

module.exports = router;
