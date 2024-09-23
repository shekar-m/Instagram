"use strict";

var mongoose = require('mongoose');

var notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  // e.g., 'message', 'like', 'comment'
  content: {
    type: String,
    required: true
  },
  // The content of the notification
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  // User receiving the notification
  read: {
    type: Boolean,
    "default": false
  },
  // Whether the notification has been read
  createdAt: {
    type: Date,
    "default": Date.now
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  } // For additional data like messageId, postId, etc.

});
module.exports = mongoose.model('Notification', notificationSchema);