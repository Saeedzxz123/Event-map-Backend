const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const adminConfig = require('../config/admin')
const upload = require('../middlewares/upload.middleware')
const cloudinary = require('../config/cloudinary')
require('dotenv').config()

const router = express.Router()



function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      isAdmin: user.isAdmin
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}



router.post(
  '/register',
  upload.single('profilePhoto'),
  async (req, res) => {
    try {
      const { username, password } = req.body

      if (!username || !password) {
        return res
          .status(400)
          .json({ message: 'Username and password are required' })
      }

      const userExists = await User.findOne({ username })
      if (userExists) {
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

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

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
    } catch (error) {
      res.status(500).json({ message: 'Registration failed' })
    }
  }
)



router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body


    if (
      username === adminConfig.ADMIN_USERNAME &&
      password === adminConfig.ADMIN_PASSWORD
    ) {
      const adminToken = jwt.sign(
        { isAdmin: true },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )

      return res.json({
        username: adminConfig.ADMIN_USERNAME,
        isAdmin: true,
        token: adminToken
      })
    }


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
  } catch (error) {
    res.status(500).json({ message: 'Login failed' })
  }
})



router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.isAdmin) {
      return res.json({
        username: adminConfig.ADMIN_USERNAME,
        isAdmin: true
      })
    }

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    res.status(401).json({ message: 'Token invalid' })
  }
})

module.exports = router
