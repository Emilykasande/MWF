const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const registerSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type:String,
    required:true
  },
  position: {
     type:String,
     required:true
  },
  password: {
    type:String,
    required:true
  }
});

registerSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
});
module.exports = mongoose.model("UserModel", registerSchema);
