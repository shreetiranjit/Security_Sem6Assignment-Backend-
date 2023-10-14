// External Dependencies
const mongoose = require('mongoose');

// Mongoose Schema
const Schema = mongoose.Schema;

// Cart Schema
const cartSchema = new Schema(
  {
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
        color: String,
        quantity: Number,
        selected: Boolean
      }
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

const Cart = mongoose.model('Cart', cartSchema);

// Export the model
module.exports = Cart;
