const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true
    },
    eventInformation: {
      type: String,
      required: true
    },
    isPaid: {
      type: Boolean,
      required: true
    },

    country: {
      type: String,
      required: true
    },

    registrationLink: String,
    picture: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)



module.exports = mongoose.model('Event', eventSchema)
