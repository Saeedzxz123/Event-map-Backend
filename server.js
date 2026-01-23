require('dotenv').config()
const express = require('express')


connectDB()

// Middleware
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Event API running 🚀')
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
})
