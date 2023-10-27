// Internal Dependencies
const Wishlist = require('../models/wishlist');
const expressError = require('../utils/expressError');
const catchAsync = require('../utils/catchAsync');

// Get Wishlist of Current User
const getWishlist = catchAsync(async (req, res, next) => {
  const getWishlist = await Wishlist.findOne({ owner: req.user.id }).populate('products');
  if (!getWishlist) return next(new expressError('Wishlist Not Found', 404));
  res.json(getWishlist.products);
});

// Update Wishlist of Current User
const updateWishlist = catchAsync(async (req, res, next) => {
  const { products } = req.body;
  const getWishlist = await Wishlist.findOne({ owner: req.user.id });
  if (!getWishlist) {
    const newWishlist = new Wishlist({ owner: req.user.id });
    products.forEach(item => {
      newWishlist.products.push(item._id);
    });
    const wishlist = await newWishlist.save();
    res.json(wishlist);
  } else {
    getWishlist.products = [];
    products.forEach(item => {
      getWishlist.products.push(item._id);
    });
    const savedWishlist = await getWishlist.save();
    const returnedWishlist = await Wishlist.findById(savedWishlist._id).populate('products');
    res.json(returnedWishlist);
  }
});

// Remove All Wishlist
const removeAllWishlist = catchAsync(async (req, res, next) => {
  const getWishlist = await Wishlist.findOne({ owner: req.user.id });
  if (!getWishlist) return next(new expressError('Wishlist Not Found', 404));
  getWishlist.products = [];
  const saveWishlist = await getWishlist.save();
  res.json(saveWishlist);
});

module.exports = {
  getWishlist,
  updateWishlist,
  removeAllWishlist
};
