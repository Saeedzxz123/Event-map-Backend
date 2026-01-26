const express = require('express')
const Event = require('../models/Event')
const Comment = require('../models/Comments')
const Like = require('../models/Like')
const protect = require('../middlewares/auth.middleware')
const upload = require('../middlewares/upload.middleware')
const cloudinary = require('../config/cloudinary')

const router = express.Router()

router.get('/', async (req, res) => {
  const events = await Event.find().populate('userId', 'username')
  res.json(events)
})

router.get('/:id', async (req, res) => {
  const event = await Event.findById(req.params.id).populate('userId', 'username')
  if (!event) return res.status(404).json({ message: 'Event not found' })
  res.json(event)
})

router.post('/', protect, upload.single('picture'), async (req, res) => {
  let pictureUrl = null

  if (req.file) {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'events' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(req.file.buffer)
    })
    pictureUrl = result.secure_url
  }

  const event = await Event.create({
    ...req.body,
    userId: req.user._id,
    picture: pictureUrl
  })

  res.status(201).json(event)
})


router.put('/:id', protect, async (req, res) => {
  const event = await Event.findById(req.params.id)
  if (!event) return res.status(404).json({ message: 'Event not found' })

  if (!req.user.isAdmin && !event.userId.equals(req.user._id)) {
    return res.status(403).json({ message: 'Not allowed' })
  }

  Object.assign(event, req.body)
  await event.save()

  res.json(event)
})

router.delete('/:id', protect, async (req, res) => {
  const event = await Event.findById(req.params.id)
  if (!event) return res.status(404).json({ message: 'Event not found' })

  if (!req.user.isAdmin && !event.userId.equals(req.user._id)) {
    return res.status(403).json({ message: 'Not allowed' })
  }

  await Comment.deleteMany({ eventId: event._id })
  await Like.deleteMany({ eventId: event._id })
  await event.deleteOne()

  res.json({ message: 'Event deleted' })
})

module.exports = router
