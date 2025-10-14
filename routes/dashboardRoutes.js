const express = require("express");
const router = express.Router();

// Import your models (exact names!)
const accountingModel = require("../models/accountingModel");
const analyticsModel = require("../models/analyticsModel");
const orderModel = require("../models/orderModel");
const salesModel = require("../models/salesModel");
const stockModel = require("../models/stockModel");
const userModel = require("../models/userModel");
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


    // Active Agents (only count actual sales agents from user model)
    const validSalesAgentIds = await userModel.distinct("_id", { position: "sales Agent" });
    const activeAgents = await salesModel.distinct("salesAgent", { salesAgent: { $in: validSalesAgentIds } });
    const totalAgents = activeAgents.length;

    // Pending Orders
    const pendingOrders = await orderModel.countDocuments({
      status: "pending",
    });

    // Products in Stock
    const totalStock = await stockModel.countDocuments();

    // Expenses (sum of all accounting expenses)
    const expensesData = await accountingModel.aggregate([
      { $group: { _id: null, total: { $sum: "$expenses" } } },
    ]);
    const totalExpenses = expensesData[0]?.total || 0;

    // Net Profit = Total Sales - Expenses
    const netProfit = totalSales - totalExpenses;

    // Suppliers (get unique suppliers from stock model)
    const suppliersData = await stockModel.aggregate([
      {
        $group: {
          _id: "$supplier",
          supplierEmail: { $first: "$supplierEmail" },
          supplierContact: { $first: "$supplierContact" }
        }
      },
      {
        $match: { _id: { $ne: null, $ne: "" } }
      }
    ]);
    const totalSuppliers = suppliersData.length;

    // Generate dynamic notifications
    const notifications = [];

    // 1. Low Stock Alerts
    const lowStockItems = await stockModel.find({ quantity: { $lt: 10 } }).limit(5);
    lowStockItems.forEach(item => {
      notifications.push({
        type: 'low-stock',
        message: `Low stock alert: ${item.product} has only ${item.quantity} units remaining`,
        date: new Date()
      });
    });

    // 2. New Orders (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const newOrders = await orderModel.countDocuments({ createdAt: { $gte: oneDayAgo } });
    if (newOrders > 0) {
      notifications.push({
        type: 'order',
        message: `${newOrders} new order(s) received in the last 24 hours`,
        date: new Date()
      });
    }

    // 3. New Deliveries (last 24 hours)
    const newDeliveries = await stockModel.countDocuments({ date: { $gte: oneDayAgo } });
    if (newDeliveries > 0) {
      notifications.push({
        type: 'delivery',
        message: `${newDeliveries} new item(s) delivered in the last 24 hours`,
        date: new Date()
      });
    }

    // 4. Most Sold Items (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const topSelling = await salesModel.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: '$product',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 }
    ]);

    topSelling.forEach((item, index) => {
      notifications.push({
        type: 'top-seller',
        message: `#${index + 1} best seller: ${item._id} (${item.totalQuantity} units sold, UGX ${item.totalRevenue.toLocaleString()})`,
        date: new Date()
      });
    });

    // Sort notifications by date (newest first) and limit to 4
    notifications.sort((a, b) => b.date - a.date);
    const recentNotifications = notifications.slice(0, 4);

    res.render("dashboard", {
      totalSales,
      totalAgents,
      pendingOrders,
      totalStock,
      totalExpenses,
      netProfit,
      totalSuppliers,
      notifications: recentNotifications,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
