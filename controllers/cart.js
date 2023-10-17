// Internal Dependencies
const Cart = require('../models/cart');
const Product = require('../models/product');
const expressError = require('../utils/expressError');
const catchAsync = require('../utils/catchAsync');

// Get Cart of a user
const getUserCart = catchAsync(async (req, res, next) => {
  const getCart = await Cart.findOne({ user: req.user.id }).populate('items.product');
  if (!getCart) return next(new expressError('Cart Not Found.', 404));
  if (getCart.user == req.user.id) return res.json(getCart);
  return next(new expressError('You Are Not Owner Of This Card.', 403));
});

// Add Product to Cart
const updateCart = catchAsync(async (req, res, next) => {
  const getCart = await Cart.findOne({ user: req.user.id });
  const { products } = req.body;
  if (!getCart) {
    const newCart = await new Cart({
      user: req.user.id
    });
    products.forEach(item => {
      newCart.items.push({
        product: item.product,
        seller: item.seller,
        color: item.color,
        quantity: item.qty,
        selected: item.selected
      });
    });
    const saveCart = await newCart.save();
    return res.json(saveCart);
  }
  getCart.items = [];

  products.forEach(item => {
    getCart.items.push({
      product: item.product,
      seller: item.seller,
      color: item.color,
      quantity: item.qty,
      selected: item.selected
    });
  });
  const savedCart = await getCart.save();
  const returnedCart = await Cart.findById(savedCart._id).populate('items.product');
  res.json(returnedCart);
});

// Get Cart of Unauthorized User
const getCartUnauthorized = catchAsync(async (req, res, next) => {
  const Products = req.body.Products;

  let cart = { items: [] };

  for (let item of Products) {
    const getProduct = await Product.findById(item.product);
    if (getProduct) {
      cart.items.push({ ...item, product: getProduct, quantity: item.qty });
    }
  }

  res.status(200).json(cart);
});

// Remove All Cart
const removeAllCart = catchAsync(async (req, res, next) => {
  const getCart = await Cart.findOne({ user: req.user.id });
  if (!getCart) return next(new expressError('Cart Not Found', 404));
  getCart.items = [];
  const saveCart = await getCart.save();
  res.json(saveCart);
});

module.exports = {
  getUserCart,
  updateCart,
  getCartUnauthorized,
  removeAllCart
};
