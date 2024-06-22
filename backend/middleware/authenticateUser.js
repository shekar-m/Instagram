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
const jwt = require('jsonwebtoken');
const userr = require('../models/User');


const authenticateUser = async (req, res, next) => {
  console.log('Request path:', req.path); // Debugging line

  // Allow public access to image endpoints
  if (req.path.startsWith('/image')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader); // Debugging line

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No Authorization header found or it does not start with Bearer'); // Debugging line
    return res.status(401).json({ error: 'Authentication invalid' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token from header:', token); // Debugging line

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded payload:', payload); // Debugging line

    const user = await userr.findOne({ userId: payload.userId, 'tokens.token': token });
    if (!user) {
      console.log('User not found with token'); // Debugging line
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log('Error in authentication:', error.message); // Debugging line
    res.status(401).json({ error: 'Not authorized to access this resource' });
  }
};

module.exports = authenticateUser;
