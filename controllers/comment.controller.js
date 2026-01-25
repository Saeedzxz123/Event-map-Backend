const express = require('express')
const Comment = require('../models/Comment')
const Event = require('../models/Event')
const protect = require('../middlewares/auth.middleware')

const router = express.Router()


router.post('/:eventId', protect, async (req, res) => {
  const { text } = req.body
  const { eventId } = req.params

  if (!text) {
    return res.status(400).json({ message: 'Comment text is required' })
  }

  const event = await Event.findById(eventId)
  if (!event) {
    return res.status(404).json({ message: 'Event not found' })
  }

  const comment = await Comment.create({
    text,
    user: req.user._id,
    event: eventId
  })

  res.status(201).json(comment)
})


// GET COMMENTS FOR EVENT
router.get('/:eventId', async (req, res) => {
  const comments = await Comment.find({ event: req.params.eventId })
    .populate('user', 'username profilePhoto')
    .sort({ createdAt: -1 })

  res.json(comments)
})



router.delete('/:commentId', protect, async (req, res) => {
  const comment = await Comment.findById(req.params.commentId)
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' })
  }

  if (
    !req.user.isAdmin &&
    !comment.user.equals(req.user._id)
  ) {
    return res.status(403).json({ message: 'Not allowed' })
  }

  await comment.deleteOne()
  res.json({ message: 'Comment deleted' })
})

module.exports = router
