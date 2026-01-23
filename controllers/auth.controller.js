const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const generateToken = require('../utils/jwt')
const ADMIN = require('../config/admin')

const router = express.Router()

router.post('/register', async (req, res) => {
  const { username, password } = req.body

  const exists = await User.findOne({ username })
  if (exists) {
    return res.status(400).json({ message: 'User already exists' })}

  const hashed = await bcrypt.hash(password, 10)

  const user = await User.create({
    username,
    password: hashed
  })

  res.json({
    token: generateToken(user),
    user: { id: user._id, username: user.username }
  })
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  if (username === ADMIN.ADMIN_USERNAME) {
    if (password !== ADMIN.ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin credentials' })
    }

    let admin = await User.findOne({ username })
    if (!admin) {
      admin = await User.create({
        username,
        password: await bcrypt.hash(password, 10),
        isAdmin: true
      })
    }

    return res.json({
    token: generateToken(admin),
    user: {
        id: admin._id,
        username: admin.username,
        isAdmin: true
    } })
  }

  const user = await User.findOne({ username })
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  res.json({
    token: generateToken(user),
    user: { id: user._id, username: user.username }
  })
})

module.exports = router
