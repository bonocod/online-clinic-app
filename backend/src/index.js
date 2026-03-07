const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const http = require('http')
const path = require('path')
const jwt = require('jsonwebtoken')
const { Server } = require('socket.io')
const cloudinary = require('cloudinary').v2

const connectDB = require('./config/db')
const i18n = require('./config/i18n')
const User = require('./models/User')

dotenv.config()
connectDB()

const app = express()

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(i18n.init)

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

app.use('/uploads/posts', express.static(path.join(process.cwd(), 'uploads/posts')))
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/diseases', require('./routes/diseases'))
app.use('/api/users', require('./routes/users'))
app.use('/api/forum', require('./routes/forumExtras'))
app.use('/api/forum', require('./routes/forum'))
app.use('/api/professional', require('./routes/professional'))
app.use('/api/behaviors', require('./routes/behaviors'))
app.use('/api/categories', require('./routes/categories'))
app.use('/api/videos', require('./routes/videos'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/notifications', require('./routes/notifications'))

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
})

app.set('io', io)
app.set('liveSessionTimers', new Map())

const joinRoleRooms = (socket, user) => {
  if (!user?._id) return

  const userId = user._id.toString()
  socket.join(`user_${userId}`)
  socket.data.userId = userId
  socket.data.role = user.role

  if (user.isAdmin || user.role === 'admin') {
    socket.join('admin')
  }

  if (['doctor', 'chw'].includes(user.role) && user.verified) {
    socket.join('professionals')
  }

  if (user.role === 'doctor' && user.verified) {
    socket.join('doctors')
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('auth', async ({ token } = {}) => {
    try {
      if (!token) return
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select('role verified isAdmin')
      if (!user) return
      joinRoleRooms(socket, user)
      socket.emit('auth:ok', {
        userId: user._id.toString(),
        role: user.role,
        verified: !!user.verified,
        isAdmin: !!user.isAdmin,
      })
    } catch (e) {
      socket.emit('auth:error', { msg: 'Invalid socket auth token' })
    }
  })

  socket.on('joinGroup', (groupId) => socket.join(String(groupId)))
  socket.on('leaveGroup', (groupId) => socket.leave(String(groupId)))

  socket.on('joinCircle', (circleId) => socket.join(`circle_${circleId}`))
  socket.on('leaveCircle', (circleId) => socket.leave(`circle_${circleId}`))

  socket.on('joinLiveSession', (sessionId) => socket.join(`live_${sessionId}`))
  socket.on('leaveLiveSession', (sessionId) => socket.leave(`live_${sessionId}`))

  socket.on('joinCategory', (categoryId) => socket.join(`category_${categoryId}`))
  socket.on('leaveCategory', (categoryId) => socket.leave(`category_${categoryId}`))

  socket.on('joinDiscussion', (discussionId) => socket.join(`discussion_${discussionId}`))
  socket.on('leaveDiscussion', (discussionId) => socket.leave(`discussion_${discussionId}`))

  socket.on('joinPost', (postId) => socket.join(`post_${postId}`))
  socket.on('leavePost', (postId) => socket.leave(`post_${postId}`))

  socket.on('joinAdmin', () => socket.join('admin'))
  socket.on('leaveAdmin', () => socket.leave('admin'))

  socket.on('joinProfessionals', () => socket.join('professionals'))
  socket.on('leaveProfessionals', () => socket.leave('professionals'))

  socket.on('joinDoctors', () => socket.join('doctors'))
  socket.on('leaveDoctors', () => socket.leave('doctors'))

  socket.on('joinUser', (userId) => {
    if (!userId) return
    socket.join(`user_${String(userId)}`)
    socket.data.userId = String(userId)
  })

  socket.on('leaveUser', (userId) => {
    if (!userId) return
    socket.leave(`user_${String(userId)}`)
    if (socket.data.userId === String(userId)) socket.data.userId = null
  })

  socket.on('disconnect', () => {
    console.log(
      'User disconnected:',
      socket.id,
      socket.data?.userId ? `(user_${socket.data.userId})` : ''
    )
  })
})

app.use(require('./utils/errorHandler'))
app.get('/', (req, res) => res.send('Online Clinic API is running!'))

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))