// External dependencies
const mongoId = require('mongoose').Types.ObjectId;

// Internal Dependencies
const Review = require('../models/review');
const Product = require('../models/product');
const expressError = require('../utils/expressError');
const catchAsync = require('../utils/catchAsync');

// Create New Review
const createReview = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.params.id)) return next(new expressError('Enter Valid Id.', 400));
  const getProduct = await Product.findById(req.params.id);
  if (!getProduct) return next(new expressError('Product Not Found', 404));
  const { rating, text } = req.body;
  if (rating < 1 || rating > 5)
    return next(new expressError('Rating Must Be Between 1 And 5.', 400));
  if (text.length < 10) return next(new expressError('Text Must Be At Least 10 Characters.', 400));

  const newReview = await new Review({
    rating,
    text,
    productId: req.params.id,
    user: req.user.id
  });
  const saveReview = await newReview.save();
  const createdReview = await Review.findById(saveReview._id).populate('user');

  const getReviews = await Review.find({ productId: req.params.id });
  let sum = 0;
  getReviews.forEach(item => {
    sum += item.rating;
  });
  let average = sum > 0 ? sum / getReviews.length : 0;
  getProduct.rating = average;
  getProduct.save();

  res.json({ review: createdReview, average });
});

// Get Review By Id
const getReviewById = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.params.id)) return next(new expressError('Enter Valid Id.', 400));
  const getReview = await Review.findById(req.params.id);
  if (!getReview) return next(new expressError('Review Could Not Found.', 404));
  res.json(getReview);
});

// Get All Product Reviews of a User
const getUserReviews = catchAsync(async (req, res, next) => {
  const user = req.user;

  const getReviews = await Review.find({ user: user.id })
    .sort({
      createdAt: 'desc'
    })
    .populate('productId');

  res.json(getReviews);
});

// Delete Review
const deleteReview = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.params.id)) return next(new expressError('Enter Valid Id.', 400));
  const getReview = await Review.findById(req.params.id);
  const getProduct = await Product.findById(getReview.productId);
  if (!getReview) return next(new expressError('Review Does Not Exist.', 404));
  if (getReview.user != req.user.id)
    return next(new expressError('You are not owner of this review.', 403));
  await Review.findByIdAndDelete(req.params.id);

  const getReviews = await Review.find({ productId: getReview.productId });
  let sum = 0;
  getReviews.forEach(item => {
    sum += item.rating;
  });
  let average = sum > 0 ? sum / getReviews.length : 0;
  getProduct.rating = average;
  getProduct.save();

  res.json({ message: 'Review successfully deleted.', average });
});

// Update Review
const updateReview = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.params.id)) return next(new expressError('Enter Valid Id.', 400));
  const getReview = await Review.findById(req.params.id);
  const getProduct = await Product.findById(getReview.productId);
  if (!getReview) return next(new expressError('Review Does Not Exist.', 404));
  if (getReview.user != req.user.id)
    return next(new expressError('You are not owner of this review.', 403));
  const { rating, text } = req.body;
  if (rating < 1 || rating > 5)
    return next(new expressError('Rating Must Be Between 1 And 5.', 400));
  if (text.length < 10) return next(new expressError('Text Must Be At Least 10 Characters.', 400));
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    {
      rating,
      text
    },
    { new: true }
  ).populate('user');

  const getReviews = await Review.find({ productId: getProduct._id });
  let sum = 0;
  getReviews.forEach(item => {
    sum += item.rating;
  });
  let average = sum > 0 ? sum / getReviews.length : 0;
  getProduct.rating = average;
  getProduct.save();

  res.json({ updatedReview, average });
});

// Get Reviews of a product
const getProductReviews = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.params.id)) return next(new expressError('Enter Valid Id.', 400));
  const getProduct = await Product.findById(req.params.id);
  if (!getProduct) return next(new expressError('Product Not Found', 404));
  const getReviews = await Review.find({ productId: getProduct._id })
    .sort({ createdAt: 'desc' })
    .populate('user');

  let sum = 0;
  getReviews.forEach(item => {
    sum += item.rating;
  });
  let average = sum > 0 ? sum / getReviews.length : 0;
  getProduct.rating = average;
  getProduct.save();

  res.json({ reviews: getReviews, average });
});

module.exports = {
  createReview,
  getReviewById,
  getUserReviews,
  deleteReview,
  updateReview,
  getProductReviews
};
