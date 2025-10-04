const express = require("express");
const router = express.Router();
const StockModel = require("../models/stockModel"); // adjust path if needed
const { ensureAuthenticated } = require("../middleware/auth");

// GET Orders Page (Wood + Furniture Stock)
router.get("/stocktable", ensureAuthenticated, async (req, res) => {
  try {
    // Fetch all stock items
    const items = await StockModel.find();

    res.render("stocktable", {
      user: req.user, // so the navbar knows if user is logged in
      items, // pass stock data to pug template
    });
  } catch (err) {
    console.error("Error loading stock for orders:", err);
    res.status(500).send("Server Error while fetching stock data");
  }
});

module.exports = router;
