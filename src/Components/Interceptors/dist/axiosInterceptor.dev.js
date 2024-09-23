"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// Create an Axios instance
var axiosInstance = _axios["default"].create({
  baseURL: 'http://localhost:8001/api',
  headers: {
    'Content-Type': 'application/json'
  }
}); // Add a request interceptor


axiosInstance.interceptors.request.use(function (config) {
  // Get the token from localStorage
  var token = localStorage.getItem('token');
  console.log('Token: in interceptor', token);

  if (token) {
    // Set the Authorization header for every request
    config.headers.Authorization = "Bearer ".concat(token);
  }

  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});
var _default = axiosInstance;
exports["default"] = _default;