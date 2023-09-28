// External Dependencies
const express = require('express')

// Internal Dependencies
const shopController = require('../../controllers/shop')
const { isShop } = require('../../middlewares/isAuth')

// Router Setup
const Router = express.Router()

/*
 * @route   POST /create
 * @desc    Create Shop
 * @access  Public
 */
Router.post('/create', shopController.createShop)

/*
 * @route   POST /login
 * @desc    Login Shop
 * @access  Public
 */
Router.post('/login', shopController.loginShop)

/*
 * @route   POST /sendEmail
 * @desc    Send Email for forgot password shop
 * @access  Public
 */
Router.post('/sendEmail', shopController.sendForgetPasswordEmail)

/*
 * @route   POST /checkToken
 * @desc    Check Token of Forgot Password which was send to email
 * @access  Public
 */
Router.post('/checkToken', shopController.checkResetPasswordToken)

/*
 * @route   POST /changePassword
 * @desc    Change Password
 * @access  Public
 */
Router.post('/changePassword', shopController.changePassword)

/*
 * @route   PUT /update/:id
 * @desc    Update Shop
 * @access  Private
 */
Router.put('/update/:id', isShop, shopController.editShop)

/*
 * @route   GET /p/:id
 * @desc    Get Shop By Id
 * @access  Public
 */
Router.get('/p/:id', shopController.getShopById)

/*
 * @route   GET /current
 * @desc    Get Current Shop
 * @access  Private
 */
Router.get('/current', isShop, shopController.getCurrentShop)

/*
 * @route   GET /charts
 * @desc    Get Seller Charts
 * @access  Private
 */
Router.get('/charts', isShop, shopController.getSellerCharts)

module.exports = Router
