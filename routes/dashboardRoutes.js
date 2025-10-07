const express = require("express");
const router = express.Router();

// Import your models (exact names!)
const accountingModel = require("../models/accountingModel");
const analyticsModel = require("../models/analyticsModel");
const orderModel = require("../models/orderModel");
const salesModel = require("../models/salesModel");
const stockModel = require("../models/stockModel");
const suppliesModel = require("../models/SuppliesModel");
const notificationsModel = require("../models/notificationsModel");

// Dashboard GET route
router.get("/dashboard", async (req, res) => {
  try {
    // Total Sales
   const salesData = await salesModel.aggregate([
     {
       $project: {
         total: { $multiply: ["$price", "$quantity"] },
       },
     },
     {
       $group: {
         _id: null,
         totalSales: { $sum: "$total" },
       },
     },
   ]);

   const totalSales = salesData[0]?.totalSales || 0;


    // Active Agents (distinct agents in sales)
    const activeAgents = await salesModel.distinct("salesAgent");
    const totalAgents = activeAgents.length;

    // Pending Orders
    const pendingOrders = await orderModel.countDocuments({
      status: "pending",
    });

    // Products in Stock
    const totalStock = await stockModel.countDocuments();

    // Expenses (sum of all accounting expenses)
    const expensesData = await accountingModel.aggregate([
      { $group: { _id: null, total: { $sum: "$expenseAmount" } } },
    ]);
    const totalExpenses = expensesData[0]?.total || 0;

    // Net Profit = Total Sales - Expenses
    const netProfit = totalSales - totalExpenses;

    // Suppliers
    const totalSuppliers = await suppliesModel.countDocuments();

    // Notifications
    const notifications = await notificationsModel.find().sort({ date: -1 }).limit(4);

    res.render("dashboard", {
      totalSales,
      totalAgents,
      pendingOrders,
      totalStock,
      totalExpenses,
      netProfit,
      totalSuppliers,
      notifications,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
