// External Dependencies
const express = require('express');

// Internal Dependencies
const { isUser, isShop } = require('../../middlewares/isAuth');
const sellerRatingController = require('../../controllers/sellerRating');

// Express Router
const Router = express.Router();

/*
 * @route   POST /
 * @desc    Rate Seller
 * @access  Private
 */
Router.post('/', isUser, sellerRatingController.rateSeller);

/*
 * @route   GET /seller_ratings
 * @desc    Get Seller Ratings of a Seller
 * @access  Private
 */
Router.get('/seller_ratings', isShop, sellerRatingController.getSellerRatings);

/*
 * @route   GET /user_ratings
 * @desc    Get All Shop Ratings of a user
 * @access  Private
 */
Router.get('/user_ratings', isUser, sellerRatingController.getUserRatings);

/*
 * @route   DELETE /:id
 * @desc    Delete Individual Rating
 * @access  Private
 */
Router.delete('/:id', isUser, sellerRatingController.deleteRating);

/*
 * @route   POST /calculate_seller_rating
 * @desc    Calculate Seller Rating
 * @access  Public
 */
Router.post('/calculate_seller_rating', sellerRatingController.calculateSellerRating);

module.exports = Router;
