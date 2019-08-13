const jwt = require('jsonwebtoken');
const config = require('config');
require('dotenv').config();

module.exports = (req, res, next) => {
  // get the token from the request header
  const token = req.headers['x-access-token'] || req.headers['authorization'];

  if (!token) return res.status(401).send('Access denied. No token found.');

  try {
    // if the token can be verified, we set req.user and pass to next middleware
    req.user = jwt.verify(token, config.get(process.env.PRIVATE_JWT_KEY));
    next();
  } catch (e) {
    res.status(400).send('Invalid token.');
  }
};