const mongoose = require('mongoose');

const notificationsSchema = new mongoose.Schema({
  type: { type: String, required: true }, // low-stock, payment, delayed, order
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notifications', notificationsSchema);
