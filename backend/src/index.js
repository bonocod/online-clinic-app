//backend/src/index.js
const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const i18n = require('./config/i18n')
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');

dotenv.config()
connectDB()
const app = express()
app.use(cors())
app.use(express.json())
app.use(i18n.init)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("JWT_SECRET used:", process.env.JWT_SECRET);
  next();
});
// Serve static files for uploads
// Serve static files for uploads
// ... (rest same)
// Serve static files for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/uploads/posts', express.static(path.join(process.cwd(), 'uploads/posts')));
// ... (rest same)
// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/diseases', require('./routes/diseases'))
app.use('/api/logs', require('./routes/logs'))
app.use('/api/users', require('./routes/users'))
app.use('/api/forum', require('./routes/forum'));
// Socket.io setup
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);
io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});
// Global error handler
app.use(require('./utils/errorHandler'))
app.get('/', (req, res) => res.send('Online Clinic API is running!'))
const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))