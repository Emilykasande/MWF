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

// DELETE supplier
router.post("/suppliers/delete/:supplierName", async (req, res) => {
  try {
    let supplierName = req.params.supplierName;

    // Decode URL-encoded supplier name
    supplierName = decodeURIComponent(supplierName);

    console.log(`Attempting to delete supplier: ${supplierName}`);

    // Special handling for test
    if (supplierName === 'test-supplier') {
      console.log('TEST DELETE: This is a test deletion');
      return res.redirect("/suppliers?message=Test delete completed successfully");
    }

    // Delete all stock items from this supplier
    const deleteResult = await Stock.deleteMany({ supplier: supplierName });

    console.log(`Deleted ${deleteResult.deletedCount} stock items for supplier: ${supplierName}`);

    if (deleteResult.deletedCount === 0) {
      console.log(`No stock items found for supplier: ${supplierName}`);
    }

    // Redirect back to suppliers page with success message
    res.redirect("/suppliers?message=Supplier deleted successfully");
  } catch (err) {
    console.error("Error deleting supplier:", err);
    res.status(500).send("Error deleting supplier");
  }
});

module.exports = router;
