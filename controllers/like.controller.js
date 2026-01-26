const express = require('express')
const Like = require('../models/Like')
const Event = require('../models/Event')
const protect = require('../middlewares/auth.middleware')

const router = express.Router()


router.post('/:eventId', protect, async (req, res) => {
  const { eventId } = req.params

  const event = await Event.findById(eventId)
  if (!event) {
    return res.status(404).json({ message: 'Event not found' })
  }

  const existingLike = await Like.findOne({
    userId: req.user._id,
    eventId
  })

  if (existingLike) {
    await existingLike.deleteOne()
    return res.json({ liked: false })
  }

  await Like.create({
    userId: req.user._id,
    eventId
  })

  res.json({ liked: true })
})


router.get('/:eventId', async (req, res) => {
  const count = await Like.countDocuments({ eventId: req.params.eventId })
  res.json({ count })
})

module.exports = router
