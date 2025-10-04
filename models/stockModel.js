const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    product: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ["wood", "furniture"],
      required: true,
    },
    status: {
      type: String,
      default: "Available",
    },
    supplier: {
      type: String,
      required: true,
    },
    supplierEmail: {
       type: String,
        required: true,
       },
    supplierContact: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Utility to calculate status based on quantity
function calculateStatus(quantity) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity < 5) return "Low Stock";
  return "Available";
}

// Pre-save hook to update status automatically
stockSchema.pre("save", function (next) {
  this.status = calculateStatus(this.quantity);
  next();
});

// Pre-update hooks to maintain status on quantity changes
stockSchema.pre(
  ["findOneAndUpdate", "updateOne", "updateMany"],
  function (next) {
    const update = this.getUpdate();
    if (update.quantity !== undefined) {
      update.status = calculateStatus(update.quantity);
      this.setUpdate(update);
    }
    next();
  }
);

const Stock = mongoose.model("Stock", stockSchema);

module.exports = Stock;
