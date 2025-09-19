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
  },
  { timestamps: true }
);


function calculateStatus(quantity) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity < 5) return "Low Stock";
  return "Available";
}


stockSchema.pre("save", function (next) {
  this.status = calculateStatus(this.quantity);
  next();
});


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
