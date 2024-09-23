"use strict";

var _require = require("express/lib/response"),
    type = _require.type;

var mongoose = require("mongoose");

var Schema = mongoose.Schema;
var profileSchema = new Schema({
  userId: {
    type: String,
    unique: true,
    required: true
  },
  Bio: {
    type: String,
    required: true
  },
  Gender: {
    type: String,
    required: true
  },
  ProfileImageURL: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    "default": Date.now
  }
});
var profileDB = mongoose.model("profileModel", profileSchema);
module.exports = profileDB;