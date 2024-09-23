
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


function generateHexUUID() {
  const uuid = uuidv4();
  const hexUUID = Buffer.from(uuid.replace(/-/g, ''), 'hex').toString('hex');
  return hexUUID;
}

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email'
    ],
    unique: true,
  },
  fullName:
  {
   
    type: String,
    
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
  },
  userId: {
    type: String,
    default: generateHexUUID,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

const user = mongoose.model('user', UserSchema);
module.exports = user;
