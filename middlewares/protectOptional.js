const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protectOptional = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null
    return next()
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch (err) {
    req.user = null
    next()
  }
}

module.exports = protectOptional

