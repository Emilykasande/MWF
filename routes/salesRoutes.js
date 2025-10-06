const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureSalesAgent, ensureManager } = require("../middleware/auth");
const SalesModel = require("../models/salesModel");
const StockModel = require("../models/stockModel");

// router.get("/addsale", ensureAuthenticated, ensureSalesAgent, async (req, res) => {
//   try {
//     // Fetch all products for dropdown (including those with low or zero stock)
//     const products = await StockModel.find({}).lean();
//     console.log("Fetched products:", products); // Debug log

//     // Fetch sales by this agent
//     const sales = await SalesModel.find({ salesAgent: req.session.user.id || req.session.user._id })
//       .populate("salesAgent", "fullname")
//       .sort({ date: -1 })
//       .lean();

//     sales.forEach((sale) => {
//       sale.formattedDate = sale.date
//         ? new Date(sale.date).toLocaleDateString("en-GB")
//         : "N/A";
//     });

//     res.render("addsale", {
//       user: req.session.user,
//       formData: {},
//       sales,
//       products,
//       receipt: null,
//     });
//   } catch (err) {
//     console.error("Error in GET /addsale:", err.message);
//     // Fetch products even on error for GET
//     const products = await StockModel.find({}).lean();
//     console.log("Fetched products in catch:", products); // Debug log

//     // Fetch sales by this agent
//     const sales = await SalesModel.find({ salesAgent: req.session.user.id || req.session.user._id })
//       .populate("salesAgent", "fullname")
//       .sort({ date: -1 })
//       .lean();

//     sales.forEach((sale) => {
//       sale.formattedDate = sale.date
//         ? new Date(sale.date).toLocaleDateString("en-GB")
//         : "N/A";
//     });

//     res.render("addsale", {
//       user: req.session.user,
//       formData: {},
//       sales,
//       products,
//       receipt: null,
//     });
//   }
// });

// // ...existing code...
// router.post("/addsale", ensureAuthenticated, ensureSalesAgent, async (req, res) => {
//   try {
//     console.log("Session user ID (id):", req.session.user?.id);
//     console.log("Session user ID (_id):", req.session.user?._id);

//     const { customername, product, quantity, price, transport, paymentMethod, date } = req.body;
//     const qty = Number(quantity);
//     const unitPrice = Number(price);
//     let totalprice = qty * unitPrice;
//     if (transport === "yes") totalprice += totalprice * 0.05;

//     // Check stock
//     const stockItem = await StockModel.findOne({ product });
//     if (!stockItem || (Number(stockItem.quantity) || 0) < qty) {
//       throw new Error("Not enough stock available");
//     }

//     // Deduct stock (skip validation for performance)
//     await StockModel.findByIdAndUpdate(
//       stockItem._id,
//       { quantity: (Number(stockItem.quantity) || 0) - qty },
//       { runValidators: false }
//     );

//     // Save sale
//     const newSale = await SalesModel.create({
//       customername,
//       product,
//       quantity: qty,
//       price: unitPrice,
//       totalprice: totalprice, // fixed variable name
//       transport,
//       paymentMethod,
//       salesAgent: req.session.user?.id || req.session.user?._id || null,
//       date: date ? new Date(date) : new Date(),
//     });

//     // Fetch updated sales table
//     const sales = await SalesModel.find({ salesAgent: req.session.user.id || req.session.user._id })
//       .populate("salesAgent", "fullname")
//       .sort({ date: -1 })
//       .lean();

//     sales.forEach((sale) => {
//       sale.formattedDate = sale.date
//         ? new Date(sale.date).toLocaleDateString("en-GB")
//         : "N/A";
//     });

//     // Render page with updated table + receipt
//     res.render("addsale", {
//       user: req.session.user,
//       formData: {},
//       sales,
//       products,
//       receipt: newSale,
//     });
//     console.log("Rendering addsale with products:", products.length); // Debug log
//   } catch (err) {
//     console.error("Error in POST /addsale:", err.message);

//     // Even on error, fetch sales and products to show table and dropdown
//     const sales = await SalesModel.find({ salesAgent: req.session.user?.id || req.session.user?._id })
//       .populate("salesAgent", "fullname")
//       .sort({ date: -1 })
//       .lean();
//     const products = await StockModel.find({}).lean();
//     console.log("Fetched products on error:", products); // Debug log

//     sales.forEach((sale) => {
//       sale.formattedDate = sale.date
//         ? new Date(sale.date).toLocaleDateString("en-GB")
//         : "N/A";
//     });

//     res.render("addsale", {
//       user: req.session.user,
//       formData: req.body,
//       sales,
//       products,
//       receipt: null,
//       errorMessage: err.message,
//     });
//     console.log("Rendering addsale on error with products:", products.length); // Debug log
//   }
// });
// ======================
// MANAGER ROUTES
// ======================

// Manager's sales list with edit/delete actions
router.get(
  "/saleslist",
  ensureAuthenticated,
  ensureManager,
  async (req, res) => {
    try {
      const sales = await SalesModel.find()
        .populate("salesAgent", "fullname")
        .sort({ date: -1 })
        .lean();

      sales.forEach((sale) => {
        sale.formattedDate = sale.date
          ? new Date(sale.date).toLocaleDateString("en-GB")
          : "N/A";
      });

      res.render("saleslist", {
        user: req.session.user,
        sales,
        title: "Sales Management"
      });
    } catch (error) {
      console.error("Sales fetch error:", error.message);
      res.status(500).render("error", { message: "Error loading sales list" });
    }
  }
);

// Edit sale form
router.get(
  "/editsale/:id",
  ensureAuthenticated,
  ensureManager,
  async (req, res) => {
    try {
      const sale = await SalesModel.findById(req.params.id)
        .populate("salesAgent", "fullname")
        .lean();

      if (!sale) {
        return res.status(404).render("error", { message: "Sale not found" });
      }

      res.render("editsale", {
        sale,
        user: req.session.user,
        title: "Edit Sale"
      });
    } catch (err) {
      console.error("Edit fetch error:", err);
      res.status(500).render("error", { message: "Error loading sale for editing" });
    }
  }
);

// Update sale
router.post(
  "/editsale/:id",
  ensureAuthenticated,
  ensureManager,
  async (req, res) => {
    const { customername, product, quantity, price, transport, paymentMethod, date } =
      req.body;

    try {
      const qty = Number(quantity);
      const unitPrice = Number(price);
      let totalprice = qty * unitPrice;
      if (transport === "yes") totalprice += totalprice * 0.05;

      await SalesModel.findByIdAndUpdate(req.params.id, {
        customername,
        product,
        quantity: qty,
        price: unitPrice,
        transport,
        paymentMethod,
        date: date ? new Date(date) : new Date(),
        totalprice,
      });

      res.redirect("/saleslist");
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).render("error", { message: "Error updating sale" });
    }
  }
);

// Delete sale
router.post(
  "/deletesale/:id",
  ensureAuthenticated,
  ensureManager,
  async (req, res) => {
    try {
      const sale = await SalesModel.findById(req.params.id);

      if (!sale) {
        return res.status(404).render("error", { message: "Sale not found" });
      }

      // Restore stock when deleting sale
      const stockItem = await StockModel.findOne({ product: sale.product });
      if (stockItem) {
        await StockModel.findByIdAndUpdate(
          stockItem._id,
          { quantity: (Number(stockItem.quantity) || 0) + Number(sale.quantity) },
          { runValidators: false }
        );
      }

      await SalesModel.findByIdAndDelete(req.params.id);

      res.redirect("/saleslist");
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).render("error", { message: "Error deleting sale" });
    }
  }
);

module.exports = router;
