// FILE: backend/src/index.js
const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const i18n = require('./config/i18n')
const http = require('http')
const { Server } = require('socket.io')
const path = require('path')
const cloudinary = require('cloudinary').v2

dotenv.config()
connectDB()

const app = express()
app.use(cors())
app.use(express.json())
app.use(i18n.init)

// Debug (keep if you want)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Serve static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
app.use('/uploads/posts', express.static(path.join(process.cwd(), 'uploads/posts')))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/diseases', require('./routes/diseases'))
app.use('/api/users', require('./routes/users'))

// Community Forum (updated)
app.use('/api/forum', require('./routes/forum'))

// Professional Console (new)
app.use('/api/professional', require('./routes/professional'))

app.use('/api/behaviors', require('./routes/behaviors'))

// Videos
app.use('/api/categories', require('./routes/categories'))
app.use('/api/videos', require('./routes/videos'))

// Admin routes (updated)
app.use('/api/admin', require('./routes/admin'))

// Socket.io setup
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })
app.set('io', io)

io.on('connection', (socket) => {
  console.log('User connected')

  socket.on('joinGroup', (groupId) => socket.join(groupId))
  socket.on('joinCircle', (circleId) => socket.join(`circle_${circleId}`))
  socket.on('joinLiveSession', (sessionId) => socket.join(`live_${sessionId}`))

  socket.on('disconnect', () => console.log('User disconnected'))
})

// Global error handler
app.use(require('./utils/errorHandler'))

app.get('/', (req, res) => res.send('Online Clinic API is running!'))

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))