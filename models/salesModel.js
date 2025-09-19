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
    required: true,
  },
  // payment: String,
  paymentMethod: String,
  date: Date,
});

module.exports = mongoose.model("SalesModel", salesSchema);
