// External Dependencies
const express = require('express');

// Internal Dependencies
const Wishlist = require('../../models/wishlist');
const wishlistController = require('../../controllers/wishlist');
const { isUser } = require('../../middlewares/isAuth');

// Router
const Router = express.Router();

/*
 * @route   GET /
 * @desc    Get Wishlist of the current user
 * @access  Private
 */
Router.get('/', isUser, wishlistController.getWishlist);

/*
 * @route   POST /update
 * @desc    Update Wishlist
 * @access  Private
 */
Router.post('/update', isUser, wishlistController.updateWishlist);

/*
 * @route   DELETE /remove_all
 * @desc    Update Wishlist
 * @access  Private
 */
Router.delete('/remove_all', isUser, wishlistController.removeAllWishlist);

module.exports = Router;
