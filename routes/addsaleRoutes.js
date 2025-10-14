const express = require("express");
const router = express.Router();
const SalesModel = require("../models/salesModel");
const StockModel = require("../models/stockModel");

// Import stock helpers from stockRoutes
const stockRoutes = require("./stockRoutes");
const { reduceStock } = stockRoutes;


// API route to fetch products for dropdown
router.get("/api/products", async (req, res) => {
  try {
    // Aggregate products by name and sum quantities
    const products = await StockModel.aggregate([
      {
        $group: {
          _id: "$product",
          totalQuantity: { $sum: "$quantity" },
          category: { $first: "$category" },
          price: { $first: "$price" }
        }
      },
      {
        $project: {
          product: "$_id",
          quantity: "$totalQuantity",
          category: 1,
          price: 1,
          _id: 0
        }
      },
      {
        $sort: { product: 1 }
      }
    ]);

    console.log("API Aggregated products:", products); // Debug log
    res.json(products);
  } catch (err) {
    console.error("Error fetching products:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /addsale
router.get("/addsale", async (req, res) => {
  try {
    // Aggregate products for dropdown
    const products = await StockModel.aggregate([
      {
        $group: {
          _id: "$product",
          totalQuantity: { $sum: "$quantity" },
          category: { $first: "$category" },
          price: { $first: "$price" }
        }
      },
      {
        $project: {
          product: "$_id",
          quantity: "$totalQuantity",
          category: 1,
          price: 1,
          _id: 0
        }
      },
      {
        $sort: { product: 1 }
      }
    ]);

    console.log("Fetched aggregated products:", products); // debug log

    const sales = await SalesModel.find({
      salesAgent: req.session.user?.id || req.session.user?._id,
    })
      .populate("salesAgent", "fullname")
      .sort({ date: -1 })
      .lean();

    sales.forEach((sale) => {
      sale.formattedDate = sale.date
        ? new Date(sale.date).toLocaleDateString("en-GB")
        : "N/A";
    });

    res.render("addsale", {
      user: req.session.user,
      formData: {},
      sales,
      products, 
      receipt: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/stocktable", async (req, res) => {
  try {
    const products = await StockModel.find().lean();
    console.log("Products from DB:", products);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});


// POST /addsale
router.post("/addsale", async (req, res) => {
  try {
    console.log("Session user ID (id):", req.session.user?.id);
    console.log("Session user ID (_id):", req.session.user?._id);

    const { customername, product, quantity, price, transport, paymentMethod, date } = req.body;
    const qty = Number(quantity);
    const unitPrice = Number(price);
    let totalprice = qty * unitPrice;
    if (transport === "yes") totalprice += totalprice * 0.05;

    // Check and reduce stock using helper function
    const newStockQty = await reduceStock(product, qty);

    // Save sale
    const newSale = await SalesModel.create({
      customername,
      product,
      quantity: qty,
      price: unitPrice,
      totalprice,
      transport,
      paymentMethod,
      salesAgent: req.session.user?.id || req.session.user?._id || null,
      date: date ? new Date(date) : new Date(),
    });

    // Fetch updated sales and aggregated products
    const sales = await SalesModel.find({ salesAgent: req.session.user?.id || req.session.user?._id })
      .populate("salesAgent", "fullname")
      .sort({ date: -1 })
      .lean();

    // Aggregate products for dropdown
    const products = await StockModel.aggregate([
      {
        $group: {
          _id: "$product",
          totalQuantity: { $sum: "$quantity" },
          category: { $first: "$category" },
          price: { $first: "$price" }
        }
      },
      {
        $project: {
          product: "$_id",
          quantity: "$totalQuantity",
          category: 1,
          price: 1,
          _id: 0
        }
      },
      {
        $sort: { product: 1 }
      }
    ]);

    sales.forEach((sale) => {
      sale.formattedDate = sale.date
        ? new Date(sale.date).toLocaleDateString("en-GB")
        : "N/A";
    });

    res.render("addsale", {
      user: req.session.user,
      formData: {},
      sales,
      products,
      receipt: newSale,
    });
  } catch (err) {
    console.error("Error in POST /addsale:", err.message);

    // Fetch sales and products on error
    const sales = await SalesModel.find({ salesAgent: req.session.user?.id || req.session.user?._id })
      .populate("salesAgent", "fullname")
      .sort({ date: -1 })
      .lean();

    // Aggregate products for dropdown
    const products = await StockModel.aggregate([
      {
        $group: {
          _id: "$product",
          totalQuantity: { $sum: "$quantity" },
          category: { $first: "$category" },
          price: { $first: "$price" }
        }
      },
      {
        $project: {
          product: "$_id",
          quantity: "$totalQuantity",
          category: 1,
          price: 1,
          _id: 0
        }
      },
      {
        $sort: { product: 1 }
      }
    ]);

    sales.forEach((sale) => {
      sale.formattedDate = sale.date
        ? new Date(sale.date).toLocaleDateString("en-GB")
        : "N/A";
    });

    res.render("addsale", {
      user: req.session.user,
      formData: req.body,
      sales,
      products,
      receipt: null,
      errorMessage: err.message,
    });
  }
});
// GET /sales/receipt/:id
router.get("/sales/receipt/:id", async (req, res) => {
  try {
    const sale = await SalesModel.findById(req.params.id)
      .populate("salesAgent", "fullname")
      .lean();

    if (!sale) return res.status(404).send("Sale not found");

    sale.formattedDate = sale.date
      ? new Date(sale.date).toLocaleDateString("en-GB")
      : "N/A";

    res.render("receipt", { sale });
  } catch (err) {
    console.error("Error fetching receipt:", err.message);
    res.status(500).send("Server Error");
  }
});


module.exports = router;
