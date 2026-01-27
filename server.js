require ('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const cors = require('cors')

const app = express()

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
)

connectDB()

app.use(express.json())

app.use('/auth', require('./controllers/auth.controller'))
app.use('/events', require('./controllers/event.controller'))
app.use('/comments', require('./controllers/comment.controller'))
app.use('/likes', require('./controllers/like.controller'))


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
