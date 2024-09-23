const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    user:
     {
       type: String,
        ref: 'User',
         required: true 
    },
    caption:
     { 
      type: String,
       required: true
       },
    imageUrl:
     { 
      type: String, 
      required: true
     },
    date: {
      type:String
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{
      type: String,
      ref: 'User',
    }]
  });
  const Postss = mongoose.model('Posts', postSchema);
  module.exports=Postss
  