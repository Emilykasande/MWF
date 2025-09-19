const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const supplierSchema = new mongoose.Schema({
  suppliername: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  supplierphone: {
    type: String,
    required: true,
  },
});

supplierSchema.plugin(passportLocalMongoose, {
       usenameField:'email'
});
module.exports = mongoose.model("SupplierModel", supplierSchema);
