"use strict";

// models/Message.js
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var messageSchema = new mongoose.Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String
  },
  read: {
    type: Boolean,
    "default": false
  },
  timestamp: {
    type: Date,
    "default": Date.now
  }
});
var Message = mongoose.model('Message', messageSchema);
module.exports = Message;