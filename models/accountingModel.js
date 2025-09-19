const mongoose = require("mongoose");

const accountingSchema = new mongoose.Schema({
  sales: Number,
  cogs: Number,
  expenses: Number,
  salaries: Number,
  rent: Number,
  utilities: Number,
  marketing: Number,
  cashFlow: [Number],
  receivables: Number,
  payables: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Accounting", accountingSchema);
