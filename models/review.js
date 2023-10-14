// External Dependencies
const mongoose = require('mongoose');

// Mongoose Schema
const Schema = mongoose.Schema;

const reviewSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    text: {
      type: String,
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);

// Export the model
module.exports = Review;
