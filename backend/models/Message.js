
const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  sender: { type: String, ref: 'User', required: true },
  receiver: { type: String, ref: 'User', required: true },
  content: { type: String},
  mediaUrl: { type: String},
  mediaType: { type: String },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  replyTo: { type: String, ref: 'Message', default: null }, 
  post: {
    user:
    {
      type: String,
       ref: 'User',
       
   },
    postId: { type: String, ref: 'Post' , default: null}, 
    caption: { type: String },           
    imageUrl: { type: String },     
    
  }
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
