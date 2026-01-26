const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    profilePhoto: {
      type: String,
      default: null
    },
    email: {
  type: String,
  required: true,
  unique: true
},
    otp: String,
    otpExpires: Date,
    
    bio: String
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
