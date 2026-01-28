 🎯 EventMap — Backend API

EventMap is a RESTful backend API built with Node.js, Express, and MongoDB that powers the EventMap platform.
It handles authentication, events, likes, comments, and user management.

   🚀 Features
 
 🔐 Authentication

User registration with email & username

OTP email verification

Login with username or email

JWT-based authentication

Role-based access (User / Admin)




👤 Users

User profiles

Optional profile photo

Public publisher information

Admin privileges



 
 📅 Events

Create, read, update, delete events

Each event belongs to a publisher (user)

Event image support

Country & entry fee tracking

Publisher data populated automatically


 ❤️ Likes

Like / unlike events

One like per user per event

Like count per event

 💬 Comments

Add comments to events

Edit & delete own comments

Admin can manage all comments

Comment author populated with username

 🧑‍💻 Tech Stack

Node.js

Express

MongoDB + Mongoose

JWT

bcrypt

Multer (file uploads)

Nodemailer (OTP emails)

dotenv

CORS




  🧠 Data Models

 👤 User

username

email

password

profilePhoto

isAdmin

isVerified

otp, otpExpires

 📅 Event

eventName

eventInformation

country

isPaid

registrationLink

picture

userId (ref → User)

 💬 Comment

content

userId (ref → User)

eventId (ref → Event)
 
 ❤️ Like

userId

eventId

 🔐 Authentication & Authorization

JWT is sent via:

Authorization: Bearer <token>


Middleware checks:

Logged-in user

Admin permissions

Ownership (event/comment owner)

 🔁 API Endpoints (Overview)
Auth
POST   /auth/register
POST   /auth/login
POST   /auth/verify-otp

Events
GET    /events
GET    /events/:id
POST   /events
PUT    /events/:id
DELETE /events/:id

Comments
GET    /comments/:eventId
POST   /comments/:eventId
PUT    /comments/:commentId
DELETE /comments/:commentId

Likes
GET    /likes/:eventId
POST   /likes/:eventId

 🖼 Image Uploads

Images handled via Multer

Stored locally (or extendable to cloud storage)

If no image exists, frontend displays a placeholder




 🔗 Frontend

This backend is used by the EventMap frontend built with React.

 ➡️ Frontend repo: [Frontend](https://github.com/Saeedzxz123/event-map-frontend)

 🧪 Future Improvements

Pagination for events & comments

Rate limiting

Cloud image storage (Cloudinary / S3)

User follow system

Notifications

Refresh tokens


 👨‍💻 Author

Saeed Sadeq