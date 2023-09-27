// External Dependencies
const jwt = require('jsonwebtoken');

// Internal Dependencies
const expressError = require('../utils/expressError');
const { JWT } = require('../config/keys');

// Middleware to get user by user-token
module.exports.isUser = function (req, res, next) {
  const token = req.headers['user-token'];

  if (!token) next(new expressError('Login To See The Content.', 401));

  try {
    const decoded = jwt.verify(token, JWT.JWT_TOKEN_SECRET);
    req.user = decoded;
    req.shop = null;
    next();
  } catch (err) {
    next(new expressError('Login to See The Content', 401));
  }
};

module.exports.isShop = function (req, res, next) {
  const token = req.headers['shop-token'];

  if (!token) next(new expressError('Login To See The Content.', 401));

  try {
    const decoded = jwt.verify(token, JWT.JWT_TOKEN_SECRET);
    req.user = null;
    req.shop = decoded;
    next();
  } catch (err) {
    next(new expressError('Login to See The Content', 401));
  }
};

// To Check f the user is logged In
module.exports.isLoggedIn = function (req, res, next) {
  const userToken = req.headers['user-token'];
  const shopToken = req.headers['shop-token'];

  try {
    const decoded = jwt.verify(userToken ? userToken : shopToken, JWT.JWT_TOKEN_SECRET);
    req.user = userToken ? decoded : null;
    req.shop = userToken ? null : decoded;
    next();
  } catch (err) {
    next(new expressError('Login To See The Content', 401));
  }
};
