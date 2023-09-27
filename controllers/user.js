// External Dependencies
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const moment = require('moment')

// Internal Dependencies
const User = require('../models/user')
const Wishlist = require('../models/wishlist')
const Cart = require('../models/cart')
const Review = require('../models/review')
const Product = require('../models/product')
const catchAsync = require('../utils/catchAsync')
const expressError = require('../utils/expressError')
const { UserValidation } = require('../validations/schemas')
const { JWT } = require('../config/keys')
const emailSender = require('../utils/emailSender')
const uniqueIdGenerator = require('../utils/uniqueIdGenerator')
const { cloudinary } = require('../config/cloudinaryUpload')
const { sendMail, sendOTPMail, sendPasswordChangeMail, sendForgotPasswordUserMail } = require('../utils/emailSender')
// const { sendForgetPasswordEmail } = require('./shop')

// Mongo ID
const mongoId = require('mongoose').Types.ObjectId

const otpStore = {}

// Function to generate OTP
function generateOtp() {
  let otp = ''
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10).toString()
  }
  return otp
}

// Function to store OTP
function storeOtp(email, otp) {
  const expiry = Date.now() + 10 * 60 * 1000
  otpStore[email] = { otp, expiry }
}

// Function to verify OTP
function verifyOtp(email, otp) {
  const record = otpStore[email]
  if (!record) return false
  const isOtpValid = record.otp === otp && Date.now() < record.expiry
  if (isOtpValid) delete otpStore[email]
  return isOtpValid
}

const registerUser = catchAsync(async (req, res, next) => {
  const { username, email, password } = req.body
  const { error } = UserValidation.validate(req.body)

  if (!username || !email || !password) {
    return next(new expressError('Fill All Fields', 400))
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,12}$/
  if (!passwordRegex.test(password)) {
    return next(new expressError('Password does not meet complexity requirements.', 400))
  }

  if (error) {
    return next(
      new expressError(
        error.details[0].message.split(' ')[error.details[0].message.split(' ').length - 1] === 'email'
          ? 'Email Must Be A Valid Email'
          : 'Username Must Be Less Than 30 Characters',
        400
      )
    )
  }

  const findUserByEmail = await User.findOne({ email: email })
  const findUserByUsername = await User.findOne({ username: username })

  if (findUserByEmail) return next(new expressError('Try Different Email.', 400))
  if (findUserByUsername) return next(new expressError('Try Different Username.', 400))

  // Generate and send OTP
  const otp = generateOtp()
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
  const hash = await bcrypt.hash(password, 10)

  const newUser = new User({
    username,
    email,
    password: hash,
    passwordHistory: [hash],
    passwordChangedAt: new Date(),
    isVerified: false,
    otp: otp,
    otpExpiry: otpExpiry,
  })

  await newUser.save()
  await sendOTPMail(email, otp)
  res.status(201).json({ success: true, data: email, msg: 'OTP Sent.' })
})

// User Verification Route
const verifyUser = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body

  const user = await User.findOne({ email: email })
  console.log('user', user)

  // Check if OTP is valid and not expired
  if (!user || !user.otp || user.otpExpiry < new Date() || user.otp !== otp) {
    return next(new expressError('Invalid or expired OTP.', 400))
  }

  user.isVerified = true
  user.otp = undefined
  user.otpExpiry = undefined
  const saveUser = await user.save()

  Wishlist.create({ owner: saveUser._id })
  const newCart = await Cart.create({ user: saveUser._id })
  res.status(201).json({ success: true })
})

const MAX_LOGIN_ATTEMPTS = 5
const LOCK_TIME = 2 * 60 * 60 * 1000

// Login User
const loginUser = catchAsync(async (req, res, next) => {
  const { emailOrUsername, password, Products } = req.body
  if (!emailOrUsername || !password) return next(new expressError('Fill All Fields.', 400))

  const findUser = await User.findOne({
    $or: [{ username: emailOrUsername }, { email: emailOrUsername }],
  })
  if (!findUser) return next(new expressError('Wrong Password Or Email.', 404))

  if (!findUser.isVerified) return next(new expressError('Please verify your email.', 400))
  if (findUser.lockUntil && findUser.lockUntil > Date.now())
    return next(new expressError('Account is temporarily locked due to multiple failed login attempts.', 400))

  const comparePassword = await bcrypt.compare(password, findUser.password)
  if (!comparePassword) {
    findUser.loginAttempts += 1
    if (findUser.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      findUser.lockUntil = Date.now() + LOCK_TIME
    }
    await findUser.save()
    return next(new expressError('Wrong Password Or Email.', 400))
  }

  if (findUser.loginAttempts !== 0 || findUser.lockUntil) {
    findUser.loginAttempts = 0
    findUser.lockUntil = null
    await findUser.save()
  }

  if (Products) {
    let temp = '',
      secondTemp = '',
      isDuplicate = false
    const getCart = await Cart.findOne({ user: findUser._id })

    for (let item of Products) {
      secondTemp = `${item.product}${item.color}`
      getCart.items.forEach(cartItem => {
        temp = `${cartItem.product}${cartItem.color}`
        if (secondTemp === temp) {
          isDuplicate = true
        }
      })
      if (!isDuplicate) {
        const getProduct = await Product.findById(item.product)
        if (getProduct) {
          getCart.items.push({
            product: item.product,
            seller: item.seller,
            color: item.color,
            quantity: item.qty,
            selected: item.selected,
          })
        }
      }
    }

    getCart.save()
  }

  const token = jwt.sign({ id: findUser._id }, JWT.JWT_TOKEN_SECRET, {
    expiresIn: '5d',
  })

  res.json(token)
})

// Get User By Username
const getUserByUsername = catchAsync(async (req, res, next) => {
  const getUser = await User.findOne({ username: req.params.username })
  if (!getUser) return next(new expressError('User Not Found', 404))
  const { username, email, _id, profilePhoto, createdAt, hasPhoto } = getUser
  res.json({ _id, username, email, profilePhoto, createdAt, hasPhoto })
})

// Get Current Login User
const getCurrentUser = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.user.id)) return next(new expressError('Enter Valid ID.', 400))
  const currentUser = await User.findById(req.user.id)
  if (!currentUser) return next(new expressError('Current User Not Found', 404))
  const { username, email, _id, createdAt, hasPhoto, profilePhoto } = currentUser
  res.json({ _id, username, email, createdAt, hasPhoto, profilePhoto })
})

// Change Password with Old and new Password
const changePassword = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.user.id)) {
    return next(new expressError('Enter Valid ID.', 400))
  }
  const findUser = await User.findById(req.user.id)
  if (!findUser) {
    return next(new expressError('User Not Found.', 404))
  }
  const { oldPassword, newPassword, confirmPassword } = req.body
  if (!oldPassword || !newPassword || !confirmPassword) {
    return next(new expressError('Enter All Fields.', 400))
  }
  if (oldPassword === newPassword) {
    return next(new expressError("New Password Can't Be Same With Old Password.", 400))
  }
  if (newPassword.length < 6) {
    return next(new expressError('Password Must Be More Than 6 Characters.', 400))
  }
  const isMatch = await bcrypt.compare(oldPassword, findUser.password)
  if (!isMatch) {
    return next(new expressError('Wrong Password.', 400))
  }
  const newHashPassword = await bcrypt.hash(newPassword, 10)
  if (findUser.passwordHistory.includes(newHashPassword)) {
    return next(new expressError('New password must be different from the previous passwords', 400))
  }
  findUser.password = newHashPassword
  findUser.passwordHistory.push(newHashPassword)
  findUser.passwordHistory = findUser.passwordHistory.slice(-5)
  await findUser.save()
  sendPasswordChangeMail(findUser.email)
  res.json('Password Changed.')
})

// Forgot Password and Send Email
const forgotPassword = catchAsync(async (req, res) => {
  const { emailOrUsername } = req.body
  const getAccount = await User.findOne({
    $or: [{ username: emailOrUsername }, { email: emailOrUsername }],
  })
  if (getAccount) {
    const token = uniqueIdGenerator(8)
    const hashedToken = await bcrypt.hash(token, 2)
    let currentDate = new Date()
    let futureDate = new Date(currentDate.getTime() + 5 * 60000)
    getAccount.resetPassword = { token: hashedToken, expiration: futureDate }
    await getAccount.save()
    sendForgotPasswordUserMail(getAccount.email, getAccount.username, token)
    res.json({
      msg: 'Email Has Been Sent.',
      success: true,
    })
  } else {
    res.status(404).json({ msg: 'Account Does Not Exist.', success: false })
  }
})

// Check Forgot Password Token
const checkResetPasswordToken = catchAsync(async (req, res, next) => {
  const { usernameOrEmail, userToken } = req.body
  const getUser = await User.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
  })
  if (!getUser) return next(new expressError(false, 403))
  const {
    resetPassword: { token, expiration },
  } = getUser
  if (moment(expiration).isAfter(Date.now())) {
    const compareToken = await bcrypt.compare(userToken, token)
    if (!compareToken) return next(new expressError(false, 403))
    return res.json(true)
  } else {
    getUser.resetPassword = {}
    await getUser.save()
    return next(new expressError(false, 403))
  }
})

// Reset Password
const resetPassword = catchAsync(async (req, res, next) => {
  const token = req.headers['password-token']
  const { emailOrUsername } = req.body
  const { newPassword, confirmPassword } = req.body
  if (!newPassword || !confirmPassword) return next(new expressError("Password can't be blank.", 400))
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,12}$/.test(newPassword)) {
    return next(new expressError('Password does not meet complexity requirements.', 400))
  }

  if (token.length > 8 || token.length < 8) return next(new expressError('redirect', 403))
  const getUser = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
  })
  if (!getUser) return next(new expressError('redirect', 403))
  const { resetPassword } = getUser
  if (moment(resetPassword.expiration).isBefore(Date.now())) return next(new expressError('redirect', 403))
  const compareToken = await bcrypt.compare(token, resetPassword.token)
  if (!compareToken) return next(new expressError('redirect', 403))
  if (newPassword !== confirmPassword) return next(new expressError("Passwords don't match.", 400))
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  getUser.password = hashedPassword
  getUser.resetPassword = {}
  await getUser.save()
  res.json('Successfully changed the password.')
})

// Update Photo
const updatePhoto = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.user.id)) return next(new expressError('Enter Valid ID', 400))
  const findUser = await User.findById(req.user.id)
  if (!findUser) return next(new expressError('User Not Found.', 404))
  const file = req.file
  const { removePhoto } = req.body
  if (file) {
    findUser.profilePhoto = {
      url: file.path.replace('/upload', '/upload/w_400'),
      filename: file.filename,
    }
    findUser.hasPhoto = true
    await findUser.save()
  }
  if (removePhoto) {
    findUser.profilePhoto = {}
    findUser.hasPhoto = false
    await findUser.save()
    cloudinary.uploader.destroy(findUser.profilePhoto.filename)
  }
  const { _id, username, email, createdAt, hasPhoto, profilePhoto } = findUser
  res.json({
    _id,
    username,
    email,
    createdAt,
    hasPhoto,
    profilePhoto,
  })
})

// Remove Profile Photo
const removeProfilePhoto = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.user.id)) return next(new expressError('Enter Valid ID', 400))
  const findUser = await User.findById(req.user.id)
  if (!findUser) return next(new expressError('User Not Found.', 404))
  cloudinary.uploader.destroy(findUser.profilePhoto.filename)
  findUser.profilePhoto = {}
  findUser.hasPhoto = false
  await findUser.save()
  const { _id, username, email, createdAt, hasPhoto, profilePhoto } = findUser
  res.json({
    _id,
    username,
    email,
    createdAt,
    hasPhoto,
    profilePhoto,
  })
})

// Remove User
const removeUser = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.user.id)) return next(new expressError('Enter Valid ID', 400))
  const findUser = await User.findById(req.user.id)
  if (!findUser) return next(new expressError('User Not Found.', 404))
  const { password } = req.body
  const isMatch = await bcrypt.compare(password, findUser.password)
  if (!isMatch) return next(new expressError('Wrong Password', 400))
  await Review.deleteMany({ user: req.user.id })
  await Wishlist.deleteMany({ owner: req.user.id })
  await Cart.deleteMany({ user: req.user.id })
  await User.deleteOne({ _id: req.user.id })
  if (findUser.hasPhoto) cloudinary.uploader.destroy(findUser.profilePhoto.filename)
  res.json('User Deleted.')
})

// Validate Email Function
const validateEmail = email => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

// Update User Profile
const updateUserProfile = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.user.id)) return next(new expressError('Enter Valid ID', 400))
  const findUser = await User.findById(req.user.id)
  if (!findUser) return next(new expressError('User Not Found.', 404))
  if (req.body.username.length < 1) return next(new expressError('Username Cant Be Blank.', 400))
  const getUsers = await User.find({
    _id: { $ne: req.user.id },
    $or: [{ username: req.body.username }, { email: req.body.email }],
  })
  if (getUsers.length > 0) return next(new expressError('Try Different Username or Email.', 400))
  if (req.body.email) {
    if (req.body.email.length < 1) return next(new expressError("Email Can't Be Blank.", 400))
    if (!validateEmail(req.body.email)) return next(new expressError('Enter Valid Email.', 400))
  }
  if (req.body.username.length > 30) {
    return next(new expressError("Username Can't Be More Than 30 Characters.", 400))
  }
  const updateUser = await User.findOneAndUpdate({ _id: req.user.id }, req.body, { new: true })
  if (req.body.username) {
    let newUsername = updateUser.username.split(' ').join('.')
    updateUser.username = newUsername
    await updateUser.save()
  }
  res.json("User's Profile Updated.", 200)
  const { _id, username, email, createdAt, hasPhoto, profilePhoto } = updateUser
  res.json({
    _id,
    username,
    email,
    createdAt,
    hasPhoto,
    profilePhoto,
  })
})

// Exports
module.exports = {
  registerUser,
  loginUser,
  getUserByUsername,
  getCurrentUser,
  changePassword,
  forgotPassword,
  checkResetPasswordToken,
  resetPassword,
  updatePhoto,
  removeProfilePhoto,
  removeUser,
  updateUserProfile,
  verifyOtp,
  generateOtp,
  storeOtp,
  verifyUser,
}
