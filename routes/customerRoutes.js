const express = require("express");
const router = express.Router();
const CustomerModel = require("../models/customerModel");

// Route: show customers
router.get("/", async (req, res) => {
  try {
    const query = req.query.q ? req.query.q.trim() : "";

    // Build filter for search
    let filter = {};
    if (query) {
      filter = {
        $or: [
          { name: { $regex: query, $options: "i" } }, // search customer name
          { email: { $regex: query, $options: "i" } }, // search email
          { phone: { $regex: query, $options: "i" } }, // search phone
        ],
      };
    }

    const customers = await CustomerModel.find(filter);

    // Check if staff is logged in
    const isStaff = req.session.user && req.session.user.role === "staff";

    // Pass customers + role info to the template
    res.render("customers", { customers, isStaff, query });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
