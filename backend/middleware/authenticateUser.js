
require("dotenv").config();
const jwt = require('jsonwebtoken');
const userr = require('../models/User');


const authenticateUser = async (req, res, next) => {
  console.log('Request path:', req.path);
 

  if (req.path.startsWith('/image')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader); 

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No Authorization header found or it does not start with Bearer'); // Debugging line
    return res.status(401).json({ error: 'Authentication invalid' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token from header:', token);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded payload:', payload); 
   

    const user = await userr.findOne({ userId: payload.userId, 'tokens.token': token });
    if (!user) {
      console.log('User not found with token'); 
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    console.log('Error in authentication:', error.message); 
    res.status(401).json({ error: 'Not authorized to access this resource' });
  }
};

module.exports = authenticateUser;
