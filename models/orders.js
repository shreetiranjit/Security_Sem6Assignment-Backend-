// External Dependencies
const mongoose = require('mongoose')

// Mongoose Schema
const Schema = mongoose.Schema

const OrderSchema = new Schema(
  {
    billingAddress: { type: String, required: true },
    billingAddressIV: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryAddressIV: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
    },
    Product: {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      color: String,
      quantity: Number,
    },
    totalAmount: { type: Number, required: true },
    groupId: { type: String, required: true },
    status: {
      type: String,
      enum: ['waitingConfirmation', 'confirmed', 'cancelRequest', 'cancelled', 'packing', 'shipped', 'delivered'],
      default: 'waitingConfirmation',
    },
    note: String,
  },
  { timestamps: true }
)

Order = mongoose.model('Order', OrderSchema)

// Export the model
module.exports = Order
