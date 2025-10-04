const express = require("express");
const router = express.Router();

const SalesModel = require("../models/SalesModel");


router.get("/salesreport", async (req, res) => {
  try {
    const { product, date } = req.query;
    let match = {};

    if (product) {
      match.product = { $regex: product, $options: "i" };
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      match.date = { $gte: start, $lt: end };
    }

    const sales = await SalesModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$product",
          totalQuantity: { $sum: "$quantity" },
          totalSales: { $sum: { $multiply: ["$price", "$quantity"] } },
          sales: { $push: "$$ROOT" },
        },
      },
      { $sort: { _id: 1 } }, // optional: sort by product name
    ]);

    res.render("salesreport", { sales, user: req.user, query: req.query });
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
