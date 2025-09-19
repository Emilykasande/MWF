// models/orderModel.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    status: { type: String, default: "Pending" },
    items: [
      {
        productId: { type: String, required: true }, // changed to String
        name: String,
        price: Number,
        quantity: { type: Number, required: true },
      },
    ],
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
