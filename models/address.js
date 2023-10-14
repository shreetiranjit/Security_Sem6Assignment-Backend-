// External Dependencies
const mongoose = require('mongoose');

// Mongoose Schema
const Schema = mongoose.Schema;

const strOptions = { type: String, required: true };

const AddressSchema = new Schema({
  name: strOptions,
  surname: strOptions,
  country: strOptions,
  phoneNumber: strOptions,
  address: strOptions,
  addressHeader: strOptions,
  state: strOptions,
  city: strOptions,
  email: strOptions,
  addressType: {
    type: String,
    enum: ['delivery', 'billing'],
    default: 'delivery'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Address = mongoose.model('Address', AddressSchema);

// Export Address Model
module.exports = Address;
