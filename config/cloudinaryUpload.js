// External Dependencies
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')

// Internal Dependencies
const { CLOUDINARY } = require('../config/keys')

cloudinary.config({
  cloud_name: CLOUDINARY.CLOUD_NAME,
  api_key: CLOUDINARY.API_KEY,
  api_secret: CLOUDINARY.API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'ShreetiStore',
    allowed_formats: ['jpeg', 'png', 'jpg'],
  },
})

module.exports = { cloudinary, storage }
