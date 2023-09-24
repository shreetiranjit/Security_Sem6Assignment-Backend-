// External Dependencies
const mongoose = require('mongoose')

const Schema = mongoose.Schema
const strOptions = { type: String, required: true }

const shopSchema = new Schema(
  {
    fullname: strOptions,
    email: strOptions,
    country: strOptions,
    phoneNumber: strOptions,
    category: strOptions,
    companyName: strOptions,
    location: strOptions,
    coordinate: [Number],
    links: [String],
    password: { type: String, required: true },
    resetPassword: {
      token: String,
      expiration: Date,
    },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const Shop = mongoose.model('Shop', shopSchema)

module.exports = Shop
