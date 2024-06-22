"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var conversationSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  latestMessage: {
    type: Schema.Types.ObjectId,
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