const sendEmail = require('./sendEmail')

const sendOtpEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: 'Your EventMap OTP Code',
    html: `
    <h2>Your OTP Code</h2>
    <p>Use the code below to continue:</p>
    <h1 style="letter-spacing: 4px;">${otp}</h1>
    <p>This code expires in <strong>10 minutes</strong>.</p>
    `
  })
}

module.exports = sendOtpEmail
