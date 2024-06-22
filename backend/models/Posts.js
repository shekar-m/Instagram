const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const postSchema = new mongoose.Schema({
    user: { type: String, ref: 'User', required: true },
    caption: { type: String, required: true },
    imageUrl: { type: String, required: true },
    date: {
      type:String
    },
  });
  const Postss = mongoose.model('Posts', postSchema);
  module.exports=Postss
  