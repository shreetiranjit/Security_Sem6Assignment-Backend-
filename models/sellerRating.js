// External Dependencies
const mongoose = require('mongoose');

// Mongoose Schema
const Schema = mongoose.Schema;

const SellerRatingSchema = new Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    seller: { type: String, required: true },
    sellerObject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop'
    }
  },
  { timestamps: true }
);

const SellerRating = mongoose.model('SellerRating', SellerRatingSchema);

// Export Model
module.exports = SellerRating;
