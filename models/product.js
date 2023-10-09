// External Dependencies
const mongoose = require('mongoose');

// Mongoose Schema
const Schema = mongoose.Schema;

// Options
const strOptions = { type: String, required: true };
const numberOptions = { type: Number, required: true, min: 0 };

// Image Schema
const imageSchema = new Schema({
  url: String,
  filename: String
});

// Product Schema
const productSchema = new Schema(
  {
    title: strOptions,
    price: numberOptions,
    description: strOptions,
    stock: numberOptions,
    images: [imageSchema],
    brand: strOptions,
    colors: [String],
    location: strOptions,
    coordinate: [Number],
    category: strOptions,
    subCategory: strOptions,
    rating: { type: Number, min: 0, default: 0 },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop'
    }
  },
  { timestamps: true }
);

// Product Model
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
