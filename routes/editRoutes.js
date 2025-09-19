// const express = require("express");
// const router = express.Router();
// const SalesModel = require("../models/salesModel");
// const { ensureAuthenticated, ensureManager } = require("../middleware/auth");

// // GET edit sale form
// router.get(
//   "/editsale/:id",
//   ensureAuthenticated,
//   ensureManager,
//   async (req, res) => {
//     try {
//       const sale = await SalesModel.findById(req.params.id).lean();
//       if (!sale) return res.status(404).send("Sale not found");
//       res.render("editsale", { sale, user: req.session.user });
//     } catch (err) {
//       console.error("Edit fetch error:", err.message);
//       res.redirect("/sales");
//     }
//   }
// );

// // POST updated sale
// router.post(
//   "/editsale/:id",
//   ensureAuthenticated,
//   ensureManager,
//   async (req, res) => {
//     try {
//       const {
//         customername,
//         product,
//         quantity,
//         price,
//         transport,
//         paymentMethod,
//       } = req.body;
//       await SalesModel.findByIdAndUpdate(req.params.id, {
//         customername,
//         product,
//         quantity,
//         price,
//         transport,
//         paymentMethod,
//       });
//       res.redirect("/sales");
//     } catch (err) {
//       console.error("Update error:", err.message);
//       res.redirect("/sales");
//     }
//   }
// );

// module.exports = router;
