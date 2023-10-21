// External Dependencies
const express = require('express');

// Internal Dependencies
const { isUser, isShop } = require('../../middlewares/isAuth');
const orderController = require('../../controllers/order');

// Express Router
const Router = express.Router();

/*
 * @route   POST /
 * @desc    Create Order
 * @access  Private
 */
Router.post('/', isUser, orderController.createOrder);

/*
 * @route   GET /user-orders
 * @desc    Get All Orders of current user
 * @access  Private
 */
Router.get('/user-orders', isUser, orderController.getOrdersByUser);

/*
 * @route   GET /seller-orders
 * @desc    Get All Orders of current shop
 * @access  Private
 */
Router.get('/seller-orders', isShop, orderController.getOrdersBySeller);

/*
 * @route   POST /change-status
 * @desc    Change Order Status
 * @access  Private
 */
Router.post('/change-status', isShop, orderController.changeOrderStatus);

/*
 * @route   POST /cancel-request
 * @desc    Cancel Order Request
 * @access  Private
 */
Router.post('/cancel-request', isUser, orderController.orderCancelRequest);

/*
 * @route   POST /cancel-request/deny
 * @desc    Deny Order Cancel Request
 * @access  Private
 */
Router.post('/cancel-request/deny', isShop, orderController.denyCancelRequest);

/*
 * @route   POST /refund
 * @desc    Approve Order Cancel Request
 * @access  Private
 */
Router.post('/refund', isShop, orderController.approveCancelRequest);

module.exports = Router;
