// routes/stockreportRoutes.js
const express = require("express");
const router = express.Router();
const Stock = require("../models/stockModel");

// GET /stockreport - show all stock
router.get("/stockreport", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim() : "";

    let filter = {};
    if (query) {
      filter = {
        $or: [
          { product: { $regex: query, $options: "i" } },
          { supplier: { $regex: query, $options: "i" } },
          { status: { $regex: query, $options: "i" } },
        ],
      };
    }

    const items = await Stock.find(filter).sort({ date: -1 }).lean();
    res.render("stockreport", { items, query, editItem: null });
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).send("Server Error");
  }
});

// POST /stockreport - add new stock (wood or furniture)
router.post("/stockreport", async (req, res) => {
  try {
    const {
      product,
      category,
      quantity,
      price,
      supplier,
      supplierEmail,
      supplierContact,
      date,
    } = req.body;

    // Validate required fields
    // if (!product || !category || !supplierEmail) {
    //   return res
    //     .status(400)
    //     .send("Product, Category, and Supplier Email are required!");
    // }

    // Convert numbers
    const qty = Number(quantity) || 0;
    const unitPrice = Number(price) || 0;
    const dateObj = date ? new Date(date) : new Date();

    // Check if product already exists in that category
    const existing = await Stock.findOne({ product, category });
    if (existing) {
      // Update quantity & other details
      existing.quantity += qty;
      existing.price = unitPrice;
      existing.supplier = supplier || existing.supplier;
      existing.supplierEmail = supplierEmail || existing.supplierEmail;
      existing.supplierContact = supplierContact || existing.supplierContact;
      existing.date = dateObj || existing.date;

      await existing.save();
    } else {
      // Add new stock
      const stock = new Stock({
        product,
        category,
        quantity: qty,
        price: unitPrice,
        supplier,
        supplierEmail,
        supplierContact,
        date: dateObj,
      });
      await stock.save();
    }

    res.redirect("/stockreport");
  } catch (err) {
    console.error("Error saving stock:", err);
    res.status(500).send("Error saving stock");
  }
});

// GET edit stock form
router.get("/updatestock/:id", async (req, res) => {
  try {
    const item = await Stock.findById(req.params.id).lean();

    if (!item) {
      return res.status(404).send("Stock item not found");
    }

    // Get all stock items for the table display
    const items = await Stock.find().sort({ date: -1 }).lean();

    res.render("stockreport", {
      items,
      editItem: item,
      query: "",
      title: "Edit Stock Item"
    });
  } catch (error) {
    console.error("Error fetching stock item for edit:", error.message);
    res.status(500).send("Error loading stock item for editing");
  }
});

// POST update stock
router.post("/updatestock/:id", async (req, res) => {
  try {
    const {
      product,
      category,
      quantity,
      price,
      supplier,
      supplierEmail,
      supplierContact,
      date,
    } = req.body;

    if (!product || !category) {
      return res.redirect(`/updatestock/${req.params.id}`);
    }

    const qty = Number(quantity) || 0;
    const unitPrice = Number(price) || 0;
    const dateObj = date ? new Date(date) : new Date();

    await Stock.findByIdAndUpdate(
      req.params.id,
      {
        product,
        category,
        quantity: qty,
        price: unitPrice,
        supplier: supplier || undefined,
        supplierEmail: supplierEmail || undefined,
        supplierContact: supplierContact || undefined,
        date: dateObj,
      },
      { new: true, runValidators: true }
    );

    res.redirect("/stockreport");
  } catch (error) {
    console.error("Error updating stock:", error.message);
    res.redirect(`/updatestock/${req.params.id}`);
  }
});

// DELETE stock item
router.post("/delete", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).send("Stock item ID is required");
    }

    const item = await Stock.findById(id);

    if (!item) {
      return res.status(404).send("Stock item not found");
    }

    await Stock.findByIdAndDelete(id);

    res.redirect("/stockreport");
  } catch (error) {
    console.error("Error deleting stock:", error.message);
    res.status(500).send("Error deleting stock item");
  }
});

module.exports = router;
