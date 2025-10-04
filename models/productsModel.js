const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  img: { type: String, required: true }, // path to image
});

module.exports = mongoose.model("Product", productSchema);
