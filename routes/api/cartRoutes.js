// External Dependencies
const express = require('express');

// Internal Dependencies
const { isUser } = require('../../middlewares/isAuth');
const cartController = require('../../controllers/cart');

// Express Router
const Router = express.Router();

/*
 * @route   POST /update
 * @desc    Update User Cart
 * @access  Private
 */
Router.post('/update', isUser, cartController.updateCart);

/*
 * @route   POST /check_unauthorized
 * @desc    Check Unauthorized User Cart
 * @access  Public
 */
Router.post('/check_unauthorized', cartController.getCartUnauthorized);

/*
 * @route   GET /
 * @desc    Get User Cart
 * @access  Private
 */
Router.get('/', isUser, cartController.getUserCart);

/*
 * @route   DELETE /remove_all
 * @desc    Delete Cart
 * @access  Private
 */
Router.delete('/remove_all', isUser, cartController.removeAllCart);

module.exports = Router;
