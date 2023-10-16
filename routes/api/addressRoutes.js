// External Dependencies
const express = require('express');

// Internal Dependencies
const { isUser } = require('../../middlewares/isAuth');
const addressController = require('../../controllers/address');

// Express Router
const Router = express.Router();

/*
 * @route   POST /
 * @desc    Add New Address
 * @access  Private
 */
Router.post('/', isUser, addressController.createAddress);

/*
 * @route   GET /
 * @desc    Get All Addresses
 * @access  Private
 */
Router.get('/', isUser, addressController.getAddresses);

/*
 * @route   PUT /
 * @desc    Update Address
 * @access  Private
 */
Router.put('/:id', isUser, addressController.updateAddress);

/*
 * @route   DELETE /
 * @desc    Delete Address
 * @access  Private
 */
Router.delete('/:id', isUser, addressController.deleteAddress);

// Export Routes
module.exports = Router;
