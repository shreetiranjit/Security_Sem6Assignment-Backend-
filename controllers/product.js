// External dependencies
const mongoId = require('mongoose').Types.ObjectId
const moment = require('moment')

// Internal dependencies
const Product = require('../models/product')
const Review = require('../models/review')
const Wishlist = require('../models/wishlist')
const Cart = require('../models/cart')
const Order = require('../models/orders')
const expressError = require('../utils/expressError')
const catchAsync = require('../utils/catchAsync')
const emailSender = require('../utils/emailSender')

// Create New Product
const createProduct = catchAsync(async (req, res, next) => {
  const {
    title,
    price,
    description,
    stock,
    category,
    subCategory,
    brand,
    colors,
    location,
    // coordinate
  } = req.body
  if (
    // !coordinate ||
    !title ||
    !price ||
    !description ||
    !stock ||
    !category ||
    !subCategory ||
    !brand ||
    !colors ||
    !location
  )
    return next(new expressError('Fill All Fields', 400))

  if (price > 99999999) {
    return next(new expressError('Price must be less than Rs.99999999', 400))
  }

  const newProduct = new Product(req.body)
  // newProduct.coordinate = coordinate.split(',');
  if (req.files) {
    newProduct.images = req.files.map(f => ({
      url: f.path,
      filename: f.filename,
    }))
  }
  newProduct.shop = req.shop.id
  const product = await newProduct.save()
  res.status(201).json(product)
})

// Update Product
const updateProduct = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.params.id)) return next(new expressError('Enter Valid Id.', 400))

  if (
    !req.body.title ||
    !req.body.price ||
    !req.body.description ||
    !req.body.stock ||
    !req.body.brand ||
    !req.body.colors ||
    !req.body.location ||
    // !req.body.coordinate ||
    !req.body.category ||
    !req.body.subCategory
  ) {
    return next(new expressError('Fill all fields', 400))
  }

  const getProduct = await Product.findById(req.params.id)
  if (!getProduct) return next(new expressError('Product Not Found', 404))
  if (getProduct.shop == req.shop.id) {
    let newImages = []
    let oldImages = []

    if (req.body.oldImages && req.body.oldImages.length > 0) {
      oldImages = req.body.oldImages
    }
    if (req.files && req.files.length > 0) {
      newImages = req.files.map(f => ({
        url: f.path,
        filename: f.filename,
      }))
    }

    const combinedImages = [].concat(newImages, JSON.parse(oldImages))

    getProduct.images = combinedImages.map(f => ({
      url: f.url,
      filename: f.filename,
    }))
    // getProduct.coordinate = req.body.coordinate.split(',');

    if (parseFloat(getProduct.price) !== parseFloat(req.body.price)) {
      getProduct.price = req.body.price
    }
    await getProduct.save()

    const editProduct = await Product.findByIdAndUpdate(
      getProduct._id,
      {
        title: req.body.title,
        description: req.body.description,
        stock: req.body.stock,
        brand: req.body.brand,
        colors: req.body.colors,
        location: req.body.location,
        category: req.body.category,
        subCategory: req.body.subCategory,
      },
      { new: true }
    )
    res.status(200).json(editProduct)
  } else {
    next(new expressError('You Are Not Owner Of This Product.', 403))
  }
})

// Get Product By Id
const getProductById = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.params.id)) return next(new expressError('Enter Valid Id.', 400))
  const getProduct = await Product.findById(req.params.id).populate('shop')
  if (!getProduct) return next(new expressError('Product Not Found', 404))
  const getWishlistCount = await Wishlist.find({
    products: { $in: [getProduct._id] },
  })
  res.json({
    Product: getProduct,
    wishlistCount: getWishlistCount.length,
  })
})

// Price Converter
const priceConverter = number => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })

  return formatter.format(number)
}

// Delete Product
const deleteProduct = catchAsync(async (req, res, next) => {
  if (!mongoId.isValid(req.params.id)) return next(new expressError('Enter Valid Id.', 400))

  const getProduct = await Product.findById(req.params.id)
  if (!getProduct) return next(new expressError('Product Not Found', 404))

  if (getProduct.shop == req.shop.id) {
    const getOrder = await Order.find({
      $and: [{ seller: req.shop.id }, { 'Product.product': req.params.id }],
    })

    if (getOrder.length < 1) {
      await Cart.updateMany({ $pull: { items: { product: req.params.id } } })
      await Product.deleteOne({ _id: req.params.id })
      await Review.deleteMany({ productId: req.params.id })
      await Wishlist.updateMany({ $pull: { products: req.params.id } })
    } else {
      let firstEmail = {
        from: process.env.SMTP_EMAIL_USER,
        subject: 'One Of The Product That You Ordered Has Deleted By The Seller',
        html: `<div style="margin:auto;background:white;border:1px solid #dedede;width:400px;padding:20px">
          <h1>One of the product that you ordered has deleted by the seller.</h1>
          <p>${getProduct.title} that you have ordered has been deleted by the seller. You paid ${priceConverter(
          getProduct.price
        )} for this product. You will be refunded.</p>
       `,
      }
      let secondEmail = { ...firstEmail }

      for (let item of getOrder) {
        const getSpecificOrder = await Order.findOne({ groupId: item.groupId })
        getSpecificOrder.note =
          getProduct.title + " Has been deleted by the seller. You've been refunded. You will only receive the product(s) remaining."
        await getSpecificOrder.save()
        await item.remove()

        if (item.billingAddress.email === item.deliveryAddress.email) {
          emailSender.sendMail(
            {
              ...firstEmail,
              to: item.billingAddress.email,
              html:
                firstEmail.html +
                `  You paid ${priceConverter(item.totalAmount)} for the whole order, on ${moment(item.createdAt).format('ll')}.
                <p>You will get refunded ${priceConverter(getProduct.price)}</p>
                <hr />
                <h3 style="text-align:center">Shreeti Store</h3>
                <p style="text-align:center; font-size:11px;">Shreeti Store</p>
              </div>`,
            },
            () => emailSender.close()
          )
        } else {
          emailSender.sendMail(
            {
              ...firstEmail,
              to: item.billingAddress.email,
              html:
                firstEmail.html +
                `  You paid ${priceConverter(item.totalAmount)} for the whole order, on ${moment(item.createdAt).format('ll')}.
                <p>You will get refunded ${priceConverter(getProduct.price)}</p>
              <hr />
              <h3 style="text-align:center">Shreeti Store</h3>
              <p style="text-align:center; font-size:11px;">Shreeti Store</p>
            </div>`,
            },
            () => emailSender.close()
          )
          emailSender.sendMail(
            {
              ...secondEmail,
              to: item.deliveryAddress.email,
              html:
                secondEmail.html +
                `  You paid ${priceConverter(item.totalAmount)} for the whole order, on ${moment(item.createdAt).format('ll')}.
                <p>You will get refunded ${priceConverter(getProduct.price)}</p>
              <hr />
              <h3 style="text-align:center">Shreeti Store</h3>
              <p style="text-align:center; font-size:11px;">Shreeti Store</p>
            </div>`,
            },
            () => emailSender.close()
          )
        }
      }
    }

    await Cart.updateMany({ $pull: { items: { product: req.params.id } } })
    await Product.deleteOne({ _id: req.params.id })
    await Review.deleteMany({ productId: req.params.id })
    await Wishlist.updateMany({ $pull: { products: req.params.id } })
    return res.json('Product Deleted')
  }
  return next(new expressError('You Are Not Owner Of This Product.', 403))
})

// Get All Products of current shop
const getSellerAllProducts = catchAsync(async (req, res) => {
  const shop = req.shop.id
  const getAllProducts = await Product.find({ shop })
  let productData = []

  for (let item of getAllProducts) {
    const getWishlistCount = await Wishlist.find({
      products: { $in: [item._id] },
    })
    const getOrders = await Order.find({ 'Product.product': item._id })
    productData.push({
      item,
      ordersCount: getOrders.length,
      wishlistCount: getWishlistCount.length,
    })
  }

  res.status(200).json(productData)
})

// Escape Regex
function escapeRegex(text) {
  return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

// Search Product
const searchProduct = catchAsync(async (req, res, next) => {
  const query = req.params.searchQuery
  const regex = new RegExp(escapeRegex(query), 'gi')
  let results = { products: [], brands: [] }

  if (String(query.length)) {
    const findProducts = await Product.find({ title: regex }).populate('shop')
    const findBrands = await Product.find({ brand: regex }).populate('shop')

    findProducts.forEach(item => {
      results.products.push(item)
    })

    findBrands.forEach(item => {
      results.brands.push(item)
    })

    res.status(200).json(results)
  } else {
    return next(new expressError('You can not search empty text', 400))
  }
})

// Get Product By Category
const getProductByCategory = catchAsync(async (req, res) => {
  const category = req.params.category
  const products = await Product.find({ category })
    .sort({
      rating: -1,
      createdAt: -1,
    })
    .populate('shop')
  res.status(200).json(products)
})

// Get Product By SubCategory
const getProductBySubCategory = catchAsync(async (req, res) => {
  const { category, subCategory } = req.params
  const products = await Product.find({
    $and: [{ category }, { subCategory }],
  })
    .sort({ createdAt: 'desc', rating: 'desc' })
    .populate('shop')
  res.status(200).json(products)
})

// Export
module.exports = {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerAllProducts,
  searchProduct,
  getProductByCategory,
  getProductBySubCategory,
}
