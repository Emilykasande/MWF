// routes/orders.js
const express = require("express");
const router = express.Router();
const Order = require("../models/orderModel");
const SalesModel = require("../models/salesModel");
const PDFDocument = require("pdfkit");

// Fetch all orders and render orders.pug
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ date: -1 }).lean();
    res.render("orders", { orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("Server Error");
  }
});

// Legacy order placement route - keeping for backward compatibility but not recommended
router.post("/place-order", async (req, res) => {
  try {
    const { customerName, phoneNumber, address, items, total } = req.body;

    console.log("Legacy place-order request:", {
      customerName,
      phoneNumber,
      address,
      itemsCount: items?.length,
      total
    });

    if (!customerName || !phoneNumber || !address || !items || !total) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newOrder = new Order({
      customerName,
      phoneNumber,
      address,
      items,
      total,
    });

    await newOrder.save();
    res.json({ success: true, message: "Order placed successfully!" });
  } catch (err) {
    console.error("Legacy place-order error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Clear an order by adding to sales instead of deleting
router.delete("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Add to sales if order is delivered
    if (order.status === 'delivered') {
      const salesEntry = new SalesModel({
        customername: order.customerName,
        product: order.items.map(item => item.name).join(', '), // Combine item names
        quantity: order.items.reduce((sum, item) => sum + item.quantity, 0), // Total quantity
        price: order.total / order.items.reduce((sum, item) => sum + item.quantity, 1), // Average price per item
        totalprice: order.total,
        transport: order.address, // Assuming address as transport info
        salesAgent: req.user ? req.user._id : null, // Assuming user is set in middleware
        paymentMethod: 'Cash', // Default or from order if available
        date: order.date,
        isFromClearedOrder: true, // Flag to indicate this is from a cleared order
      });
      await salesEntry.save();
      console.log('Order added to sales:', order._id);
    }

    // Remove the order after adding to sales
    await Order.findByIdAndDelete(req.params.id);
    console.log('Order deleted:', req.params.id);
    res.json({ success: true, message: "Order cleared and added to sales successfully" });
  } catch (err) {
    console.error("Error clearing order:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update order status to delivered
router.put("/orders/:id/deliver", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { status: 'delivered' }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order marked as delivered" });
  } catch (err) {
    console.error("Error updating order status:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// New route for managers to view sales
router.get("/managersales", async (req, res) => {
  try {
    const sales = await SalesModel.find({ isFromClearedOrder: true }).populate('salesAgent', 'username').sort({ date: -1 }).lean();
    res.render("managersales", { sales });
  } catch (err) {
    console.error("Error fetching sales:", err);
    res.status(500).send("Server Error");
  }
});

// Delete a sales entry (only for cleared orders)
router.delete("/sales/:id", async (req, res) => {
  try {
    const sale = await SalesModel.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: "Sale not found" });
    }
    if (!sale.isFromClearedOrder) {
      return res.status(403).json({ success: false, message: "Cannot delete non-cleared order sales" });
    }
    await SalesModel.findByIdAndDelete(req.params.id);
    console.log('Sale deleted:', req.params.id);
    res.json({ success: true, message: "Sale deleted successfully" });
  } catch (err) {
    console.error("Error deleting sale:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Generate PDF report for manager sales
router.get("/managersales/pdf", async (req, res) => {
  try {
    const sales = await SalesModel.find({ isFromClearedOrder: true }).populate('salesAgent', 'username').sort({ date: -1 }).lean();

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="online_sales_report.pdf"');
    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Online Sales Report - Mayondo Wood And Furniture', { align: 'center' });
    doc.moveDown();

    // Table Header
    const tableTop = 150;
    const rowHeight = 20;
    let y = tableTop;

    doc.fontSize(12).text('Customer', 50, y);
    doc.text('Product', 150, y);
    doc.text('Quantity', 250, y);
    doc.text('Price', 320, y);
    doc.text('Total Price', 380, y);
    doc.text('Sales Agent', 450, y);
    doc.text('Date', 520, y);
    y += rowHeight;

    // Draw line
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;

    // Table Rows
    sales.forEach(sale => {
      doc.text(sale.customername, 50, y);
      doc.text(sale.product, 150, y);
      doc.text(sale.quantity.toString(), 250, y);
      doc.text(`UGX ${sale.price}`, 320, y);
      doc.text(`UGX ${sale.totalprice}`, 380, y);
      doc.text(sale.salesAgent ? sale.salesAgent.username || 'N/A' : 'N/A', 450, y);
      doc.text(new Date(sale.date).toLocaleString(), 520, y);
      y += rowHeight;
    });

    doc.end();
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).send("Error generating PDF");
  }
});

module.exports = router;
