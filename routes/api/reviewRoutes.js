// External Dependencies
const express = require('express');

// Internal Dependencies
const { isUser } = require('../../middlewares/isAuth');
const reviewController = require('../../controllers/review');

// Express Router
const Router = express.Router();

/*
 * @route   POST /product/:id/review
 * @desc    Add New Review to the product
 * @access  Private
 */
Router.post('/product/:id/review', isUser, reviewController.createReview);

/*
 * @route   GET /review
 * @desc    Get Review By Id
 * @access  Public
 */
Router.get('/:id', reviewController.getReviewById);

/*
 * @route   GET /user/reviews
 * @desc    Get All User Reviews
 * @access  Private
 */
Router.get('/user/reviews', isUser, reviewController.getUserReviews);

/*
 * @route   DELETE /:id
 * @desc    Delete Review
 * @access  Private
 */
Router.delete('/:id', isUser, reviewController.deleteReview);

/*
 * @route   PUT /:id
 * @desc    Update Review
 * @access  Private
 */
Router.put('/:id', isUser, reviewController.updateReview);

/*
 * @route   GET /product/:id
 * @desc    Get All Reviews of a Product
 * @access  Public
 */
Router.get('/product/:id', reviewController.getProductReviews);

module.exports = Router;
