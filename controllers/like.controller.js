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
    user: req.user._id,
    event: eventId
  })


  if (existingLike) {
    await existingLike.deleteOne()
    return res.json({ liked: false })
  }


  await Like.create({
    user: req.user._id,
    event: eventId
  })

  res.json({ liked: true })
})



router.get('/:eventId', async (req, res) => {
  const count = await Like.countDocuments({ event: req.params.eventId })
  res.json({ count })
})

module.exports = router
