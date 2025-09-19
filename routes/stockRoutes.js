const express = require("express");
const router = express.Router();
// const { ensureAuthenticated, ensureManager } = require("../middleware/auth");

// Import the mongoose model
const StockModel = require("../models/stockModel");

// Inventory dashboard page
// router.get("/stock", ensureAuthenticated, ensureManager, (req, res) => {
//   res.render("stocktable", { title: "Stock Management" });
// });

// GET all stock and render the table
router.get("/stock", async (req, res) => {
  try {
    const items = await StockModel.find().sort({ $natural: -1 });
    res.render("stocktable", { items, editItem: null }); 
  } catch (error) {
    console.error("Error fetching stock:", error.message);
    res.status(400).send("Unable to get data from the database!");
  }
});

// POST new stock
router.post("/stock", async (req, res) => {
  try {
    const stock = new StockModel(req.body);
    console.log("New stock:", req.body);
    await stock.save();
    res.redirect("/stock");
  } catch (error) {
    console.error("Error saving stock:", error.message);
    res.redirect("/stock");
  }
});
// Optional page for adding stock separately
router.get("/addstock", (req, res) => {
  res.render("addstock");
});

// UPDATE stock
router.get("/updatestock/:id", async (req, res) => {
  try {
    const items = await StockModel.find().sort({ $natural: -1 });
    const editItem = await StockModel.findById(req.params.id);
    res.render("stocktable", { items, editItem });
  } catch (err) {
    console.error("Error fetching item for update:", err);
    res.redirect("/stock");
  }
});

// Handle the update form submission
router.post("/updatestock/:id", async (req, res) => {
  try {
    await StockModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.redirect("/stock");
  } catch (err) {
    console.error("Error updating stock:", err);
    res.status(500).send("Error updating stock");
  }
});

// DELETE stock
router.post("/delete", async (req, res) => {
  try {
    await StockModel.findByIdAndDelete(req.body.id);
    res.redirect("/stock");
  } catch (err) {
    console.error("Error deleting stock:", err);
    res.status(500).send("Error deleting stock");
  }
});

module.exports = router;
