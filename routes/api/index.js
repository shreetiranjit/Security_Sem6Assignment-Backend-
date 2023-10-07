// External Dependencies
const router = require('express').Router()

// Internal Dependencies
const userRoutes = require('./userRoutes')
const shopRoutes = require('./shopRoutes')
const productRoutes = require('./productRoutes')
const wishlistRoutes = require('./wishlistRoutes')
const reviewRoutes = require('./reviewRoutes')
const cartRoutes = require('./cartRoutes')
const addressRoutes = require('./addressRoutes')
const sellerRatingRoutes = require('./sellerRatingRoutes')
const orderRoutes = require('./orderRoutes')

// User Routes
router.use('/user', userRoutes)

// Shop Routes
router.use('/shop', shopRoutes)

// Product Routes
router.use('/product', productRoutes)

// Wishlist Routes
router.use('/wishlist', wishlistRoutes)

// Product Review Routes
router.use('/review', reviewRoutes)

// Cart Routes
router.use('/cart', cartRoutes)

// Address Routes
router.use('/address', addressRoutes)

// Seller Rating Routes
router.use('/seller_rating', sellerRatingRoutes)

// Order Routes
router.use('/order', orderRoutes)



module.exports = router
