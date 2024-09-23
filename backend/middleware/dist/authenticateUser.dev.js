"use strict";

// middleware/authenticateUser.js
// require("dotenv").config();
// const jwt = require('jsonwebtoken');
// const userr = require('../models/User');
// const authenticateUser = async (req, res, next) => {
//   console.log('Request path:', req.path); // Debugging line
//   // Allow public access to image endpoints
//   if (req.path.startsWith('/image')) { 
//     return next();
//   }
//   const authHeader = req.header('Authorization');
//   const token = authHeader ? authHeader.replace('Bearer ', '') : undefined;
//   console.log('Authorization header:', authHeader); // Debugging line
//   console.log('Token from header:', token); // Debugging line
//   if (!token) {
//     return res.status(401).json({ error: 'No token provided' });
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await userr.findOne({ userId: decoded.userId, 'tokens.token': token });
//     if (!user) {
//       throw new Error();
//     }
//     req.token = token;
//     req.user = user;
//     next();
//   } catch (error) {
//     res.status(401).json({ error: 'Not authorized to access this resource' });
//   }
// };
// module.exports = authenticateUser;
// middleware/authenticateUser.js
require("dotenv").config();

var jwt = require('jsonwebtoken');

var userr = require('../models/User');

var mongoose = require('mongoose');

var authenticateUser = function authenticateUser(req, res, next) {
  var authHeader, token, payload, user;
  return regeneratorRuntime.async(function authenticateUser$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log('Request path:', req.path); // Debugging line
          // Allow public access to image endpoints

          if (!req.path.startsWith('/image')) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", next());

        case 3:
          authHeader = req.headers.authorization;
          console.log('Authorization header:', authHeader); // Debugging line

          if (!(!authHeader || !authHeader.startsWith('Bearer '))) {
            _context.next = 8;
            break;
          }

          console.log('No Authorization header found or it does not start with Bearer'); // Debugging line

          return _context.abrupt("return", res.status(401).json({
            error: 'Authentication invalid'
          }));

        case 8:
          token = authHeader.split(' ')[1];
          console.log('Token from header:', token); // Debugging line

          _context.prev = 10;
          payload = jwt.verify(token, process.env.JWT_SECRET);
          console.log('Decoded payload:', payload); // Debugging line

          _context.next = 15;
          return regeneratorRuntime.awrap(userr.findOne({
            userId: payload.userId,
            'tokens.token': token
          }));

        case 15:
          user = _context.sent;

          if (user) {
            _context.next = 19;
            break;
          }

          console.log('User not found with token'); // Debugging line

          throw new Error();

        case 19:
          req.token = token;
          req.user = user;
          next();
          _context.next = 28;
          break;

        case 24:
          _context.prev = 24;
          _context.t0 = _context["catch"](10);
          console.log('Error in authentication:', _context.t0.message); // Debugging line

          res.status(401).json({
            error: 'Not authorized to access this resource'
          });

        case 28:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[10, 24]]);
};

module.exports = authenticateUser;