const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  latestMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  updatedAt: { type: Date, default: Date.now }
});

conversationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
