// External Dependencies
const mongoose = require('mongoose');

// Schema
const Schema = mongoose.Schema;

const wishlistSchema = new Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wishlist', wishlistSchema);
