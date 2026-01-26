const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const upload = require('../middlewares/upload.middleware')
const cloudinary = require('../config/cloudinary')
const protect = require('../middlewares/auth.middleware')

const router = express.Router()

const generateToken = user =>
  jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

router.post('/register', upload.single('profilePhoto'), async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  const exists = await User.findOne({ username })
  if (exists) {
    return res.status(400).json({ message: 'Username already exists' })
  }

  let profilePhotoUrl = null

  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'users' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(req.file.buffer)
    })
    profilePhotoUrl = result.secure_url
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await User.create({
    username,
    password: hashedPassword,
    profilePhoto: profilePhotoUrl
  })

  res.status(201).json({
    _id: user._id,
    username: user.username,
    profilePhoto: user.profilePhoto,
    isAdmin: user.isAdmin,
    token: generateToken(user)
  })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  const user = await User.findOne({ username })
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  res.json({
    _id: user._id,
    username: user.username,
    profilePhoto: user.profilePhoto,
    isAdmin: user.isAdmin,
    token: generateToken(user)
  })
})

router.get('/me', protect, async (req, res) => {
  res.json(req.user)
})

module.exports = router
