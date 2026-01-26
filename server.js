require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')

const app = express()

connectDB()

app.use(express.json())

app.use('/auth', require('./controllers/auth.controller'))
app.use('/events', require('./controllers/event.controller'))
app.use('/comments', require('./controllers/comment.controller'))
app.use('/likes', require('./controllers/like.controller'))

app.get('/', (req, res) => {
  res.send('Event API running')
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
