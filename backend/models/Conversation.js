const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  participants: [{ type: String, ref: 'User', required: true }],
  latestMessage: { type: String, ref: 'Message' },
  updatedAt: { type: Date, default: Date.now },
  unreadCounts: {
    type: Map,
    of: Number,
    default: {}
  }
 },
  {timestamps:true},
  
  ); 

conversationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
