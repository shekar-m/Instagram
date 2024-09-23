const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true },
  content: { type: String }, 
  userId: { type: String, ref: 'User', required: true }, 
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  data: { type: mongoose.Schema.Types.Mixed },  
});

module.exports = mongoose.model('Notification', notificationSchema);