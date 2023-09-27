// External Dependencies
const express = require('express')
const multer = require('multer')

// Internal Dependencies
const userController = require('../../controllers/user')
const { isUser } = require('../../middlewares/isAuth')
const { storage } = require('../../config/cloudinaryUpload')

// Router Setup
const Router = express.Router()

// Upload Image Setup
const upload = multer({ storage })

/*
 * @route   POST /register
 * @desc    Register User
 * @access  Public
 */
Router.post('/register', userController.registerUser)
/*
 * @route   POST /verifyUser
 * @desc    Verify Register User
 * @access  Public
 */
Router.post('/verifyUser', userController.verifyUser)

/*
 * @route   POST /login
 * @desc    Login User
 * @access  Public
 */
Router.post('/login', userController.loginUser)

/*
 * @route   GET /p/:username
 * @desc    Search User By Username
 * @access  Public
 */
Router.get('/p/:username', userController.getUserByUsername)

/*
 * @route   GET /current
 * @desc    Get Current User
 * @access  Private
 */
Router.get('/current', isUser, userController.getCurrentUser)

/*
 * @route   PUT /resetPassword
 * @desc    Change Password with Old and new Password
 * @access  Private
 */
Router.put('/resetPassword', isUser, userController.changePassword)

/*
 * @route   POST /sendEmail
 * @desc    Send Email forgot password user
 * @access  Public
 */
Router.post('/sendEmail', userController.forgotPassword)

/*
 * @route   POST /checkPasswordResetCode
 * @desc    Check Forgot Password Reset Code
 * @access  Public
 */
Router.post('/checkPasswordResetCode', userController.checkResetPasswordToken)

/*
 * @route   POST /newPassword
 * @desc    Reset Password
 * @access  Public
 */
Router.post('/newPassword', userController.resetPassword)

/*
 * @route   PUT /updatePhoto
 * @desc    Update Photo
 * @access  Private
 */
Router.put('/updatePhoto', isUser, upload.single('profilePhoto'), userController.updatePhoto)

/*
 * @route   DELETE /profilePhoto
 * @desc    Delete User Profile Photo
 * @access  Private
 */
Router.delete('/profilePhoto', isUser, userController.removeProfilePhoto)

/*
 * @route   POST /remove
 * @desc    Delete User
 * @access  Private
 */
Router.post('/remove', isUser, userController.removeUser)

/*
 * @route   PUT /update
 * @desc    Update User Profile
 * @access  Private
 */
Router.put('/update', isUser, userController.updateUserProfile)

module.exports = Router
