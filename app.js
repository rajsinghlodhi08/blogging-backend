const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const connectDatabase = require('./db')

const appRoutes = require('./routes/app.route')
connectDatabase()

const corsOptions = {
    origin: function (origin, callback) {
        if (
            !origin ||
            origin === 'http://localhost:4200'
        ) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    credentials: true // Enable if you need to support credentials
}

app.use(cors(corsOptions))


// Middleware to parse JSON
app.use(express.json())
app.use('/api', appRoutes)

const PORT = process.env.PORT || 8080

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})