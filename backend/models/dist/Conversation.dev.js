"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var conversationSchema = new Schema({
  participants: [{
    type: String,
    ref: 'User',
    required: true
  }],
  latestMessage: {
    type: String,
    ref: 'Message'
  },
  updatedAt: {
    type: Date,
    "default": Date.now
  }
});
conversationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});
var Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;