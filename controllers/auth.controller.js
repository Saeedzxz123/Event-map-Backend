const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const upload = require('../middlewares/upload.middleware')
const cloudinary = require('../config/cloudinary')
const protect = require('../middlewares/auth.middleware')
const sendEmail = require('../utils/sendEmail')
const generateOtp = require('../utils/generateOpt')
const sendOtpEmail = require('../utils/sendOtpEmail')

const router = express.Router()


const generateToken = user =>
  jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )


  router.post('/register', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' })
    }

    const userExists = await User.findOne({ $or: [{ username }, { email }] })
    if (userExists) {
      return res.status(400).json({ message: 'Username or email already exists' })
    }


    let profilePhotoUrl = null
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'users' },
          (error, result) => (error ? reject(error) : resolve(result))
        )
        stream.end(req.file.buffer)
      })
      profilePhotoUrl = result.secure_url
    }

    const hashedPassword = await bcrypt.hash(password, 10)


    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      profilePhoto: profilePhotoUrl,
      isVerified: false
    })


    const otp = generateOtp()
    const hashedOtp = await bcrypt.hash(otp, 10)
    user.otp = hashedOtp
    user.otpExpires = Date.now() + 600000 
    await user.save()


    await sendOtpEmail(email, otp)

    res.status(201).json({
      message: 'Registration successful! Please verify your email using the OTP sent.',
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto,
      isAdmin: user.isAdmin
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Registration failed' })
  }
})


router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body
    if (!identifier || !password) {
      return res.status(400).json({ 
        message: 'Username/email and password are required' })
    }

    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] })
    if (!user) return res.status(401).json({ 
      message: 'Invalid credentials' })

    
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ 
      message: 'Invalid credentials' })

    
    if (!user.isVerified) return res.status(401).json({ 
      message: 'Please verify your email first' })

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto,
      isAdmin: user.isAdmin,
      token: generateToken(user)
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Login failed' })
  }
})


router.get('/me', protect, async (req, res) => {
  res.json(req.user)
})

// ===================== SEND OTP =====================
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })

    const otp = generateOtp()
    const hashedOtp = await bcrypt.hash(otp, 10)

    user.otp = hashedOtp
    user.otpExpires = Date.now() + 600000 
    await user.save()

    await sendOtpEmail(email, otp)

    res.json({ message: 'OTP sent to email' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to send OTP' })
  }
})

// ===================== VERIFY OTP =====================
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({
      message: 'Email and OTP are required' })

    const user = await User.findOne({ email })
    if (!user || !user.otp) return res.status(400).json({
      message: 'Invalid OTP' })

    if (user.otpExpires < Date.now()) return res.status(400).json({
      message: 'OTP expired' })

    const isValid = await bcrypt.compare(otp, user.otp)
    if (!isValid) return res.status(400).json({ 
      message: 'Invalid OTP' })


    user.isVerified = true
    user.otp = undefined
    user.otpExpires = undefined
    await user.save()

    res.json({ message: 'OTP verified successfully! You can now log in.' })
  } 
  catch (error) {
    console.error(error)
    res.status(500).json({ message: 'OTP verification failed' })
  }
})

module.exports = router
