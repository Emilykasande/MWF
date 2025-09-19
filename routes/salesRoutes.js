const express = require("express");
const router = express.Router();
const {ensureAuthenticated,ensuresalesAgent,ensureManager,} = require("../middleware/auth");

const SalesModel = require("../models/salesModel");

// GET add sale form – only sales agents/recept.
router.get("/addsale", ensureAuthenticated, ensuresalesAgent, (req, res) => {
  res.render("addsale", { user: req.user, formData: {}, receipt: null });
});

// GET all sales/any authenticated user
router.get("/sales", ensureAuthenticated, async (req, res) => {
  try {
    const sales = await SalesModel.find()
      .populate("salesAgent", "fullname")
      .sort({ date: -1 })
      .lean();

     //date.
    sales.forEach((s) => {
      s.formattedDate = new Date(s.date).toLocaleString("en-UG", {
        timeZone: "Africa/Kampala",
      });
    });

    res.render("saleslist", { sales, user: req.user });
  } catch (error) {
    console.error("Sales fetch error:", error.message);
    res.redirect("/");
  }
});

// POST new sale – only sales agents
router.post(
  "/sales",
  ensureAuthenticated,
  ensuresalesAgent,
  async (req, res) => {
    try {
      const {
        customername,
        product,
        quantity,
        price,
        transport,
        paymentMethod,
      } = req.body;

      // Convert to numbers and calculate total
      const qty = Number(quantity);
      const unitPrice = Number(price);
      let total = qty * unitPrice;
      if (transport === "yes"){
        total += total * 0.05;
      } 
      console.log(total);

      // totalprice = Math.round(total * 100) / 100;

      //Create and save sale
      const newSale = new SalesModel({
        customername,
        product,
        quantity: qty,
        price: unitPrice,
        transport,
        salesAgent: req.user._id, // Passport user ID
        paymentMethod,
        date: new Date(),
        total,
      });

      await newSale.save();

      // Populate salesAgent fullname for the receipt
      const saleWithAgent = await SalesModel.findById(newSale._id)
        .populate("salesAgent", "fullname")
        .lean();

      // Render the same page with receipt
      res.render("addsale", {
        user: req.user,
        formData: {}, // clear form
        receipt: saleWithAgent, // send populated sale to pug
      });
    } catch (error) {
      console.error("Error recording sale:", error.message);
      // In case of error, keep form data
      res.render("addsale", {
        user: req.user,
        formData: req.body,
        receipt: null,
      });
    }
  }
);

router.post("/sales/delete", ensureAuthenticated, ensureManager, async (req, res) => {
  try {
    const { id } = req.body;
    await SalesModel.findByIdAndDelete(id);
    res.redirect("/sales");
  } catch (err) {
    console.error("Delete error:", err);
    res.redirect("/sales");
  }
});

// GET edit sale form – only managers
router.get("/editsale/:id", ensureAuthenticated,ensureManager,async (req, res) => {
    try {
      const sale = await SalesModel.findById(req.params.id).lean();
      if (!sale) return res.status(404).send("Sale not found");

      res.render("editsale", { sale, user: req.user });
    } catch (err) {
      console.error("Edit fetch error:", err);
      res.redirect("/sales");
    }
  }
);

// POST update sale – only managers
router.post("/editsale/:id",ensureAuthenticated,ensureManager,async (req, res) => {
    const { customername, product, quantity, price, transport, paymentMethod } =
      req.body;
    try {
      await SalesModel.findByIdAndUpdate(req.params.id, {
        customername,
        product,
        quantity,
        price,
        transport,
        paymentMethod,
      });
      res.redirect("/sales");
    } catch (err) {
      console.error("Update error:", err);
      res.redirect("/sales");
    }
  }
);






module.exports = router;
