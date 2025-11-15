const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')
const i18n = require('./config/i18n')  

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



// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/diseases', require('./routes/diseases'))
app.use('/api/logs', require('./routes/logs'))
app.use('/api/users', require('./routes/users'))
app.use('/api/special-cases', require('./routes/specialCases'));

// Global error handler
app.use(require('./utils/errorHandler'))

app.get('/', (req, res) => res.send('Online Clinic API is running!'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))