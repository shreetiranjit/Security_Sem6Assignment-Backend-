// External Dependencies
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Joi = require('joi')
const moment = require('moment')
const phone = Joi.extend(require('joi-phone-number'))
const mongoId = require('mongoose').Types.ObjectId

// Internal Dependencies
const Shop = require('../models/shop')
const expressError = require('../utils/expressError')
const catchAsync = require('../utils/catchAsync')
const { sendForgotPasswordShopMail } = require('../utils/emailSender')
const uniqueIdGenerator = require('../utils/uniqueIdGenerator')
const { ShopValidation } = require('../validations/schemas.js')
const { JWT } = require('../config/keys')

// Create Shop
const createShop = catchAsync(async (req, res, next) => {
  const { fullname, email, country, phoneNumber, category, companyName, location, links, password, coordinate } = req.body
  const { error } = ShopValidation.validate({
    fullname,
    email,
    country,
    category,
    companyName,
    location,
    coordinate,
    links,
    password,
  })
  if (
    category === '' ||
    !category ||
    country === '' ||
    !country ||
    !fullname ||
    !email ||
    !companyName ||
    !location ||
    !password ||
    !phoneNumber
  ) {
    return next(new expressError('Enter All Fields.', 400))
  }
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,12}$/

  if (!passwordRegex.test(password)) {
    return next(new expressError('Password does not meet complexity requirements.', 400))
  }
  if (error) {
    return next(
      new expressError(
        error.details[0].message.split(' ')[error.details[0].message.split(' ').length - 1] === 'email' && 'Email Must Be A Valid Email.',
        400
      )
    )
  }

  var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
  var regex = new RegExp(expression)

  if (links) {
    if (links[0] !== '') {
      links.forEach(url => {
        if (!url.match(regex)) {
          return next(new expressError('Enter Valid Link', 400))
        }
      })
    }
  }

  let newPhone = ''
  const checkPhone = phone
    .string()
    .phoneNumber({
      defaultCountry: country,
      strict: true,
      format: 'international',
    })
    .validate(phoneNumber)
  if (checkPhone.error) return next(new expressError('Enter Valid Phone Number.', 400))
  else newPhone = checkPhone.value

  const findShopByName = await Shop.findOne({ companyName })
  const findShopByEmail = await Shop.findOne({ email })
  if (findShopByName) return next(new expressError('Shop With That Company Name Exists.', 400))
  if (findShopByEmail) return next(new expressError('Shop With That Email Exists.', 400))

  const newShop = new Shop(req.body)
  const hashed = await bcrypt.hash(newShop.password, 10)
  newShop.password = hashed
  newShop.phoneNumber = newPhone
  let saveShop = await newShop.save()
  const token = jwt.sign({ id: saveShop._id }, JWT.JWT_TOKEN_SECRET, {
    expiresIn: '1d',
  })
  res.status(201).json(token)
})

// Edit Shop
const editShop = catchAsync(async (req, res, next) => {
  const { fullname, email, country, phoneNumber, category, companyName, location, links, coordinate } = req.body
  if (category === '' || !category || country === '' || !country || !fullname || !email || !companyName || !location || !phoneNumber) {
    return next(new expressError('Enter All Fields.', 400))
  }

  var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
  var regex = new RegExp(expression)

  if (links[0] !== '') {
    links.forEach(url => {
      if (!url.match(regex)) {
        return next(new expressError('Enter Valid Link', 400))
      }
    })
  }

  let newPhone = ''
  const checkPhone = phone
    .string()
    .phoneNumber({
      defaultCountry: country,
      strict: true,
      format: 'international',
    })
    .validate(phoneNumber)
  if (checkPhone.error) return next(new expressError('Enter Valid Phone Number.', 400))
  else newPhone = checkPhone.value

  const shopBeforeEdit = await Shop.findById(req.params.id)

  if (shopBeforeEdit.email !== email) {
    const findShopByEmail = await Shop.findOne({ email })
    if (findShopByEmail) return next(new expressError('Shop With That Email Exists.', 400))
  }
  if (shopBeforeEdit.companyName !== companyName) {
    const findShopByName = await Shop.findOne({ companyName })
    if (findShopByName) return next(new expressError('Shop With That Company Name Exists.', 400))
  }

  const updateShop = await Shop.findByIdAndUpdate(
    req.params.id,
    {
      fullname,
      email,
      country,
      phoneNumber: newPhone,
      category,
      companyName,
      location,
      links,
      coordinate,
    },
    { new: true }
  )
  res.status(200).json({
    fullname: updateShop.fullname,
    email: updateShop.email,
    country: updateShop.country,
    phoneNumber: newPhone,
    category: updateShop.category,
    companyName: updateShop.companyName,
    location: updateShop.location,
    links: updateShop.links,
    coordinate: updateShop.coordinate,
    id: updateShop._id,
    rating: updateShop.rating,
    ratingCount: updateShop.ratingCount,
  })
})

const validateEmail = email => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

// Login Shop
const loginShop = catchAsync(async (req, res, next) => {
  const { email, password } = req.body
  if (!email || !password) return next(new expressError('Fill All Fields', 400))
  if (!validateEmail(email)) return next(new expressError('Enter Valid Email.', 400))
  const getShop = await Shop.findOne({ email })
  if (!getShop) return next(new expressError('Shop Does Not Exist.', 404))

  const comparePassword = await bcrypt.compare(password, getShop.password)
  if (!comparePassword) return next(new expressError('Invalid Credentials', 400))

  const token = jwt.sign({ id: getShop._id }, JWT.JWT_TOKEN_SECRET, {
    expiresIn: '1d',
  })
  res.json(token)
})

// Get Shop By Id
const getShopById = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.params.id)) return next(new expressError('Enter Valid ID.', 400))
  const getShop = await Shop.findById(req.params.id)
  if (!getShop) return next(new expressError('Shop Does Not Exist.', 400))
  const { _id, fullName, email, country, phoneNumber, category, companyName, location, coordinate, links } = getShop
  res.json({
    id: _id,
    fullName,
    email,
    country,
    phoneNumber,
    category,
    companyName,
    location,
    coordinate,
    links,
  })
})

// Get Current Shop
const getCurrentShop = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.shop.id)) return next(new expressError('Enter Valid ID.', 400))
  const getShop = await Shop.findById(req.shop.id)
  if (!getShop) return next(new expressError('Shop Does Not Exist.', 400))
  let seller = {}
  const { _id, fullname, email, country, phoneNumber, category, companyName, location, coordinate, links, createdAt, rating, ratingCount } =
    getShop
  seller = {
    id: _id,
    fullname,
    createdAt,
    email,
    country,
    phoneNumber,
    category,
    companyName,
    location,
    coordinate,
    links,
    rating,
    ratingCount,
  }

  res.json(seller)
})

// Send Email on Forgot password
const sendForgetPasswordEmail = catchAsync(async (req, res, next) => {
  const { email, origin } = req.body
  const getShop = await Shop.findOne({ email })
  if (getShop) {
    const token = uniqueIdGenerator(8)
    const hashedToken = await bcrypt.hash(token, 2)
    let currentDate = new Date()
    let futureDate = new Date(currentDate.getTime() + 5 * 60000)
    getShop.resetPassword = { token: hashedToken, expiration: futureDate }
    await getShop.save()

    emailSender.sendOrderConfirmationMail(getShop.email, getShop.companyName, origin, token)
    res.json({
      msg: 'Email Has Been Sent.',
      success: true,
    })
  } else {
    return next(new expressError('Shop Does Not Exists.', 404))
  }
})

// Check the forgot password token
const checkResetPasswordToken = catchAsync(async (req, res, next) => {
  const { email, shopToken } = req.body
  const getShop = await Shop.findOne({ email })
  if (!getShop) return next(new expressError(false, 404))
  const {
    resetPassword: { token, expiration },
  } = getShop
  if (moment(expiration).isAfter(Date.now())) {
    const compareToken = await bcrypt.compare(shopToken, token)
    if (!compareToken) return next(new expressError(false, 403))
    return res.json(true)
  } else {
    getShop.resetPassword = {}
    await getShop.save()
    return next(new expressError(false, 403))
  }
})

// Change the password with forgot password token
const changePassword = catchAsync(async (req, res, next) => {
  const token = req.headers['password-token']
  const { newPassword, confirmPassword, email } = req.body
  if (!newPassword || !confirmPassword) return next(new expressError("Password can't be blank.", 400))
  if (newPassword.length < 6) return next(new expressError('Password must be at least 6 characters.', 400))
  if (token.length > 8 || token.length < 8) return next(new expressError('redirect', 403))
  const getShop = await Shop.findOne({ email })
  if (!getShop) return next(new expressError(false, 404))
  const { resetPassword } = getShop
  if (moment(resetPassword.expiration).isBefore(Date.now())) return next(new expressError('redirect', 403))
  const compareToken = await bcrypt.compare(token, resetPassword.token)
  if (!compareToken) return next(new expressError('redirect', 403))
  if (newPassword !== confirmPassword) return next(new expressError("Passwords don't match.", 400))
  const hashedPassword = await bcrypt.hash(newPassword, 10)
  getShop.password = hashedPassword
  getShop.resetPassword = {}
  await getShop.save()
  res.json('Successfully changed the password.')
})

// Get Seller Charts
const getSellerCharts = catchAsync(async (req, res, next) => {
  // Fetch User Data
  const getSeller = await Shop.findById(req.shop.id)
  const getOrders = await Order.find({ seller: req.shop.id })

  // Set Up Dates
  const ShopCreated = new Date(getSeller.createdAt)
  const MinDate = new Date(ShopCreated)
  const MaxDate = new Date(ShopCreated)
  MinDate.setMonth(MinDate.getMonth() - 1)

  //Calculate Months Passed Since the Shop is Created
  const today = new Date(new Date() - 60 * 60 * 1000)
  const DateDifferenceSinceShopCreated = monthsPassed(ShopCreated, today)

  let RevenueTotalByMonth = []
  let OrdersByMonth = []
  let MonthlyRevenue = []

  // Calculate Total Revenue Growth By Month
  for (let i = 0; i < DateDifferenceSinceShopCreated; i++) {
    let newMonth = MaxDate.setMonth(MaxDate.getMonth() + 1)
    MinDate.setMonth(MinDate.getMonth() + 1)

    let ordersByMonth = getOrders.filter(order => order.createdAt <= MaxDate && order.status === 'delivered')

    let OrderCountByMonth = getOrders.filter(
      order => order.createdAt > MinDate && order.createdAt <= MaxDate && order.status === 'delivered'
    )

    let uniqueLastMonthOrders = makeOrdersUnique(ordersByMonth)
    let uniqueOrdersForCount = makeOrdersUnique(OrderCountByMonth)

    let totalRevenue = 0
    let monthlyRevenue = 0

    uniqueOrdersForCount.map(item => {
      if (item.status === 'delivered') {
        monthlyRevenue += item.totalAmount
      }
    })

    uniqueLastMonthOrders.map(item => (totalRevenue += item.totalAmount))

    // Format Current Date Appropriate for Chart
    let CurrentMonth = new Date(newMonth)
    let fullDate = FormatFullDate(CurrentMonth)

    RevenueTotalByMonth.push([fullDate, Math.trunc(totalRevenue)])
    OrdersByMonth.push([fullDate, uniqueOrdersForCount.length])
    MonthlyRevenue.push({
      label: fullDate,
      value: `${Math.trunc(monthlyRevenue)}`,
    })
  }

  res.json({
    revenueGrowthByMonth: RevenueTotalByMonth,
    ordersByMonth: OrdersByMonth,
    monthlyRevenue: MonthlyRevenue,
  })
})

function monthsPassed(dt2, dt1) {
  var diff = (dt2.getTime() - dt1.getTime()) / 1000
  diff /= 60 * 60 * 24 * 7 * 4
  return Math.abs(Math.round(diff))
}

function makeOrdersUnique(orders) {
  return Array.from(new Set(orders.map(item => item.groupId))).map(id => {
    return orders.find(group => group.groupId === id)
  })
}

function FormatFullDate(date) {
  const getDay = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  const getShortMonthName = date.toLocaleString('default', {
    month: 'short',
  })
  const year = date.getFullYear()

  let fullDate = `${getDay}-${getShortMonthName}-${year.toString().substring(2)}`

  return fullDate
}

module.exports = {
  createShop,
  editShop,
  loginShop,
  getShopById,
  getCurrentShop,
  sendForgetPasswordEmail,
  checkResetPasswordToken,
  changePassword,
  getSellerCharts,
}
