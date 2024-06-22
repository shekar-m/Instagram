"use strict";

// const mongoose = require('mongoose')
// const { v4: uuidv4 } = require('uuid');
// const bcrypt = require('bcryptjs')
// const { JsonWebTokenError } = require('jsonwebtoken')
// const jwt = require('jsonwebtoken')
// function generateHexUUID() {
//   const uuid = uuidv4();
//   const hexUUID = Buffer.from(uuid.replace(/-/g, ''), 'hex').toString('hex');
//   return hexUUID;
// } 
// const UserSchema = new mongoose.Schema({
//     username:{
//         type:'string',
//         require:[true,'please provide a username'],
//         match:[
//         /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//         'please provide valid email'
//         ],
//         unique:true,
//     },
//     password:{
//         type:'string',
//         require:[true,'please provide a password'],
//         minlength:6,
//     },
//     userId: {
//         type: String,
//         default: generateHexUUID, // Generate a hexadecimal UUID for each user by default
//         unique: true,
//       },
//       createdAt: {
//         type: Date,
//         default: Date.now,
//       },
// });
// UserSchema.pre('save', async function (next) {
//   const user = this;
//   if (user.isModified('password')) {
//     user.password = await bcrypt.hash(user.password, 8);
//   }
//   next();
// });
// // UserSchema.methods.createJWT = function () {
// //   return jwt.sign({userId:this._id,name:this.name},process.env.JWT_SECRET,{
// //       expiresIn:JWT_LIFETIME,
// //   })
// // }
// // UserSchema.methods.comparePassword = async function(canditatePassword) {
// //   const isMatch = await bcrypt.compare(canditatePassword,this.password)
// //   return isMatch
// // }
// const user = mongoose.model('user', UserSchema);
// module.exports=user
// models/User.js
var mongoose = require('mongoose');

var _require = require('uuid'),
    uuidv4 = _require.v4;

var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

function generateHexUUID() {
  var uuid = uuidv4();
  var hexUUID = Buffer.from(uuid.replace(/-/g, ''), 'hex').toString('hex');
  return hexUUID;
}

var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please provide a valid email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  userId: {
    type: String,
    "default": generateHexUUID,
    unique: true
  },
  createdAt: {
    type: Date,
    "default": Date.now
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}); // UserSchema.methods.generateAuthToken = async function () {
//   const user = this;
//   const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
//   user.tokens = user.tokens.concat({ token });
//   await user.save();
//   return token;
// };
// UserSchema.methods.comparePassword = async function (candidatePassword) {
//   const isMatch = await bcrypt.compare(candidatePassword, this.password);
//   return isMatch;
// };

var user = mongoose.model('user', UserSchema);
module.exports = user;