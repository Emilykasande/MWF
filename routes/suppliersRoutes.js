const express = require("express");
const router = express.Router();
const Stock = require("../models/stockModel");

// GET suppliers list from Stock
router.get("/suppliers", async (req, res) => {
  try {
    // Aggregate suppliers with grouped products
    const suppliers = await Stock.aggregate([
      {
        $group: {
          _id: "$supplier",
          supplierEmail: { $first: "$supplierEmail" },
          supplierContact: { $first: "$supplierContact" },
          products: { $addToSet: "$product" },
        },
      },
      {
        $project: {
          _id: 0,
          supplierName: "$_id",
          supplierEmail: 1,
          supplierContact: 1,
          products: 1,
        },
      },
    ]);

    console.log("Suppliers from DB:", suppliers); // <-- debug log

    res.render("suppliers", {
      title: "Suppliers List",
      suppliers,
      user: req.user || null,
    });
  } catch (err) {
    console.error("Error fetching suppliers:", err);
    res.status(500).send("Error fetching suppliers data");
  }
});

module.exports = router;
