const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  customername: String,
  product: String,
  quantity: Number,
  price: Number,
  totalprice: Number,
  transport: String,
  salesAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
  },
  paymentMethod: String,
  date: Date,
  isFromClearedOrder: { type: Boolean, default: false }, // Flag to distinguish cleared orders
});

// Prevent OverwriteModelError
module.exports =
  mongoose.models.SalesModel || mongoose.model("SalesModel", salesSchema);
