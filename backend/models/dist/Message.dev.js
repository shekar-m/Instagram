"use strict";

var mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    ref: 'User',
    required: true
  },
  receiver: {
    type: String,
    ref: 'User',
    required: true
  },
  content: {
    type: String
  },
  mediaUrl: {
    type: String
  },
  mediaType: {
    type: String
  },
  timestamp: {
    type: Date,
    "default": Date.now
  },
  read: {
    type: Boolean,
    "default": false
  },
  replyTo: {
    type: String,
    ref: 'Message',
    "default": null
  },
  post: {
    user: {
      type: String,
      ref: 'User'
    },
    postId: {
      type: String,
      ref: 'Post',
      "default": null
    },
    // Reference to the original post
    caption: {
      type: String
    },
    // Caption of the shared post
    imageUrl: {
      type: String
    } // Image or video URL of the shared post

  }
});
var Message = mongoose.model('Message', messageSchema);
module.exports = Message;