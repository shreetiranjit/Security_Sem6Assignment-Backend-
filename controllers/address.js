// External Dependencies
const Joi = require('joi')
const phone = Joi.extend(require('joi-phone-number'))

// Internal Dependencies
const Address = require('../models/address')
const catchAsync = require('../utils/catchAsync')
const expressError = require('../utils/expressError')

// Create Address
const createAddress = catchAsync(async (req, res, next) => {
  const user = req.user
  if (
    !req.body.name ||
    !req.body.surname ||
    !req.body.country ||
    !req.body.phoneNumber ||
    !req.body.address ||
    !req.body.addressHeader ||
    !req.body.city ||
    !req.body.state ||
    !req.body.addressType ||
    !req.body.email
  ) {
    return next(new expressError('Fill all fields.', 400))
  }

  let newPhone = ''
  const checkPhone = phone
    .string()
    .phoneNumber({
      defaultCountry: req.body.country,
      strict: true,
      format: 'international',
    })
    .validate(req.body.phoneNumber)
  if (checkPhone.error) return next(new expressError('Enter valid phone number.', 400))
  else newPhone = checkPhone.value

  let newAddress = await Address.create({
    name: req.body.name,
    surname: req.body.surname,
    country: req.body.country,
    phoneNumber: newPhone,
    address: req.body.address,
    addressHeader: req.body.addressHeader,
    city: req.body.city,
    state: req.body.state,
    addressType: req.body.addressType,
    user: user.id,
    email: req.body.email,
  })
  const populatedAddress = await newAddress.populate('user')
  res.json(populatedAddress)
})

// Get User Addresses
const getAddresses = catchAsync(async (req, res) => {
  const user = req.user
  const getAddresses = await Address.find({ user: user.id })
  res.json(getAddresses)
})

// Update Address
const updateAddress = catchAsync(async (req, res, next) => {
  const { phoneNumber, country } = req.body
  const addressId = req.params.id
  const user = req.user
  let newPhone = '',
    updateData = {}
  const getAddresses = await Address.findById(addressId)

  if (phoneNumber) {
    const checkPhone = phone
      .string()
      .phoneNumber({
        defaultCountry: req.body.country ? req.body.country : getAddresses.country,
        strict: true,
        format: 'international',
      })
      .validate(req.body.phoneNumber)
    if (checkPhone.error) return next(new expressError('Enter valid phone number.', 400))
    else newPhone = checkPhone.value
  }

  if (newPhone !== '') {
    updateData = {
      ...req.body,
      phoneNumber: newPhone,
    }
  } else {
    updateData = { ...req.body }
  }

  if (getAddresses.user == user.id) {
    const updateAddress = await Address.findOneAndUpdate({ _id: addressId }, updateData, {
      new: true,
    })
    res.json(updateAddress)
  } else {
    return next(new expressError('You are not owner of this address.', 403))
  }
})

// Delete Address
const deleteAddress = catchAsync(async (req, res, next) => {
  const addressId = req.params.id
  const user = req.user

  const getAddresses = await Address.findById(addressId)
  if (getAddresses.user == user.id) {
    await Address.findOneAndRemove({ _id: addressId })
    res.json('Address deleted.')
  } else {
    return next(new expressError('You are not owner of this address.', 403))
  }
})

module.exports = {
  createAddress,
  getAddresses,
  updateAddress,
  deleteAddress,
}
