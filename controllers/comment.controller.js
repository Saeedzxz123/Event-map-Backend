const express = require('express')
const Comment = require('../models/Comments')
const Event = require('../models/Event')
const protect = require('../middlewares/auth.middleware')

const router = express.Router()

router.post('/:eventId', protect, async (req, res) => {
  const { content } = req.body
  const { eventId } = req.params

  if (!content) {
    return res.status(400).json({ message: 'Comment content is required' })
  }

  const event = await Event.findById(eventId)
  if (!event) {
    return res.status(404).json({ message: 'Event not found' })
  }

  const comment = await Comment.create({
    content,
    userId: req.user._id,
    eventId
  })

  res.status(201).json(comment)
})

router.get('/:eventId', async (req, res) => {
  const comments = await Comment.find({ eventId: req.params.eventId })
    .populate('userId', 'username profilePhoto')
    .sort({ createdAt: -1 })

  res.json(comments)
})


router.put('/:commentId', protect, async (req, res) => {
  const comment = await Comment.findById(req.params.commentId)
  if (!comment) return res.status(404).json({ message: 'Comment not found' })

  if (!req.user.isAdmin && !comment.userId.equals(req.user._id)) {
    return res.status(403).json({ message: 'Not allowed' })
  }

  comment.content = req.body.content
  await comment.save()

  res.json(comment)
})


router.delete('/:commentId', protect, async (req, res) => {
  const comment = await Comment.findById(req.params.commentId)
  if (!comment) return res.status(404).json({ message: 'Comment not found' })

  if (!req.user.isAdmin && !comment.userId.equals(req.user._id)) {
    return res.status(403).json({ message: 'Not allowed' })
  }

  await comment.deleteOne()
  res.json({ message: 'Comment deleted' })
})

module.exports = router
