const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    nin: { type: String, required: true },
    position: { type: String, required: true },
    staffId: { type: String, required: true, unique: true },
    nextOfKin: { type: String, required: true },
    nextOfKinPhone: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    
  },
  { collection: "users" }
);

module.exports = mongoose.model("UserModel", userSchema);
