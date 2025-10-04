const express = require("express");
const router = express.Router();
// const { ensureAuthenticated, ensureManager } = require("../middleware/auth");

// Import the mongoose model
const StockModel = require("../models/stockModel");

// ============================================
// HELPER: Reduce stock quantity (used by sales)
// ============================================
async function reduceStock(productName, quantityToReduce) {
  const stockItem = await StockModel.findOne({ product: productName });
  if (!stockItem) {
    throw new Error(`Product "${productName}" not found in stock`);
  }
  const currentQty = Number(stockItem.quantity) || 0;
  if (currentQty < quantityToReduce) {
    throw new Error(
      `Insufficient stock for "${productName}". Available: ${currentQty}, Requested: ${quantityToReduce}`
    );
  }
  const newQty = currentQty - quantityToReduce;
  await StockModel.findByIdAndUpdate(
    stockItem._id,
    { quantity: newQty },
    { new: true, runValidators: true }
  );
  return newQty;
}

// ============================================
// HELPER: Increase stock quantity (used when adding inventory)
// ============================================
async function increaseStock(productName, category, quantityToAdd, additionalFields = {}) {
  const existing = await StockModel.findOne({ product: productName, category });
  if (existing) {
    const newQty = (Number(existing.quantity) || 0) + quantityToAdd;
    await StockModel.findByIdAndUpdate(
      existing._id,
      {
        quantity: newQty,
        ...additionalFields,
      },
      { new: true, runValidators: true }
    );
    return newQty;
  } else {
    const stock = new StockModel({
      product: productName,
      category,
      quantity: quantityToAdd,
      ...additionalFields,
    });
    await stock.save();
    return quantityToAdd;
  }
}

// GET all stock and render the table
router.get("/stock", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim() : "";

    // Build filter for search
    let filter = {};
    if (query) {
      filter = {
        $or: [
          { product: { $regex: query, $options: "i" } }, // search product name
          { supplier: { $regex: query, $options: "i" } }, // search supplier
          { status: { $regex: query, $options: "i" } }, // search status
        ],
      };
    }

    const items = await StockModel.find(filter).sort({ date: -1 }).lean();
    res.render("stockreport", { items, editItem: null, query });
  } catch (error) {
    console.error("Error fetching stock:", error.message);
    res.status(400).send("Unable to get data from the database!");
  }
});

// POST new stock (aggregate by product & category) – INCREASES stock
router.post("/stock", async (req, res) => {
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
      return res.redirect("/stockreport");
    }

    const qtyToAdd = Number(quantity) || 0;
    const dateObj = date ? new Date(date) : new Date();

    await increaseStock(product, category, qtyToAdd, {
      price: price !== undefined ? Number(price) : undefined,
      supplier: supplier || undefined,
      supplierEmail: supplierEmail || undefined,
      supplierContact: supplierContact || undefined,
      date: dateObj,
    });

    res.redirect("/stockreport");
  } catch (error) {
    console.error("Error saving stock:", error.message);
    res.redirect("/stockreport");
  }
});


router.get("/stock/api/products", async (req, res) => {
  try {
    const products = await StockModel.find({}).select("product category quantity price status").lean();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Unable to fetch products" });
  }
});

// GET edit stock form
router.get("/updatestock/:id", async (req, res) => {
  try {
    const item = await StockModel.findById(req.params.id).lean();

    if (!item) {
      return res.status(404).send("Stock item not found");
    }

    // Get all stock items for the table display
    const items = await StockModel.find().sort({ date: -1 }).lean();

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

    await StockModel.findByIdAndUpdate(
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

    const item = await StockModel.findById(id);

    if (!item) {
      return res.status(404).send("Stock item not found");
    }

    await StockModel.findByIdAndDelete(id);

    res.redirect("/stockreport");
  } catch (error) {
    console.error("Error deleting stock:", error.message);
    res.status(500).send("Error deleting stock item");
  }
});

// Export helpers for use in other routes (e.g., salesRoutes)
router.reduceStock = reduceStock;
router.increaseStock = increaseStock;

module.exports = router;
