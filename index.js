// External Dependencies
require('dotenv').config()
const express = require('express') // import express
const { PORT } = require('./config/keys')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const sanitize = require('express-mongo-sanitize')
const socket = require('socket.io')
const http = require('http')

// Internal Dependencies
require('./utils/connectdb') // Database Connection
const routes = require('./routes/index')

// Express App
const app = express()

// Middleware
app.use(cors())
app.use(helmet())
app.use(sanitize())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/', routes)

// Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  // console.log(err);
  if (!err.message) err.message = 'Something went wrong'
  res.status(statusCode).json({ statusCode, errorMessage: err.message })
})

const server = http.createServer(app)



server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

module.exports = { app, server }
