"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _socket = _interopRequireDefault(require("socket.io-client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// src/socket.js
var Socket = (0, _socket["default"])('http://localhost:8001', {
  transports: ['websocket', 'polling'],
  withCredentials: true
});
var _default = Socket;
exports["default"] = _default;