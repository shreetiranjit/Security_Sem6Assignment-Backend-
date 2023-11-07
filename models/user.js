// External Dependencies
const mongoose = require('mongoose')

// Image Schema
const imageSchema = new mongoose.Schema({
  url: String,
  filename: String,
})
imageSchema.virtual('thumbnail').get(function () {
  return this.url.replace('/upload', '/upload/w_150')
})

// User Schema (Model)
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      max: 30,
      unique: true,
      required: true,
    },
    profilePhoto: imageSchema,
    hasPhoto: { type: Boolean, default: false },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    passwordHistory: [{ type: String }],
    passwordChangedAt: { type: Date },
    //otp
    otp: { type: String },
    //otp expiry
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },
    resetPassword: {
      token: String,
      expiration: Date,
    },
    //attemopt to login
    loginAttempts: {
      type: Number,
      default: 0,
    },
    //accounc locked
    lockUntil: {
      type: Number,
    },
  },
  { timestamps: true }
)

// User Model
const User = mongoose.model('User', userSchema)

// Export User Model
module.exports = User
