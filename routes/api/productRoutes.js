// External Dependencies
const express = require('express');
const multer = require('multer');

// Internal Dependencies
const { isShop } = require('../../middlewares/isAuth');
const { storage } = require('../../config/cloudinaryUpload');
const productController = require('../../controllers/product');

// Router
const Router = express.Router();

// Upload Image Setup
const upload = multer({ storage });

/*
 * @route   POST /new
 * @desc    Create Product
 * @access  Public
 */
Router.post('/new', isShop, upload.array('images'), productController.createProduct);

/*
 * @route   PUT /:id
 * @desc    Update Product
 * @access  Private
 */
Router.put('/:id', isShop, upload.array('images'), productController.updateProduct);

/*
 * @route   GET /:id
 * @desc    Get Product By Id
 * @access  Public
 */
Router.get('/:id', productController.getProductById);

/*
 * @route   DELETE /:id
 * @desc    Delete Product Route
 * @access  Private
 */
Router.delete('/:id', isShop, productController.deleteProduct);

/*
 * @route   GET /products/all
 * @desc    Get All Products of current shop
 * @access  Private
 */
Router.get('/products/all', isShop, productController.getSellerAllProducts);

/*
 * @route   GET /search/:searchQuery
 * @desc    Search Products
 * @access  Public
 */
Router.get('/search/:searchQuery', productController.searchProduct);

/*
 * @route   GET /category/:category
 * @desc    Get Products By Category
 * @access  Public
 */
Router.get('/category/:category', productController.getProductByCategory);

/*
 * @route   GET /category/:category/subcategory/:subCategory
 * @desc    Get Products By Sub Category
 * @access  Public
 */
Router.get(
  '/category/:category/subcategory/:subCategory',
  productController.getProductBySubCategory
);

module.exports = Router;
